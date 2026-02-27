# Archive.is Redirector Extension

A Manifest V3 extension for Chrome/Brave/Chromium that automatically redirects web pages to Archive.is snapshots.

## Features

- **Automatic Redirection**: Top-level navigations to http/https pages are redirected to Archive.is.
- **Loop Prevention**: Automatically ignores archive domains (archive.is, archive.today, etc.) to prevent infinite loops.
- **Custom Lists**: Support for domain exclusion and inclusion lists.
- **Modern Redirection Modes**:
  - **Viewer**: Redirects to the most recent snapshot.
  - **Capture**: Forces archive.is to take a new snapshot.
- **Click-Only Mode**: Option to only redirect when clicking links (ignoring typed URLs or programmatic navigations).
- **Context Menus**: Right-click any link or the page to open in Archive.is.
- **Toolbar Button**: Click the extension icon to archive the current tab URL in a new tab.

## Installation

1.  Open Brave (or any Chromium browser).
2.  Navigate to `brave://extensions/` (or `chrome://extensions/`).
3.  Enable **Developer mode** (toggle in the top right).
4.  Click **Load unpacked**.
5.  Select the `archive_extension` folder containing these files.

## Permissions Explanation

- `storage`: Required to save user preferences, exclusion, and inclusion lists.
- `declarativeNetRequest`: Used for high-performance, privacy-respecting automatic redirection of main frame requests.
- `contextMenus`: Used to add "Open via archive.is" options to the right-click menu.
- `tabs`: Required to open new tabs for context menu and toolbar button actions.
- `<all_urls>` (Host Permissions): Required to detect and redirect navigations on all http/https websites.

## How Settings Work

- **Exclusion List**: If a domain (or subdomain) is in this list, it will NEVER be redirected automatically.
- **Inclusion List**: If this list is NOT empty, ONLY the listed domains will be redirected.
- **Mode**: "Viewer" is best for quick reading; "Capture" is best for archiving live content.

## Known Limitations

- **Captcha**: If Archive.is requires a captcha, you will still need to solve it manually in the redirected tab.
- **Redirection Rules**: Changes to settings are applied immediately to the background service worker.

## Icons

This extension uses the default browser icon for the action. You can add `icon16.png`, `icon48.png`, and `icon128.png` to the folder and update `manifest.json` if you wish to have custom branding.
