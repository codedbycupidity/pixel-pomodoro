import { designVw, pct } from '../../lib/canvas'
import type { TaskFilter } from '../../lib/tasks'

interface TaskFiltersProps {
  filter: TaskFilter
  setFilter: (f: TaskFilter) => void
  onDeleteSelected: () => void
  hasSelection: boolean
}

// Bottom strip — pills on the left, trash hitbox over the trash-button image (x 351..377, y 349..373).
const FILTER_ROW_LEFT = 188
export const FILTER_ROW_Y = 354
export const FILTER_ROW_H = 16

const PILL_W = 44
const PILL_GAP = 3

const OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'active', label: 'active' },
  { value: 'done', label: 'done' }
]

const TRASH_HITBOX = { left: 351, top: 349, width: 26, height: 24 }

export function TaskFilters({
  filter,
  setFilter,
  onDeleteSelected,
  hasSelection
}: TaskFiltersProps): React.JSX.Element {
  const fontSize = designVw(7)
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
        className={`task-trash-hitbox ${hasSelection ? 'is-armed' : 'is-disabled'}`}
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        aria-label="Delete selected task"
        title={hasSelection ? 'Delete selected task' : 'Select a task first'}
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
