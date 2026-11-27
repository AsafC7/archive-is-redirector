<p align="center"><img src="icons/icon128.png" width="96" alt=""></p>

<h1 align="center">Open in Archive</h1>

<p align="center"><img src="https://github.com/AsafC7/open-in-archive/actions/workflows/test.yml/badge.svg" alt="tests"></p>

<p align="center">Open any page or link in <a href="https://archive.ph">archive.today</a> with one click. Chrome and Brave, Manifest V3.</p>

## Features

- **One click:** the toolbar icon opens the latest snapshot of the current page, in a tab right next to it.
- **Keyboard:** `Alt+Shift+A` is suggested on a fresh install. An old browser setting or another extension can keep it from working. If it does nothing, set it at `chrome://extensions/shortcuts` (`brave://extensions/shortcuts` in Brave) or click **Edit shortcut** in the options.
- **Right-click:** open a page or a link in the archive, or save a fresh snapshot.
- **Clean links:** tracking parameters (`utm_*`, `fbclid`, `gclid` and others) are removed first, so existing snapshots are found more often.
- **Settings:** latest or fresh snapshot, mirror (`archive.ph`, `archive.is`, `archive.today`), and where to open (new tab, background tab, same tab). Changes save automatically. Light and dark themes.

## Privacy

When you use the extension, it sends the page or link URL to the archive.today mirror you chose. A fresh snapshot creates a **public** copy there. Do not use it on private or logged-in links.

The extension has no server and collects nothing. It asks for three permissions:

| Permission | Why |
| --- | --- |
| `activeTab` | Read the current tab's URL, only when you click the icon, press the shortcut, or use the menu. |
| `contextMenus` | Add the right-click items. |
| `storage` | Save your settings. |

It cannot read or change pages you visit.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions` (or `brave://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and select the folder that contains `manifest.json`.

To pin the icon to the toolbar, open the puzzle-piece menu and click the pin next to **Open in Archive**.

## Development

Plain JavaScript, no build step and no dependencies. The URL logic lives in `url.js`. Test it with:

```sh
node url.test.mjs
```

## License

MIT
