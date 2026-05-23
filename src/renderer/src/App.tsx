import { useState, CSSProperties } from 'react'
import figmaData from './figma-text.json'

type PanelId = 'timer' | 'tasks' | 'stats' | 'settings'
type WindowControlId = 'minimize' | 'maximize' | 'close'

interface FigmaFill {
  type: string
  color?: { r: number; g: number; b: number; a: number }
  opacity?: number
}

interface FigmaBBox {
  x: number
  y: number
  width: number
  height: number
}

interface FigmaTextNode {
  id: string
  name: string
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  letterSpacing: number
  lineHeightPx: number
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
  fills?: FigmaFill[]
  bbox: FigmaBBox
  bboxRelative?: FigmaBBox
  parents: string[]
}

interface FigmaImageNode {
  id: string
  name: string
  type: string
  bbox: FigmaBBox
  bboxRelative?: FigmaBBox
  parents: string[]
}

const PANEL_GROUP_NAMES = new Set<PanelId>(['timer', 'tasks', 'stats', 'settings'])

// Text nodes that live flat on Page 1 but belong to a specific panel.
const TEXT_NAME_TO_PANEL: Record<string, PanelId> = {
  'timer-count': 'timer',
  'timer-status': 'timer',
  'STUDY TIME': 'timer'
}

// Text nodes that are design placeholders for dynamic content — don't render statically.
const SKIP_TEXT_NAMES = new Set(['+3'])

// Map a Figma text node name to dynamic content. Returns null to use the node's static text.
function dynamicTextFor(name: string, state: { pomodorosToday: number }): string | null {
  if (name === 'number_completed') return String(state.pomodorosToday)
  return null
}

function classifyTextNode(node: FigmaTextNode): PanelId | 'always' {
  for (const p of node.parents) {
    if (PANEL_GROUP_NAMES.has(p as PanelId)) return p as PanelId
  }
  if (TEXT_NAME_TO_PANEL[node.name]) return TEXT_NAME_TO_PANEL[node.name]
  // Fallback: name-prefix routing for older ungrouped panel content
  if (node.name.startsWith('timer-')) return 'timer'
  return 'always'
}

function classifyImageNode(node: FigmaImageNode): PanelId | null {
  for (const p of node.parents) {
    if (PANEL_GROUP_NAMES.has(p as PanelId)) return p as PanelId
  }
  return null
}

// Strip Figma's auto-numbering suffix: "tasks-frame 1" -> "tasks-frame", "settings-frame - 1" -> "settings-frame"
function stripFigmaSuffix(name: string): string {
  return name.replace(/\s*[-–]?\s*\d+$/, '').trim()
}

// Dynamic/skipped nodes — handled by other code paths or not yet mapped to assets.
const SKIP_IMAGE_PATTERNS: RegExp[] = [
  /^completed-strawberry/, // dynamic count, rendered separately
  /^empty-strawberry/ // dynamic count, rendered separately
]

// Strawberry counter slot offsets in 512-canvas coords — from Figma's pomodoro-count group.
// Each is the top-left of a 512x512 PNG overlay; the visible sprite sits at (203, 236) in the PNG.
const STRAWBERRY_SLOTS = [
  { x: 6, y: 3 },
  { x: 31, y: 3 },
  { x: 56, y: 3 },
  { x: 81, y: 3 },
  { x: 106, y: 3 },
  { x: 131, y: 3 }
]
// Matches the "+3" design placeholder text node in Figma (inside the stats group).
const STRAWBERRY_OVERFLOW_LABEL = { x: 353, y: 237, width: 30, height: 15, fontSize: 7 }
function shouldRenderImageNode(node: FigmaImageNode): boolean {
  return !SKIP_IMAGE_PATTERNS.some((re) => re.test(node.name))
}

function fillToCss(fill?: FigmaFill): string | undefined {
  if (!fill?.color) return undefined
  const { r, g, b, a } = fill.color
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
}

// All coordinates are in the 512x512 asset canvas space.
const CANVAS = 512

interface Hitbox {
  id: string
  label: string
  left: number
  top: number
  width: number
  height: number
  color: string
}

const SIDE_PANEL: (Hitbox & { id: PanelId })[] = [
  { id: 'timer', label: 'Timer', left: 39, top: 128, width: 48, height: 57, color: '#ff4d6d' },
  { id: 'tasks', label: 'Tasks', left: 39, top: 192, width: 48, height: 57, color: '#f9c74f' },
  { id: 'stats', label: 'Stats', left: 39, top: 256, width: 48, height: 57, color: '#43aa8b' },
  { id: 'settings', label: 'Settings', left: 39, top: 320, width: 48, height: 57, color: '#577590' }
]

