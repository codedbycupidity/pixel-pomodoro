import { useEffect, useState, type CSSProperties } from 'react'
import figmaData from './figma-text.json'
import { asset } from './lib/assets'
import {
  designVw,
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
  type DynamicTextState,
  dynamicTextFor,
  type FigmaImageNode,
  type FigmaTextNode,
  fillToCss,
  shouldRenderImageNode,
  SKIP_TEXT_NAMES,
  stripFigmaSuffix
} from './lib/figma'
import { loadSettings, saveSettings, type SettingsState } from './lib/settings'
import { loadTasks, saveTasks, type Task } from './lib/tasks'
import { formatTime, useTimer } from './lib/useTimer'
import { SettingsPanel } from './panels/SettingsPanel'
import { StatsPanel } from './panels/StatsPanel'
import { TasksPanel } from './panels/TasksPanel'
import { TimerPanel } from './panels/TimerPanel'
import { TimerEmote } from './components/timer/TimerEmote'

// Play/pause button hitbox (matches the play/pause art at design 232,312).
const PLAY_HITBOX = { left: 235, top: 325, width: 82, height: 28 }

function hitboxStyle(h: Hitbox, debug: boolean): CSSProperties {
  return {
    left: pct(h.left),
    top: pct(h.top),
    width: pct(h.width),
    height: pct(h.height),
    ...(debug ? ({ ['--debug-color' as string]: h.color } as CSSProperties) : {})
  }
}

function renderFigmaText(node: FigmaTextNode, dyn: DynamicTextState): React.JSX.Element {
  const bbox = node.bboxRelative ?? node.bbox
  const text = dynamicTextFor(node.name, dyn) ?? node.text
  // Shift "pomodoros completed" right when the count grows from 1 to 2+ digits
  // so the visual gap between number and label stays constant.
  const NUMBER_DIGIT_WIDTH_AT_FS20 = 11
  const extraDigits = Math.max(0, String(dyn.pomodorosToday).length - 1)
  const leftOffset =
    node.name === 'pomodoros completed' ? extraDigits * NUMBER_DIGIT_WIDTH_AT_FS20 : 0

  // The phase label swaps to wider text ("SHORT BREAK" / "LONG BREAK") that would
  // wrap inside the narrow "STUDY TIME" box — keep it on one line, centered on the
  // box's center so every phase stays put.
  const base: CSSProperties = {
    top: pct(bbox.y),
    height: pct(bbox.height),
    fontSize: designVw(node.fontSize),
    lineHeight: designVw(node.lineHeightPx),
    color: fillToCss(node.fills?.[0])
  }
  const style: CSSProperties =
    node.name === 'STUDY TIME'
      ? {
          ...base,
          left: pct(bbox.x + bbox.width / 2),
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }
      : {
          ...base,
          left: pct(bbox.x + leftOffset),
          width: pct(bbox.width),
          textAlign: node.textAlignHorizontal.toLowerCase() as CSSProperties['textAlign']
        }
  return (
    <div key={node.id} className="figma-text" style={style}>
      {text}
    </div>
  )
}

