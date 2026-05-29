import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'
import { MAX_POMODOROS_PER_TASK } from '../../lib/tasks'

interface AddTaskOverlayProps {
  onSave: (text: string, pomodoros: number) => void
  onCancel: () => void
}

// Overlay sits inside the tasks-frame content area (x 185..375, y 165..348).
// Slides DOWN from the top — covers the upper portion so the list peeks below.
const OVERLAY_LEFT = 187
const OVERLAY_TOP = 168
const OVERLAY_W = 188
const OVERLAY_H = 112

export function AddTaskOverlay({ onSave, onCancel }: AddTaskOverlayProps): React.JSX.Element {
  const [text, setText] = useState('')
  const [pomodoros, setPomodoros] = useState(1)

  function save(): void {
    const trimmed = text.trim()
    if (!trimmed) return
    onSave(trimmed, pomodoros)
  }

  return (
    <div
      className="task-add-overlay"
      onClick={(e) => e.stopPropagation()}
      style={{
        left: pct(OVERLAY_LEFT),
        top: pct(OVERLAY_TOP),
        width: pct(OVERLAY_W),
        height: pct(OVERLAY_H),
        fontSize: designVw(8)
      }}
    >
      <div className="task-add-overlay-header">
        <span className="task-add-overlay-title">new task</span>
        <button
          className="task-add-overlay-close"
          onClick={onCancel}
          aria-label="Cancel"
        >
          ×
        </button>
      </div>

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
      />

      <div className="task-add-overlay-pomo">
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

      <div className="task-add-overlay-actions">
        <button className="task-add-overlay-cancel" onClick={onCancel}>
          cancel
        </button>
        <button
          className="task-add-overlay-save"
          onClick={save}
          disabled={!text.trim()}
        >
          save
        </button>
      </div>
    </div>
  )
}
