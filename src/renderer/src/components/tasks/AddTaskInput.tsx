import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'

interface AddTaskInputProps {
  y: number
  onAdd: (text: string) => void
}

// Sits inside the tasks-frame content area (x 185..375).
const ROW_LEFT = 188
const ROW_W = 184
const ROW_H = 18

export function AddTaskInput({ y, onAdd }: AddTaskInputProps): React.JSX.Element {
  const [text, setText] = useState('')

  function submit(): void {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <div
      className="task-add-row"
      style={{
        left: pct(ROW_LEFT),
        top: pct(y),
        width: pct(ROW_W),
        height: pct(ROW_H),
        fontSize: designVw(8)
      }}
    >
      <input
        className="task-add-input"
        value={text}
        placeholder="add a task..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          else if (e.key === 'Escape') setText('')
        }}
      />
      <button
        className="task-add-btn"
        onClick={submit}
        disabled={!text.trim()}
        aria-label="Add task"
        title="Add task"
      >
        +
      </button>
    </div>
  )
}
