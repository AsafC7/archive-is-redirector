const form = document.querySelector('#settings');
const status = document.querySelector('#status');
const shortcut = document.querySelector('#shortcut');
let statusTimer;

async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(['mode', 'mirror', 'openIn']);
    for (const [name, value] of Object.entries(settings)) {
      form.elements.namedItem(name).value = value;
    }
  } catch {
    showStatus('Could not load settings');
  } finally {
    form.inert = false;
  }
}

function showStatus(message) {
  clearTimeout(statusTimer);
  status.textContent = message;
  if (message === 'Saved') {
    statusTimer = setTimeout(() => { status.textContent = ''; }, 1500);
  }
}

form.addEventListener('change', async ({ target }) => {
  try {
    await chrome.storage.sync.set({ [target.name]: target.value });
    showStatus('Saved');
  } catch {
    showStatus('Could not save');
  }
});

async function updateShortcut() {
  try {
    const commands = await chrome.commands.getAll();
    shortcut.textContent = commands.find(({ name }) => name === '_execute_action')?.shortcut || 'Not set';
  } catch {
    shortcut.textContent = 'Unavailable';
  }
}

document.querySelector('#edit-shortcut').addEventListener('click', async () => {
  try {
    await chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  } catch {
    showStatus('Could not open shortcuts');
  }
});

window.addEventListener('focus', updateShortcut);
loadSettings();
updateShortcut();
