import { useState, type CSSProperties } from 'react'
import figmaData from './figma-text.json'
import {
  CANVAS,
  DRAG_REGION,
  FRAME_CONTENT,
  FRAME_FOOTPRINT,
  type Hitbox,
  type PanelId,
  pct,
  RESET_HITBOX,
  SIDE_PANEL,
  WINDOW_CONTROLS,
  type WindowControlId
} from './lib/canvas'
import {
  classifyImageNode,
  classifyTextNode,
  dynamicTextFor,
  type FigmaImageNode,
  type FigmaTextNode,
  fillToCss,
  shouldRenderImageNode,
  SKIP_TEXT_NAMES,
  stripFigmaSuffix
} from './lib/figma'
import { SettingsPanel, type SettingsState } from './panels/SettingsPanel'
import { StatsPanel } from './panels/StatsPanel'
import { TasksPanel } from './panels/TasksPanel'
import { TimerPanel } from './panels/TimerPanel'

function hitboxStyle(h: Hitbox, debug: boolean): CSSProperties {
  return {
    left: pct(h.left),
    top: pct(h.top),
    width: pct(h.width),
    height: pct(h.height),
    ...(debug ? ({ ['--debug-color' as string]: h.color } as CSSProperties) : {})
  }
}

function renderFigmaText(node: FigmaTextNode, pomodorosToday: number): React.JSX.Element {
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
}

function App(): React.JSX.Element {
  const [active, setActive] = useState<PanelId>('timer')
  const [debug] = useState(false)
  const [pomodorosToday] = useState(5)
  const [settings, setSettings] = useState<SettingsState>({
    focusMin: 25,
    longBreakMin: 15,
    shortBreakMin: 5,
    soundOn: true,
    notificationOn: true,
    darkModeOn: false
  })

  function handleWindowControl(id: WindowControlId): void {
    if (id === 'minimize') window.api.window.minimize()
    else if (id === 'maximize') window.api.window.toggleMaximize()
    else if (id === 'close') window.api.window.close()
  }

  return (
    <div className="window-root">
      <div className={`canvas ${debug ? 'debug-canvas' : ''}`}>
        {/* Debug wireframe overlays */}
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

        {/* Always-on chrome + per-panel Figma assets */}
        {!debug && (
          <>
            {/* Timer assets render ALWAYS as the base view (the room scene behind the window). */}
            {(figmaData.imageNodes as FigmaImageNode[]).map((node) => {
              const panel = classifyImageNode(node)
              if (panel !== 'timer') return null
              if (!shouldRenderImageNode(node)) return null
              const baseName = stripFigmaSuffix(node.name)
              const src = `/timer/${baseName}.png`
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

            <img className="canvas-layer" src="/main/frame.png" alt="" />

            <img className="canvas-layer" src={`/main/${active}-selected.png`} alt="" />

            {SIDE_PANEL.map((b) => (
              <img key={`icon-${b.id}`} className="canvas-layer" src={`/main/${b.id}.png`} alt="" />
            ))}

            {WINDOW_CONTROLS.map((b) => (
              <img
                key={`icon-${b.id}`}
                className="canvas-layer"
                src={`/main/${b.asset}.png`}
                alt=""
              />
            ))}

            <img className="canvas-layer" src="/main/today-count.png" alt="" />
            <img className="canvas-layer" src="/main/reset.png" alt="" />

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

            {/* Timer + always-on chrome text — renders below the overlay panels. */}
            {(figmaData.textNodes as FigmaTextNode[]).map((node) => {
              if (SKIP_TEXT_NAMES.has(node.name)) return null
              const panel = classifyTextNode(node)
              if (panel !== 'always' && panel !== 'timer') return null
              return renderFigmaText(node, pomodorosToday)
            })}

            {/* Tasks/Stats/Settings panel assets render ABOVE the main chrome. */}
            {active !== 'timer' &&
              (figmaData.imageNodes as FigmaImageNode[]).map((node) => {
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
          </>
        )}

        {/* Active panel's own text — renders above its overlay assets (when not timer). */}
        {!debug &&
          active !== 'timer' &&
          (figmaData.textNodes as FigmaTextNode[]).map((node) => {
            if (SKIP_TEXT_NAMES.has(node.name)) return null
            const panel = classifyTextNode(node)
            if (panel !== active) return null
            return renderFigmaText(node, pomodorosToday)
          })}

        {/* Per-panel interactive overlays */}
        {!debug && active === 'timer' && <TimerPanel />}
        {!debug && active === 'tasks' && <TasksPanel />}
        {!debug && active === 'stats' && <StatsPanel pomodorosToday={pomodorosToday} />}
        {!debug && active === 'settings' && (
          <SettingsPanel settings={settings} setSettings={setSettings} />
        )}

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

        {/* Hitboxes */}
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

        <button
          className={`hitbox ${debug ? 'debug-outline' : ''}`}
          style={hitboxStyle(RESET_HITBOX, debug)}
          onClick={() => console.log('reset clicked')}
          aria-label={RESET_HITBOX.label}
        >
          {debug && <span className="debug-label">{RESET_HITBOX.label}</span>}
        </button>
      </div>

      {/* debug toggle buttons removed */}
    </div>
  )
}

export default App
