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

const PANEL_GROUP_NAMES = new Set<PanelId>(['timer', 'tasks', 'stats', 'settings'])

function classifyTextNode(node: FigmaTextNode): PanelId | 'always' {
  for (const p of node.parents) {
    if (PANEL_GROUP_NAMES.has(p as PanelId)) return p as PanelId
  }
  // Fallback: name-prefix routing for ungrouped panel content (e.g. timer-count, timer-status)
  if (node.name.startsWith('timer-')) return 'timer'
  return 'always'
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
          </>
        )}

        {/* Figma text overlays — always-on chrome + active panel's grouped text */}
        {!debug &&
          (figmaData.textNodes as FigmaTextNode[]).map((node) => {
            const panel = classifyTextNode(node)
            if (panel !== 'always' && panel !== active) return null
            const bbox = node.bboxRelative ?? node.bbox
            return (
              <div
                key={node.id}
                className="figma-text"
                style={{
                  left: pct(bbox.x),
                  top: pct(bbox.y),
                  width: pct(bbox.width),
                  height: pct(bbox.height),
                  fontSize: `${(node.fontSize / CANVAS) * 100}vw`,
                  lineHeight: `${(node.lineHeightPx / CANVAS) * 100}vw`,
                  color: fillToCss(node.fills?.[0]),
                  textAlign: node.textAlignHorizontal.toLowerCase() as CSSProperties['textAlign']
                }}
              >
                {node.text}
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
      </div>

      <button className="debug-toggle" onClick={() => setDebug((d) => !d)}>
        debug: {debug ? 'on' : 'off'} · active: {active}
      </button>
    </div>
  )
}

export default App
