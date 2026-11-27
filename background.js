import { buildArchiveUrl, isArchiveHost } from './url.js';

const DEFAULT_SETTINGS = { mode: 'viewer', mirror: 'archive.ph', openIn: 'tab' };
const WEB_URL_PATTERNS = ['http://*/*', 'https://*/*'];
const badgeTimers = new Map();

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }

    chrome.contextMenus.create({
      id: 'archive-page',
      title: 'Open page in archive',
      contexts: ['page'],
      documentUrlPatterns: WEB_URL_PATTERNS
    });
    chrome.contextMenus.create({
      id: 'archive-link',
      title: 'Open link in archive',
      contexts: ['link'],
      documentUrlPatterns: WEB_URL_PATTERNS,
      targetUrlPatterns: WEB_URL_PATTERNS
    });
    chrome.contextMenus.create({
      id: 'archive-capture',
      title: 'Save a fresh snapshot of this page',
      contexts: ['page'],
      documentUrlPatterns: WEB_URL_PATTERNS
    });
  });
});

chrome.action.onClicked.addListener((tab) => openArchive(tab.url, tab));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab) return;

  const url = info.menuItemId === 'archive-link' ? info.linkUrl : info.pageUrl;
  const mode = info.menuItemId === 'archive-capture' ? 'capture' : undefined;
  return openArchive(url, tab, mode);
});

function canArchive(url) {
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === 'http:' || protocol === 'https:') && !isArchiveHost(hostname);
  } catch {
    return false;
  }
}

async function openArchive(url, tab, modeOverride) {
  if (!canArchive(url)) {
    showRejectedBadge(tab.id, "Can't archive this page");
    return;
  }

  try {
    const { mode, mirror, openIn } = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    const archiveUrl = buildArchiveUrl(url, modeOverride ?? mode, mirror);

    if (openIn === 'same') {
      await chrome.tabs.update(tab.id, { url: archiveUrl });
    } else {
      await chrome.tabs.create({
        url: archiveUrl,
        windowId: tab.windowId,
        index: tab.index + 1,
        openerTabId: tab.id,
        active: openIn !== 'background'
      });
    }
  } catch (error) {
    console.error(error);
    showRejectedBadge(tab.id, "Can't open the archive");
  }
}

function showRejectedBadge(tabId, title) {
  if (!Number.isInteger(tabId) || tabId < 0) return;
  clearTimeout(badgeTimers.get(tabId));
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#b91c1c' }).catch(console.error);
  chrome.action.setBadgeText({ tabId, text: '✕' }).catch(console.error);
  chrome.action.setTitle({ tabId, title }).catch(console.error);

  badgeTimers.set(tabId, setTimeout(() => {
    badgeTimers.delete(tabId);
    chrome.action.setBadgeText({ tabId, text: '' }).catch(console.error);
    chrome.action.setTitle({ tabId, title: chrome.runtime.getManifest().action.default_title }).catch(console.error);
  }, 1500));
}
