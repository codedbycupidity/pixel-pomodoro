import { designVw, pct } from '../../lib/canvas'
import type { TaskFilter } from '../../lib/tasks'

interface TaskFiltersProps {
  filter: TaskFilter
  setFilter: (f: TaskFilter) => void
  onClearDone: () => void
}

// Bottom strip — sits just above the trash-button image (which lives at x=351..377, y=349..373).
// The three pills live to the LEFT of the trash button.
const FILTER_ROW_LEFT = 184
export const FILTER_ROW_Y = 350
export const FILTER_ROW_H = 18

const PILL_W = 48
const PILL_GAP = 4

const OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'active', label: 'active' },
  { value: 'done', label: 'done' }
]

// Clickable area over the trash-button image so it actually deletes done tasks.
const TRASH_HITBOX = { left: 351, top: 349, width: 26, height: 24 }

export function TaskFilters({ filter, setFilter, onClearDone }: TaskFiltersProps): React.JSX.Element {
  const fontSize = designVw(8)
  return (
    <>
      {OPTIONS.map((opt, i) => (
        <button
          key={opt.value}
          className={`task-filter ${filter === opt.value ? 'is-active' : ''}`}
          onClick={() => setFilter(opt.value)}
          style={{
            left: pct(FILTER_ROW_LEFT + i * (PILL_W + PILL_GAP)),
            top: pct(FILTER_ROW_Y),
            width: pct(PILL_W),
            height: pct(FILTER_ROW_H),
            fontSize
          }}
        >
          <span>{opt.label}</span>
        </button>
      ))}
      <button
        className="task-trash-hitbox"
        onClick={onClearDone}
        aria-label="Clear completed tasks"
        title="Clear completed tasks"
        style={{
          left: pct(TRASH_HITBOX.left),
          top: pct(TRASH_HITBOX.top),
          width: pct(TRASH_HITBOX.width),
          height: pct(TRASH_HITBOX.height)
        }}
      />
    </>
  )
}
