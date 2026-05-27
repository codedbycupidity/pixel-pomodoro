import { useState } from 'react'
import { designVw, pct } from '../../lib/canvas'

interface AddTaskInputProps {
  y: number
  onAdd: (text: string) => void
}

const ROW_LEFT = 148
const ROW_W = 322
const ROW_H = 22

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
        left: pct(ROW_LEFT),
        top: pct(y),
        width: pct(ROW_W),
        height: pct(ROW_H)
      }}
    >
      <span className="task-add-prefix" style={{ fontSize }}>
        +
      </span>
      <input
        className="task-add-input"
        value={text}
        placeholder="add a task..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          else if (e.key === 'Escape') setText('')
        }}
        style={{ fontSize }}
      />
    </div>
  )
}