function App(): React.JSX.Element {
  const [active, setActive] = useState<PanelId>('timer')
  const [debug] = useState(false)
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings())
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())

  const timer = useTimer(
    {
      focusMin: settings.focusMin,
      shortBreakMin: settings.shortBreakMin,
      longBreakMin: settings.longBreakMin
    },
    { soundOn: settings.soundOn, notificationOn: settings.notificationOn }
  )

  const dyn: DynamicTextState = {
    pomodorosToday: timer.pomodorosToday,
    timerCount: formatTime(timer.secondsLeft),
    timerStatus: timer.running ? 'PAUSE' : 'START',
    phaseLabel:
      timer.phase === 'focus'
        ? 'STUDY TIME'
        : timer.phase === 'short'
          ? 'SHORT BREAK'
          : 'LONG BREAK'
  }

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

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
              // Swap play/pause and the cat with the current run state.
              if (baseName === 'play' && timer.running) return null
              if (baseName === 'pause' && !timer.running) return null
              if (baseName === 'cat-awake' && !timer.running) return null
              if (baseName === 'cat-sleeping' && timer.running) return null
              const src = asset(`timer/${baseName}.png`)
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

            <img className="canvas-layer" src={asset('main/frame.png')} alt="" />

            <img className="canvas-layer" src={asset(`main/${active}-selected.png`)} alt="" />

            {SIDE_PANEL.map((b) => (
              <img
                key={`icon-${b.id}`}
                className="canvas-layer"
                src={asset(`main/${b.id}.png`)}
                alt=""
              />
            ))}

            {WINDOW_CONTROLS.map((b) => (
              <img
                key={`icon-${b.id}`}
                className="canvas-layer"
                src={asset(`main/${b.asset}.png`)}
                alt=""
              />
            ))}

            <img className="canvas-layer" src={asset('main/today-count.png')} alt="" />
            <img className="canvas-layer" src={asset('main/reset.png')} alt="" />
            <img className="canvas-layer" src={asset('main/skip.png')} alt="" />

            <div
              className="figma-text"
              style={{
                left: pct(220),
                top: pct(417),
                width: pct(40),
                height: pct(17),
                fontSize: designVw(8),
                lineHeight: designVw(17),
                color: 'rgb(137, 55, 96)'
              }}
            >
              {timer.pomodorosToday}
            </div>

            {/* Timer + always-on chrome text — renders below the overlay panels. */}
            {(figmaData.textNodes as FigmaTextNode[]).map((node) => {
              if (SKIP_TEXT_NAMES.has(node.name)) return null
              const panel = classifyTextNode(node)
              if (panel !== 'always' && panel !== 'timer') return null
              return renderFigmaText(node, dyn)
            })}

            {/* Tasks/Stats/Settings panel assets render ABOVE the main chrome. */}
            {active !== 'timer' &&
              (figmaData.imageNodes as FigmaImageNode[]).map((node) => {
                const panel = classifyImageNode(node)
                if (!panel || panel !== active) return null
                if (!shouldRenderImageNode(node)) return null
                const baseName = stripFigmaSuffix(node.name)
                const src = asset(`${panel}/${baseName}.png`)
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
            return renderFigmaText(node, dyn)
          })}

        {/* Per-panel interactive overlays */}
        {!debug && active === 'timer' && <TimerPanel />}
        {!debug && active === 'timer' && <TimerEmote running={timer.running} />}
        {!debug && active === 'tasks' && <TasksPanel tasks={tasks} setTasks={setTasks} />}
        {!debug && active === 'stats' && <StatsPanel pomodorosToday={timer.pomodorosToday} />}
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
          onClick={timer.reset}
          aria-label={RESET_HITBOX.label}
          title="Reset timer"
        >
          {debug && <span className="debug-label">{RESET_HITBOX.label}</span>}
        </button>

        {/* Start/pause the timer (only over the timer scene). */}
        {active === 'timer' && (
          <button
            className="hitbox"
            style={{
              left: pct(PLAY_HITBOX.left),
              top: pct(PLAY_HITBOX.top),
              width: pct(PLAY_HITBOX.width),
              height: pct(PLAY_HITBOX.height)
            }}
            onClick={timer.toggle}
            aria-label={timer.running ? 'Pause timer' : 'Start timer'}
          />
        )}

        {/* Skip to the next phase — persists on every screen alongside reset.
            (skip.png art is rendered with the always-on chrome above; opaque art
            measured at design 426,413 19x20.) */}
        <button
          className="hitbox"
          onClick={timer.skip}
          aria-label="Skip to next phase"
          title="Skip to next phase"
          style={{
            left: pct(426),
            top: pct(413),
            width: pct(19),
            height: pct(20)
          }}
        />

        {/* Debug: fire a test OS notification (verifies macOS/Windows/Linux toasts). */}
        {active === 'timer' && (
          <button
            className="timer-skip"
            onClick={() => {
              void window.api?.notify('Pixel Pomodoro', 'Time is up! 🍅', false)
            }}
            aria-label="Test notification"
            title="Test OS notification (debug)"
            style={{
              left: pct(300),
              top: pct(414),
              width: pct(64),
              height: pct(19),
              fontSize: designVw(7)
            }}
          >
            <span>notif</span>
          </button>
        )}
      </div>

      {/* debug toggle buttons removed */}
    </div>
  )
}

export default App
