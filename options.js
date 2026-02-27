// options.js

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    enabled: document.getElementById('enabled'),
    mode: document.getElementById('mode'),
    onlyOnClicks: document.getElementById('onlyOnClicks'),
    exclusions: document.getElementById('exclusions'),
    inclusions: document.getElementById('inclusions'),
    saveBtn: document.getElementById('save'),
    status: document.getElementById('status')
  };

  // Load current settings from storage
  const settings = await chrome.storage.sync.get([
    'enabled', 'mode', 'onlyOnClicks', 'exclusions', 'inclusions'
  ]);

  elements.enabled.checked = settings.enabled !== false; // Default: true
  elements.onlyOnClicks.checked = settings.onlyOnClicks !== false; // Default: true
  elements.mode.value = settings.mode || 'viewer';
  elements.exclusions.value = (settings.exclusions || []).join('\n');
  elements.inclusions.value = (settings.inclusions || []).join('\n');

  // Save settings
  elements.saveBtn.addEventListener('click', async () => {
    const newSettings = {
      enabled: elements.enabled.checked,
      mode: elements.mode.value,
      onlyOnClicks: elements.onlyOnClicks.checked,
      exclusions: elements.exclusions.value
        .split('\n')
        .map(s => s.trim().toLowerCase().replace(/^www\./, ''))
        .filter(s => s.length > 0),
      inclusions: elements.inclusions.value
        .split('\n')
        .map(s => s.trim().toLowerCase().replace(/^www\./, ''))
        .filter(s => s.length > 0)
    };

    await chrome.storage.sync.set(newSettings);
    
    elements.status.textContent = 'Settings saved!';
    setTimeout(() => {
      elements.status.textContent = '';
    }, 2000);
  });
});
