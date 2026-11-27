<p align="center"><img src="icons/icon128.png" width="96" alt=""></p>

<h1 align="center">Archive.is Redirector</h1>

<p align="center">Open any page or link in <a href="https://archive.ph">archive.today</a> with one click. Chrome and Brave, Manifest V3.</p>

## Features

- **One click:** the toolbar icon opens the latest snapshot of the current page, in a tab right next to it.
- **Keyboard:** `Alt+Shift+A` does the same.
- **Right-click:** open a page or a link in the archive, or save a fresh snapshot.
- **Clean links:** tracking parameters (`utm_*`, `fbclid`, `gclid` and others) are removed first, so existing snapshots are found more often.
- **Settings:** latest or fresh snapshot, mirror (`archive.ph`, `archive.is`, `archive.today`), and where to open (new tab, background tab, same tab). Changes save automatically. Light and dark themes.

## Privacy

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

## Development

Plain JavaScript, no build step and no dependencies. The URL logic lives in `url.js`. Test it with:

```sh
node url.test.mjs
```
