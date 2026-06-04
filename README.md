# Pixel Pomodoro

A pixel-art pomodoro desktop app built with Electron, React, and TypeScript.

## Quick Start

**Prerequisites:** [Node.js 18+](https://nodejs.org) (comes with npm)

```bash
npm run setup
```

That's it — installs dependencies and launches the app in dev mode.

## Manual Steps

```bash
npm install   # install dependencies
npm run dev   # start in dev mode
```

## Build a distributable

```bash
npm run build:mac     # macOS  → dist/*.dmg
npm run build:win     # Windows → dist/*-setup.exe
npm run build:linux   # Linux  → dist/*.AppImage + *.deb
```

## Platform Notes

| OS      | Notes |
|---------|-------|
| macOS   | Fully supported. The maximize button toggles fullscreen. |
| Windows | Fully supported. |
| Linux   | Requires a compositor (GNOME, KDE, etc.) for the transparent window. Most modern distros work out of the box. |