// Window control glyph asset filenames don't match their IDs.
const WINDOW_CONTROLS: (Hitbox & { id: WindowControlId; asset: string })[] = [
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

// Top bar drag region in 512 coords: from frame top (y=77) to where side buttons start (y=128)
const DRAG_REGION = { left: 30, top: 77, width: 450, height: 51 }

// Reset button hitbox — covers the small reset glyph in the bottom-right of the frame.
const RESET_HITBOX: Hitbox & { id: 'reset' } = {
  id: 'reset',
  label: 'Reset',
  left: 451,
  top: 413,
  width: 19,
  height: 20,
  color: '#06d6a0'
}

// frame.png visible bounding box (the actual window silhouette inside the 512x512 canvas)
const FRAME_FOOTPRINT = { left: 30, top: 77, width: 451, height: 366 }

// frame.png inner content area (the white rectangle where panels will render)
const FRAME_CONTENT = { left: 137, top: 128, width: 323, height: 268 }

function pct(value: number): string {
  return `${(value / CANVAS) * 100}%`
}

function hitboxStyle(h: Hitbox, debug: boolean): CSSProperties {
  return {
    left: pct(h.left),
    top: pct(h.top),
    width: pct(h.width),
    height: pct(h.height),
    ...(debug ? ({ ['--debug-color' as string]: h.color } as CSSProperties) : {})
  }
}

function App(): React.JSX.Element {
  const [active, setActive] = useState<PanelId>('timer')
  const [debug, setDebug] = useState(true)
  const [pomodorosToday, setPomodorosToday] = useState(5)

  function handleWindowControl(id: WindowControlId): void {
    if (id === 'minimize') window.api.window.minimize()
    else if (id === 'maximize') window.api.window.toggleMaximize()
    else if (id === 'close') window.api.window.close()
  }

  return (
    <div className="window-root">
      <div className={`canvas ${debug ? 'debug-canvas' : ''}`}>
        {debug && (
          <>
            <div
              className="debug-frame-footprint"
              style={{
                left: pct(FRAME_FOOTPRINT.left),
                top: pct(FRAME_FOOTPRINT.top),
                width: pct(FRAME_FOOTPRINT.width),
                height: pct(FRAME_FOOTPRINT.height)
              }}
            >
              <span className="debug-label">Frame</span>
            </div>
            <div
              className="debug-frame-content"
              style={{
                left: pct(FRAME_CONTENT.left),
                top: pct(FRAME_CONTENT.top),
                width: pct(FRAME_CONTENT.width),
                height: pct(FRAME_CONTENT.height)
              }}
            >
              <span className="debug-label">Content</span>
            </div>
          </>
        )}

        {!debug && (
          <>
            {/* Room scene background (back-most layer) */}
            <img className="canvas-layer" src="/timer/background.png" alt="" />

            {/* Frame chrome */}
            <img className="canvas-layer" src="/main/frame.png" alt="" />

            {/* Per-panel Figma image nodes. For full-canvas (512x512) overlays, the bbox IS
                the canvas; for smaller sprites placed in Figma at a specific size, we render
                at the bbox size so the sprite scales to the Figma rectangle. */}
            {(figmaData.imageNodes as FigmaImageNode[]).map((node) => {
              const panel = classifyImageNode(node)
              if (!panel || panel !== active) return null
              if (!shouldRenderImageNode(node)) return null
              const baseName = stripFigmaSuffix(node.name)
              const src = `/${panel}/${baseName}.png`
              const bbox = node.bboxRelative ?? node.bbox
              return (
                <img
                  key={node.id}
                  className="figma-asset"
                  src={src}
                  alt=""
                  style={{
                    left: pct(bbox.x),
                    top: pct(bbox.y),
                    width: pct(bbox.width),
                    height: pct(bbox.height)
                  }}
                />
              )
            })}

            {/* Dynamic strawberry counter (stats panel) */}
            {active === 'stats' && (
              <>
                {STRAWBERRY_SLOTS.map((slot, i) => {
                  const filled = i < Math.min(pomodorosToday, STRAWBERRY_SLOTS.length)
                  const src = filled
                    ? '/stats/completed-strawberry.png'
                    : '/stats/empty-strawberry.png'
                  return (
                    <img
                      key={`berry-${i}`}
                      className="figma-asset"
                      alt=""
                      src={src}
                      style={{
                        left: pct(slot.x),
                        top: pct(slot.y),
                        width: pct(512),
                        height: pct(512)
                      }}
                    />
                  )
                })}
                {pomodorosToday > STRAWBERRY_SLOTS.length && (
                  <div
                    className="figma-text"
                    style={{
                      left: pct(STRAWBERRY_OVERFLOW_LABEL.x),
                      top: pct(STRAWBERRY_OVERFLOW_LABEL.y),
                      width: pct(STRAWBERRY_OVERFLOW_LABEL.width),
                      height: pct(STRAWBERRY_OVERFLOW_LABEL.height),
                      fontSize: `${(STRAWBERRY_OVERFLOW_LABEL.fontSize / CANVAS) * 100}vw`,
                      lineHeight: `${(STRAWBERRY_OVERFLOW_LABEL.fontSize / CANVAS) * 100}vw`,
                      color: 'rgb(137, 55, 96)'
                    }}
                  >
                    +{pomodorosToday - STRAWBERRY_SLOTS.length}
                  </div>
                )}
              </>
            )}

            {/* Highlight box behind the active panel's icon */}
            <img className="canvas-layer" src={`/main/${active}-selected.png`} alt="" />

            {/* All four side-panel icon glyphs (always visible) */}
            {SIDE_PANEL.map((b) => (
              <img key={`icon-${b.id}`} className="canvas-layer" src={`/main/${b.id}.png`} alt="" />
            ))}

            {/* Window control glyphs */}
            {WINDOW_CONTROLS.map((b) => (
              <img
                key={`icon-${b.id}`}
                className="canvas-layer"
                src={`/main/${b.asset}.png`}
                alt=""
              />
            ))}

            {/* Always-on today-count bar at the bottom strip */}
            <img className="canvas-layer" src="/main/today-count.png" alt="" />

            {/* Always-on reset button glyph */}
            <img className="canvas-layer" src="/main/reset.png" alt="" />

            {/* Dynamic count number after the "today's count: " label
                Label ends at x≈212 (bbox 143 + width 69). */}
            <div
              className="figma-text"
              style={{
                left: pct(220),
                top: pct(417),
                width: pct(40),
                height: pct(17),
                fontSize: `${(8 / CANVAS) * 100}vw`,
                lineHeight: `${(17 / CANVAS) * 100}vw`,
                color: 'rgb(137, 55, 96)'
              }}
            >
              {pomodorosToday}
            </div>
          </>
        )}

        {/* Figma text overlays — always-on chrome + active panel's grouped text */}
        {!debug &&
          (figmaData.textNodes as FigmaTextNode[]).map((node) => {
            if (SKIP_TEXT_NAMES.has(node.name)) return null
            const panel = classifyTextNode(node)
            if (panel !== 'always' && panel !== active) return null
            const bbox = node.bboxRelative ?? node.bbox
            const text = dynamicTextFor(node.name, { pomodorosToday }) ?? node.text
            // Shift "pomodoros completed" right when the count grows from 1 to 2+ digits
            // so the visual gap between number and label stays constant.
            const NUMBER_DIGIT_WIDTH_AT_FS20 = 11
            const extraDigits = Math.max(0, String(pomodorosToday).length - 1)
            const leftOffset =
              node.name === 'pomodoros completed' ? extraDigits * NUMBER_DIGIT_WIDTH_AT_FS20 : 0
            return (
              <div
                key={node.id}
                className="figma-text"
                style={{
                  left: pct(bbox.x + leftOffset),
                  top: pct(bbox.y),
                  width: pct(bbox.width),
                  height: pct(bbox.height),
                  fontSize: `${(node.fontSize / CANVAS) * 100}vw`,
                  lineHeight: `${(node.lineHeightPx / CANVAS) * 100}vw`,
                  color: fillToCss(node.fills?.[0]),
                  textAlign: node.textAlignHorizontal.toLowerCase() as CSSProperties['textAlign']
                }}
              >
                {text}
              </div>
            )
          })}

        {/* Top-bar drag region (always present so dragging works in both modes) */}
        <div
          className={`drag-region ${debug ? 'debug-drag-region' : ''}`}
          style={{
            left: pct(DRAG_REGION.left),
            top: pct(DRAG_REGION.top),
            width: pct(DRAG_REGION.width),
            height: pct(DRAG_REGION.height)
          }}
        >
          {debug && <span className="debug-label">Drag</span>}
        </div>

        {/* Side panel hitboxes */}
        {SIDE_PANEL.map((b) => (
          <button
            key={b.id}
            className={`hitbox ${debug ? 'debug-outline' : ''}`}
            style={hitboxStyle(b, debug)}
            onClick={() => setActive(b.id)}
            aria-label={b.label}
          >
            {debug && <span className="debug-label">{b.label}</span>}
          </button>
        ))}

        {/* Window control hitboxes */}
        {WINDOW_CONTROLS.map((b) => (
          <button
            key={b.id}
            className={`hitbox ${debug ? 'debug-outline' : ''}`}
            style={hitboxStyle(b, debug)}
            onClick={() => handleWindowControl(b.id)}
            aria-label={b.label}
          >
            {debug && <span className="debug-label">{b.label}</span>}
          </button>
        ))}

        {/* Reset hitbox — TODO: wire to timer reset once timer state is live */}
        <button
          className={`hitbox ${debug ? 'debug-outline' : ''}`}
          style={hitboxStyle(RESET_HITBOX, debug)}
          onClick={() => console.log('reset clicked')}
          aria-label={RESET_HITBOX.label}
        >
          {debug && <span className="debug-label">{RESET_HITBOX.label}</span>}
        </button>
      </div>

      <button className="debug-toggle" onClick={() => setDebug((d) => !d)}>
        debug: {debug ? 'on' : 'off'} · active: {active}
      </button>
      <button
        className="debug-toggle"
        style={{ right: 'auto', left: 4 }}
        onClick={() => setPomodorosToday((n) => (n + 1) % 12)}
      >
        🍓 {pomodorosToday}
      </button>
    </div>
  )
}

export default App
