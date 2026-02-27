const DEFAULT_SETTINGS = {
  enabled: false,       // OFF by default — use right-click menu or toolbar button instead
  mode: 'viewer',       // 'viewer' or 'capture'
  onlyOnClicks: false,  // content.js interception also off by default
  exclusions: [],
  inclusions: []
};

const ARCHIVE_DOMAINS = [
  'archive.is',
  'archive.today',
  'archive.ph',
  'archive.fo',
  'archive.li',
  'archive.md',
  'archive.vn'
];

// --- Storage migrations ---
// Bump _schemaVersion here whenever defaults need to be force-corrected.
async function runMigrationsIfNeeded() {
  const { _schemaVersion } = await chrome.storage.sync.get('_schemaVersion');
  if (!_schemaVersion || _schemaVersion < 3) {
    // v3: Disable ALL automatic redirection. Extension should only work via
    // right-click context menu and toolbar button — no background redirects.
    await chrome.storage.sync.set({
      enabled: false,
      onlyOnClicks: false,
      _schemaVersion: 3
    });
  }
}

// --- Startup: Always run migrations and re-apply rules when service worker loads ---
// Called top-level to also handle extension reloads from the extensions page.
async function init() {
  await runMigrationsIfNeeded();
  await applyRulesFromStorage();
}
init();

chrome.runtime.onInstalled.addListener(async (details) => {
  // Always force-migrate onlyOnClicks to true for existing installs that had false.
  // This handles the case where old storage has the wrong default.
  if (details.reason === 'install') {
    // Fresh install: set all defaults
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  } else if (details.reason === 'update') {
    // Extension update: ensure onlyOnClicks is set to true if it was false (old default)
    // by merging missing keys from DEFAULT_SETTINGS but NOT overriding user choices
    // EXCEPT for the buggy old default value.
    const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
    const toSet = {};
    for (const key in DEFAULT_SETTINGS) {
      if (stored[key] === undefined) {
        toSet[key] = DEFAULT_SETTINGS[key];
      }
    }
    if (Object.keys(toSet).length > 0) {
      await chrome.storage.sync.set(toSet);
    }
  }

  setupContextMenus();
  await applyRulesFromStorage();
});

chrome.runtime.onStartup.addListener(async () => {
  setupContextMenus();
  await applyRulesFromStorage();
});

// --- Storage change listener: re-apply rules whenever anything changes ---
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync') {
    await applyRulesFromStorage();
  }
});

// --- Context Menus ---
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "archive-page",
      title: "Open this page via archive.is",
      contexts: ["page"]
    });
    chrome.contextMenus.create({
      id: "archive-link",
      title: "Open link via archive.is",
      contexts: ["link"]
    });
  });
}

chrome.contextMenus.onClicked.addListener((info) => {
  const url = info.linkUrl || info.pageUrl;
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    openWithArchive(url);
  }
});

// --- Toolbar button ---
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    openWithArchive(tab.url);
  }
});

async function openWithArchive(url) {
  const settings = await chrome.storage.sync.get(['mode']);
  const mode = settings.mode || 'viewer';
  const archiveUrl = buildArchiveUrl(url, mode);
  chrome.tabs.create({ url: archiveUrl });
}

function buildArchiveUrl(url, mode) {
  const encodedUrl = encodeURIComponent(url);
  if (mode === 'capture') {
    return `https://archive.is/?run=1&url=${encodedUrl}`;
  }
  return `https://archive.is/${encodedUrl}`;
}

// --- Core: read settings from storage and update DNR rules accordingly ---
async function applyRulesFromStorage() {
  const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  // Fill in any missing keys with defaults (safe merge)
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  await updateRedirectionRules(settings);
}

async function updateRedirectionRules(settings) {
  const { enabled, onlyOnClicks, exclusions, inclusions, mode } = settings;

  // Always start by removing any existing dynamic rule
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1]
  });

  // If auto-redirect is disabled or click-only mode, stop here (no active DNR rule)
  if (!enabled || onlyOnClicks) {
    return;
  }

  // Build the exclusion domain list (archive domains + user list)
  const exclusionList = [
    ...ARCHIVE_DOMAINS,
    ...(exclusions || [])
  ];

  const rule = {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        regexSubstitution: mode === 'capture'
          ? "https://archive.is/?run=1&url=\\0"
          : "https://archive.is/\\0"
      }
    },
    condition: {
      regexFilter: "^https?://.*",
      resourceTypes: ["main_frame"],
      excludedRequestDomains: exclusionList
    }
  };

  // If an inclusion list is set, only redirect those specific domains
  if (inclusions && inclusions.length > 0) {
    rule.condition.requestDomains = inclusions;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [rule]
  });
}

// --- Message listener: handles on-click redirect requests from content.js ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REDIRECT_REQUEST') {
    const url = message.url;
    // Guard: do not redirect archive domains
    try {
      const hostname = new URL(url).hostname;
      const isArchive = ARCHIVE_DOMAINS.some(d =>
        hostname === d || hostname.endsWith('.' + d)
      );
      if (isArchive) return;
    } catch (e) {
      return;
    }
    openWithArchive(url);
  }
});
