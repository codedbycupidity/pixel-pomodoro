import { designVw, pct } from '../../lib/canvas'

interface AddTaskButtonProps {
  onClick: () => void
}

// Small "+" button anchored at top-right of the tasks-frame content area.
const BTN_LEFT = 354
const BTN_TOP = 168
const BTN_SIZE = 16

export function AddTaskButton({ onClick }: AddTaskButtonProps): React.JSX.Element {
  return (
    <button
      className="task-add-btn"
      onClick={onClick}
      aria-label="Add a task"
      title="Add a task"
      style={{
        left: pct(BTN_LEFT),
        top: pct(BTN_TOP),
        width: pct(BTN_SIZE),
        height: pct(BTN_SIZE),
        fontSize: designVw(8)
      }}
    >
      +
    </button>
  )
}
