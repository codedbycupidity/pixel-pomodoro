import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'
import { MAX_POMODOROS_PER_TASK, type Task } from '../../lib/tasks'

interface TaskRowProps {
  task: Task
  y: number
  isDragOver: boolean
  onToggle: () => void
  onTextChange: (text: string) => void
  onPomodorosChange: (n: number) => void
  onDelete: () => void
  onDragStart: () => void
  onDragOver: () => void
  onDragEnd: () => void
  onDrop: () => void
}

// Row geometry — sized to fit inside the tasks-frame.png visible bbox (179..382 x 135..383).
// 5 px inset on each side keeps content off the pink frame edges.
export const TASK_ROW_LEFT = 184
export const TASK_ROW_W = 193
export const TASK_ROW_HEIGHT = 22

// Inner-column x-offsets, relative to TASK_ROW_LEFT.
const DRAG_W = 8
const CHECK_W = 12
const TEXT_W = 100
const POMO_W = 38
const DEL_W = 12
const DRAG_OFFSET = 0
const CHECK_OFFSET = DRAG_OFFSET + DRAG_W + 3 // 11
const TEXT_OFFSET = CHECK_OFFSET + CHECK_W + 4 // 27
const POMO_OFFSET = TEXT_OFFSET + TEXT_W + 4 // 131
const DEL_OFFSET = POMO_OFFSET + POMO_W + 4 // 173

export function TaskRow({
  task,
  y,
  isDragOver,
  onToggle,
  onTextChange,
  onPomodorosChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}: TaskRowProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const fontSize = designVw(8)

  function commitEdit(): void {
    const next = editText.trim()
    if (next && next !== task.text) onTextChange(next)
    setEditing(false)
  }

  function cyclePomodoros(): void {
    const next = (task.pomodoros % MAX_POMODOROS_PER_TASK) + 1
    onPomodorosChange(next)
  }

  return (
    <div
      className={`task-row ${isDragOver ? 'is-drag-over' : ''}`}
      style={{
        left: pct(TASK_ROW_LEFT),
        top: pct(y),
        width: pct(TASK_ROW_W),
        height: pct(TASK_ROW_HEIGHT)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
    >
      <button
        className="task-drag-handle"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-label="Drag to reorder"
        style={{
          left: pct(DRAG_OFFSET),
          width: pct(DRAG_W),
          fontSize
        }}
      >
        ⋮⋮
      </button>

      <button
        className={`task-checkbox ${task.done ? 'is-done' : ''}`}
        onClick={onToggle}
        aria-pressed={task.done}
        aria-label={task.done ? 'Mark not done' : 'Mark done'}
        style={{
          left: pct(CHECK_OFFSET),
          width: pct(CHECK_W),
          height: pct(CHECK_W),
          fontSize
        }}
      >
        {task.done ? '✓' : ''}
      </button>

      {editing ? (
        <input
          className="task-edit-input"
          value={editText}
          autoFocus
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            else if (e.key === 'Escape') {
              setEditText(task.text)
              setEditing(false)
            }
          }}
          style={{
            left: pct(TEXT_OFFSET),
            width: pct(TEXT_W),
            fontSize
          }}
        />
      ) : (
        <button
          className={`task-text ${task.done ? 'is-done' : ''}`}
          onClick={() => {
            setEditText(task.text)
            setEditing(true)
          }}
          style={{
            left: pct(TEXT_OFFSET),
            width: pct(TEXT_W),
            fontSize
          }}
          title="Click to edit"
        >
          {task.text}
        </button>
      )}

      <button
        className="task-pomo"
        onClick={cyclePomodoros}
        aria-label={`Pomodoros: ${task.pomodoros}, click to cycle`}
        style={{
          left: pct(POMO_OFFSET),
          width: pct(POMO_W),
          fontSize
        }}
        title="Pomodoros for this task — click to change"
      >
        {task.pomodoros} 🍓
      </button>

      <button
        className="task-delete"
        onClick={onDelete}
        aria-label="Delete task"
        style={{
          left: pct(DEL_OFFSET),
          width: pct(DEL_W),
          fontSize
        }}
      >
        ×
      </button>
    </div>
  )
}
