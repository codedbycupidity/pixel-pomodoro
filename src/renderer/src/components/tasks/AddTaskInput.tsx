import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'
import { TASK_ROW_HEIGHT, TASK_ROW_LEFT, TASK_ROW_W } from './TaskRow'

interface AddTaskInputProps {
  y: number
  onAdd: (text: string) => void
}

const ADD_BTN_W = 22
const INPUT_W = TASK_ROW_W - ADD_BTN_W - 4

export function AddTaskInput({ y, onAdd }: AddTaskInputProps): React.JSX.Element {
  const [text, setText] = useState('')
  const fontSize = designVw(8)

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
        left: pct(TASK_ROW_LEFT),
        top: pct(y),
        width: pct(TASK_ROW_W),
        height: pct(TASK_ROW_HEIGHT)
      }}
    >
      <input
        className="task-add-input"
        value={text}
        placeholder="+ add a task..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          else if (e.key === 'Escape') setText('')
        }}
        style={{ width: pct(INPUT_W), fontSize }}
      />
      <button
        className="task-add-btn"
        onClick={submit}
        aria-label="Add task"
        style={{
          left: pct(INPUT_W + 4),
          width: pct(ADD_BTN_W),
          fontSize
        }}
      >
        +
      </button>
    </div>
  )
}
