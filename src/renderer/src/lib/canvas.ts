// Layout constants in 512x512 design space and helpers to map to render units.
export const CANVAS = 512

// The visible pomodoro frame is 451 design units wide. The renderer's CSS clips
// the canvas so that this 451-unit-wide strip fills 100vw. Use FRAME_W (not CANVAS)
// when converting design pixels to vw, so text sizes match Figma's proportions.
export const FRAME_W = 451

export function pct(value: number): string {
  return `${(value / CANVAS) * 100}%`
}

// Convert a Figma design-pixel size to a vw value that matches the visible frame scale.
export function designVw(designPx: number): string {
  return `${(designPx / FRAME_W) * 100}vw`
}

export type PanelId = 'timer' | 'tasks' | 'stats' | 'settings'
export type WindowControlId = 'minimize' | 'maximize' | 'close'

export interface Hitbox {
  id: string
  label: string
  left: number
  top: number
  width: number
  height: number
  color: string
}

export const SIDE_PANEL: (Hitbox & { id: PanelId })[] = [
  { id: 'timer', label: 'Timer', left: 39, top: 128, width: 48, height: 57, color: '#ff4d6d' },
  { id: 'tasks', label: 'Tasks', left: 39, top: 192, width: 48, height: 57, color: '#f9c74f' },
  { id: 'stats', label: 'Stats', left: 39, top: 256, width: 48, height: 57, color: '#43aa8b' },
  { id: 'settings', label: 'Settings', left: 39, top: 320, width: 48, height: 57, color: '#577590' }
]

export const WINDOW_CONTROLS: (Hitbox & { id: WindowControlId; asset: string })[] = [
  {
    id: 'minimize',
    label: 'Min',
    left: 403,
    top: 84,
    width: 20,
    height: 19,
    color: '#8d99ae',
    asset: 'minimize'
  },
  {
    id: 'maximize',
    label: 'Max',
    left: 428,
    top: 84,
    width: 20,
    height: 19,
    color: '#9d4edd',
    asset: 'window'
  },
  {
    id: 'close',
    label: 'Close',
    left: 454,
    top: 84,
    width: 20,
    height: 19,
    color: '#e63946',
    asset: 'exit'
  }
]

export const DRAG_REGION = { left: 30, top: 77, width: 450, height: 51 }
export const FRAME_FOOTPRINT = { left: 30, top: 77, width: 451, height: 366 }
export const FRAME_CONTENT = { left: 137, top: 128, width: 323, height: 268 }

export const RESET_HITBOX: Hitbox & { id: 'reset' } = {
  id: 'reset',
  label: 'Reset',
  left: 451,
  top: 413,
  width: 19,
  height: 20,
  color: '#06d6a0'
}

// Stats panel — 6 strawberry slot offsets (matches Figma's pomodoro-count group).
export const STRAWBERRY_SLOTS = [
  { x: 6, y: 3 },
  { x: 31, y: 3 },
  { x: 56, y: 3 },
  { x: 81, y: 3 },
  { x: 106, y: 3 },
  { x: 131, y: 3 }
]

// Matches the "+3" design placeholder text node in the stats group.
// Width is widened from Figma's 11 to 30 to give room for "+10".."+99" overflow.
export const STRAWBERRY_OVERFLOW_LABEL = {
  x: 353,
  y: 237,
  width: 30,
  height: 15,
  fontSize: 7,
  lineHeightPx: 14.875
}

// Settings panel — Y centers (matching the figma text labels' vertical centers).
export const SETTINGS_ROWS = {
  focusTime: 192.5,
  longBreak: 215.5,
  shortBreak: 238.5,
  sound: 272.5,
  notification: 294.5,
  darkMode: 316.5
}

// All settings controls right-align to this x in 512-canvas space.
export const SETTINGS_CONTROLS_RIGHT_X = 375
