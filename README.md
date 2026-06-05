# 🍓 Pixel Pomodoro

A cozy pixel-art pomodoro timer for your desktop. Study with a sleepy cat, earn strawberries, and take your breaks seriously — built with Electron, React, and TypeScript.

## Features

- **Pomodoro timer** — 25-minute focus sessions with 5-minute short breaks; every 4th session earns a 15-minute long break. Pause, reset, or skip ahead anytime
- **Pixel-art room** — a hand-drawn scene rendered crisp at any window size, with a cat that wakes up while you study and dozes off when you stop
- **Strawberry stats** — each completed pomodoro fills a strawberry; the day's count persists across restarts and resets at midnight
- **Tasks** — a built-in task list with filters so you know what the next pomodoro is for
- **Music & alarm** — lo-fi focus music while studying, relax music on breaks, and an alarm chime when time's up
- **Notifications** — native OS notifications when a session or break ends
- **Light & dark themes** — the whole room changes palette, not just the UI
- **Frameless window** — no OS chrome; the pixel frame *is* the window, draggable and aspect-locked

## Settings

| Setting | Default |
|---|---|
| Focus length | 25 min |
| Short break | 5 min |
| Long break | 15 min |
| Sound | on |
| Notifications | on |
| Dark mode | off |

## Download

Prebuilt apps are on the [releases page](https://github.com/cupidbity/pomodoro/releases):

- **macOS (Apple Silicon):** grab the `.dmg` and drag the app to Applications
- **Windows:** run the `-setup-x64.exe` installer (`-setup-arm64.exe` for Windows on ARM)
- **Linux (x64):** `chmod +x` and run the `.AppImage`, or `sudo dpkg -i` the `.deb`

> The build is ad-hoc signed, so on first launch macOS will warn about an unidentified developer. Right-click the app → **Open** → Open (once), or:
> ```bash
> xattr -d com.apple.quarantine "/Applications/Pixel Pomodoro.app"
> ```

## Develop

```bash
npm run setup   # installs deps and auto-repairs the Electron binary if needed
npm run dev
```

(`npm install` works too — `npm run setup` is the same thing plus a check/repair
for the Electron binary issue described under Troubleshooting.)

Other useful scripts:

```bash
npm run lint        # eslint
npm run typecheck   # main + renderer
npm run format      # prettier
```

## Build

```bash
npm run build:mac     # macOS (dmg + zip)
npm run build:win     # Windows (nsis installer)
npm run build:linux   # Linux (AppImage + deb)
```

## Troubleshooting

### Electron won't install (`npm run dev` fails)

```
Error: ENOENT ... node_modules/electron/path.txt
Error: Electron failed to install correctly, please delete node_modules/electron and try installing again
```

**Cause:** a too-new Node version. Electron downloads its prebuilt binary but fails to *extract* it, so `node_modules/electron/dist/` and `path.txt` never get created. Most common when you installed "latest" Node instead of LTS.

**Fix:**

1. Run the self-repairing setup first:
   ```bash
   npm run setup
   ```
   It clears the Electron download cache, reinstalls, and — if extraction still fails — unpacks the cached binary itself and writes `path.txt` for you.
2. If that doesn't get you there, check `node --version` — if it's newer than the current LTS, switch to **Node LTS** (via [nvm](https://github.com/nvm-sh/nvm) or [nodejs.org](https://nodejs.org/)), delete `node_modules`, and re-run `npm run setup`.
3. Verify the binary exists: `ls node_modules/electron/dist` should list `Electron.app` (macOS) or `electron` / `electron.exe`.

**Manual fix (if you can't change Node and setup can't repair it):** you're doing exactly what the setup script automates — unzip the Electron binary into place and write the one-line `path.txt` that tells Electron where it lives.

1. **Make sure the binary zip is downloaded.** Run Electron's own installer once — it caches the zip even when it can't extract it:

   ```bash
   node node_modules/electron/install.js
   ```

2. **Find the cached zip** (named `electron-v<version>-<platform>-<arch>.zip`):

   | OS | Cache location |
   |---|---|
   | Windows | `%LOCALAPPDATA%\electron\Cache\` (check the sub-folders) |
   | macOS | `~/Library/Caches/electron/` |
   | Linux | `~/.cache/electron/` |

   ```bash
   # macOS / Linux
   find ~/Library/Caches/electron ~/.cache/electron -name 'electron-v*.zip' 2>/dev/null
   ```

   On Windows, pick whichever you have open — `Get-ChildItem` only exists in PowerShell, so if you get "command not found" you're in Command Prompt or Git Bash; use that shell's command instead:

   ```cmd
   :: Command Prompt (cmd.exe)
   dir /s /b "%LOCALAPPDATA%\electron\Cache\electron-v*.zip"
   ```
   ```powershell
   # PowerShell
   Get-ChildItem "$env:LOCALAPPDATA\electron\Cache" -Recurse -Filter "electron-v*.zip" | Select-Object FullName
   ```

   Or skip the terminal entirely: paste `%LOCALAPPDATA%\electron\Cache` into File Explorer's address bar and look inside the sub-folders.

   If nothing turns up, the download itself failed (network/firewall/antivirus) — fix that first.

3. **Extract it into `node_modules/electron/dist/`.**

   - **Windows — the File Explorer way:** open the cache folder in File Explorer, right-click the zip → **Extract All…**, and set the destination to your project's `node_modules\electron\dist` folder.
   - **macOS:** double-click the zip in Finder and move the contents into `node_modules/electron/dist/`, or:
     ```bash
     ditto -x -k <the-zip> node_modules/electron/dist
     ```
   - **Linux:** `unzip -o <the-zip> -d node_modules/electron/dist`

4. **Create `node_modules/electron/path.txt`** containing just the executable path for your OS:

   | OS | Contents of `path.txt` |
   |---|---|
   | Windows | `electron.exe` |
   | macOS | `Electron.app/Contents/MacOS/Electron` |
   | Linux | `electron` |

   On Windows you can make it in Notepad (make sure it saves as `path.txt`, not `path.txt.txt`), or from the project folder:

   ```powershell
   # PowerShell
   Set-Content -Path node_modules\electron\path.txt -Value "electron.exe" -NoNewline
   ```
   ```cmd
   :: Command Prompt (cmd.exe)
   <nul set /p="electron.exe" > node_modules\electron\path.txt
   ```

5. Run `npm run dev` — it should boot now.

### Packaged app quits instantly on launch

```
dyld: Library not loaded: @rpath/Electron Framework.framework/...
  ... have different Team IDs
```

**Cause:** mismatched signatures inside the bundle — typically after building without a signing identity (`CSC_IDENTITY_AUTO_DISCOVERY=false`), where the ad-hoc fallback signs some components but not others.

**Fix:** re-sign the whole bundle consistently:

```bash
codesign --force --deep --sign - "dist/mac-arm64/Pixel Pomodoro.app"
```
## Stack

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/) + [electron-builder](https://www.electron.build/)
- [React 19](https://react.dev/) + TypeScript
