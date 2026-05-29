import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'
import { MAX_POMODOROS_PER_TASK } from '../../lib/tasks'

interface AddTaskOverlayProps {
  onSave: (text: string, pomodoros: number) => void
  onCancel: () => void
}

// Overlay sits inside the tasks-frame content area (x 185..375, y 165..348).
// Slides DOWN from the top — covers the upper portion so the list peeks below.
const OVERLAY_LEFT = 185
const OVERLAY_TOP = 165
const OVERLAY_W = 192
const OVERLAY_H = 110

// Inner layout (relative to overlay top-left).
const PADDING = 8
const TITLE_Y = 6
const INPUT_Y = 24
const INPUT_H = 18
const POMO_Y = 50
const POMO_H = 18
const BTN_Y = 80
const BTN_H = 20
const BTN_W = 56

export function AddTaskOverlay({ onSave, onCancel }: AddTaskOverlayProps): React.JSX.Element {
  const [text, setText] = useState('')
  const [pomodoros, setPomodoros] = useState(1)
  const fontSize = designVw(8)
  const titleFontSize = designVw(10)

  function save(): void {
    const trimmed = text.trim()
    if (!trimmed) return
    onSave(trimmed, pomodoros)
  }

  return (
    <div
      className="task-add-overlay"
      style={{
        left: pct(OVERLAY_LEFT),
        top: pct(OVERLAY_TOP),
        width: pct(OVERLAY_W),
        height: pct(OVERLAY_H)
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="task-add-overlay-title"
        style={{
          left: pct(PADDING),
          top: pct(TITLE_Y),
          fontSize: titleFontSize
        }}
      >
        new task
      </div>
      <button
        className="task-add-overlay-close"
        onClick={onCancel}
        aria-label="Cancel"
        style={{
          left: pct(OVERLAY_W - PADDING - 10),
          top: pct(TITLE_Y),
          fontSize
        }}
      >
        ×
      </button>

      <input
        className="task-add-overlay-input"
        autoFocus
        placeholder="task name..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          else if (e.key === 'Escape') onCancel()
        }}
        style={{
          left: pct(PADDING),
          top: pct(INPUT_Y),
          width: pct(OVERLAY_W - PADDING * 2),
          height: pct(INPUT_H),
          fontSize
        }}
      />

      <div
        className="task-add-overlay-pomo"
        style={{
          left: pct(PADDING),
          top: pct(POMO_Y),
          width: pct(OVERLAY_W - PADDING * 2),
          height: pct(POMO_H),
          fontSize
        }}
      >
        <span className="task-add-overlay-pomo-label">pomodoros:</span>
        <button
          className="task-add-overlay-step"
          onClick={() => setPomodoros((n) => Math.max(1, n - 1))}
          disabled={pomodoros <= 1}
          aria-label="Decrease pomodoros"
        >
          −
        </button>
        <span className="task-add-overlay-pomo-value">{pomodoros} 🍓</span>
        <button
          className="task-add-overlay-step"
          onClick={() => setPomodoros((n) => Math.min(MAX_POMODOROS_PER_TASK, n + 1))}
          disabled={pomodoros >= MAX_POMODOROS_PER_TASK}
          aria-label="Increase pomodoros"
        >
          +
        </button>
      </div>

      <button
        className="task-add-overlay-cancel"
        onClick={onCancel}
        style={{
          left: pct(OVERLAY_W - PADDING * 2 - BTN_W * 2 - 4),
          top: pct(BTN_Y),
          width: pct(BTN_W),
          height: pct(BTN_H),
          fontSize
        }}
      >
        cancel
      </button>
      <button
        className="task-add-overlay-save"
        onClick={save}
        disabled={!text.trim()}
        style={{
          left: pct(OVERLAY_W - PADDING - BTN_W),
          top: pct(BTN_Y),
          width: pct(BTN_W),
          height: pct(BTN_H),
          fontSize
        }}
      >
        save
      </button>
    </div>
  )
}
