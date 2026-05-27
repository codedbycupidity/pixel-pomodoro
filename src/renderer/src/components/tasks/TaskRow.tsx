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

// Row geometry (design units in the 512x512 canvas).
const ROW_LEFT = 148
const ROW_W = 322
const ROW_H = 22

const DRAG_X = ROW_LEFT // 148
const DRAG_W = 10
const CHECK_X = ROW_LEFT + 12 // 160
const CHECK_W = 12
const TEXT_X = ROW_LEFT + 28 // 176
const TEXT_W = 200
const POMO_X = ROW_LEFT + 232 // 380
const POMO_W = 52
const DEL_X = ROW_LEFT + 290 // 438
const DEL_W = 16

export const TASK_ROW_HEIGHT = ROW_H

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
        left: pct(ROW_LEFT),
        top: pct(y),
        width: pct(ROW_W),
        height: pct(ROW_H)
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
          left: pct(DRAG_X - ROW_LEFT),
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
          left: pct(CHECK_X - ROW_LEFT),
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
            left: pct(TEXT_X - ROW_LEFT),
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
            left: pct(TEXT_X - ROW_LEFT),
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
          left: pct(POMO_X - ROW_LEFT),
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
          left: pct(DEL_X - ROW_LEFT),
          width: pct(DEL_W),
          fontSize
        }}
      >
        ×
      </button>
    </div>
  )
}
