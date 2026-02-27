// content.js
// Only active when "Only redirect on link clicks" is enabled.
// Background script handles the actual redirection logic.

document.addEventListener('click', async (event) => {
  const link = event.target.closest('a');
  if (!link || !link.href) return;

  // Ignore clicks with modifiers (let the browser handle new tabs/windows normally)
  if (event.ctrlKey || event.shiftKey || event.metaKey || event.button !== 0) return;

  const url = link.href;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;

  // Get settings to check if onlyOnClicks is enabled and check inclusions/exclusions
  const settings = await chrome.storage.sync.get(['enabled', 'onlyOnClicks', 'exclusions', 'inclusions']);
  
  if (!settings.enabled || !settings.onlyOnClicks) return;

  const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();

  // Inclusion check
  if (settings.inclusions && settings.inclusions.length > 0) {
    const isIncluded = settings.inclusions.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    if (!isIncluded) return;
  }

  // Exclusion check
  const isExcluded = settings.exclusions.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );
  if (isExcluded) return;

  // If we reach here, we should redirect
  event.preventDefault();
  chrome.runtime.sendMessage({ type: 'REDIRECT_REQUEST', url: url });
}, true);
