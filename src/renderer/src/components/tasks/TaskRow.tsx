import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'
import { MAX_POMODOROS_PER_TASK, type Task } from '../../lib/tasks'

interface TaskRowProps {
  task: Task
  y: number
  isSelected: boolean
  isDragOver: boolean
  onSelect: () => void
  onToggle: () => void
  onTextChange: (text: string) => void
  onPomodorosChange: (n: number) => void
  onDragStart: () => void
  onDragOver: () => void
  onDragEnd: () => void
  onDrop: () => void
}

// Row geometry — sits inside the tasks-frame content band (x 185..375, y 175..343).
export const TASK_ROW_LEFT = 188
export const TASK_ROW_W = 184
export const TASK_ROW_HEIGHT = 22

export function TaskRow({
  task,
  y,
  isSelected,
  isDragOver,
  onSelect,
  onToggle,
  onTextChange,
  onPomodorosChange,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}: TaskRowProps): React.JSX.Element {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  function commitEdit(): void {
    const next = editText.trim()
    if (next && next !== task.text) onTextChange(next)
    setEditing(false)
  }

  function decPomo(): void {
    if (task.pomodoros > 1) onPomodorosChange(task.pomodoros - 1)
  }
  function incPomo(): void {
    if (task.pomodoros < MAX_POMODOROS_PER_TASK) onPomodorosChange(task.pomodoros + 1)
  }

  return (
    <div
      className={`task-row ${isSelected ? 'is-selected' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
      draggable={!editing}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver()
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      style={{
        left: pct(TASK_ROW_LEFT),
        top: pct(y),
        width: pct(TASK_ROW_W),
        height: pct(TASK_ROW_HEIGHT),
        fontSize: designVw(8)
      }}
    >
      <button
        className={`task-checkbox ${task.done ? 'is-done' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        aria-pressed={task.done}
        aria-label={task.done ? 'Mark not done' : 'Mark done'}
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
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            else if (e.key === 'Escape') {
              setEditText(task.text)
              setEditing(false)
            }
          }}
        />
      ) : (
        <button
          className={`task-text ${task.done ? 'is-done' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
            setEditText(task.text)
            setEditing(true)
          }}
          title="Click to edit"
        >
          {task.text}
        </button>
      )}

      <div className="task-pomo-group">
        <button
          className="task-pomo-step"
          onClick={(e) => {
            e.stopPropagation()
            decPomo()
          }}
          disabled={task.pomodoros <= 1}
          aria-label="Decrease pomodoros"
        >
          −
        </button>
        <span className="task-pomo-value">{task.pomodoros} 🍓</span>
        <button
          className="task-pomo-step"
          onClick={(e) => {
            e.stopPropagation()
            incPomo()
          }}
          disabled={task.pomodoros >= MAX_POMODOROS_PER_TASK}
          aria-label="Increase pomodoros"
        >
          +
        </button>
      </div>
    </div>
  )
}
