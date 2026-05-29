import { designVw, pct } from '../../lib/canvas'
import type { TaskFilter } from '../../lib/tasks'

interface TaskFiltersProps {
  filter: TaskFilter
  setFilter: (f: TaskFilter) => void
  onDeleteSelected: () => void
  hasSelection: boolean
}

// Bottom strip — segmented control on the left, standalone trash button on the right.
const SEGMENTS_LEFT = 188
const SEGMENTS_W = 140
const SEGMENTS_TOP = 351
const SEGMENTS_H = 18

const TRASH_LEFT = 336
const TRASH_TOP = 351
const TRASH_W = 24
const TRASH_H = 18

const OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'active', label: 'active' },
  { value: 'done', label: 'done' }
]

// Pixel-art trash icon (12x12 viewBox).
function TrashIcon(): React.JSX.Element {
  return (
    <svg
      className="task-trash-icon"
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* lid handle */}
      <rect x="4" y="1" width="4" height="1" fill="currentColor" />
      {/* lid */}
      <rect x="1" y="2" width="10" height="1" fill="currentColor" />
      {/* body outline */}
      <rect x="2" y="3" width="1" height="8" fill="currentColor" />
      <rect x="9" y="3" width="1" height="8" fill="currentColor" />
      <rect x="2" y="11" width="8" height="1" fill="currentColor" />
      {/* inner vertical stripes */}
      <rect x="4" y="4" width="1" height="6" fill="currentColor" />
      <rect x="6" y="4" width="1" height="6" fill="currentColor" />
      <rect x="8" y="4" width="1" height="6" fill="currentColor" />
    </svg>
  )
}

export function TaskFilters({
  filter,
  setFilter,
  onDeleteSelected,
  hasSelection
}: TaskFiltersProps): React.JSX.Element {
  const fontSize = designVw(7)
  return (
    <>
      <div
        className="task-filter-segments"
        style={{
          left: pct(SEGMENTS_LEFT),
          top: pct(SEGMENTS_TOP),
          width: pct(SEGMENTS_W),
          height: pct(SEGMENTS_H),
          fontSize
        }}
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`task-filter-segment ${filter === opt.value ? 'is-active' : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <button
        className={`task-trash-btn ${hasSelection ? '' : 'is-disabled'}`}
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        aria-label="Delete selected task"
        title={hasSelection ? 'Delete selected task' : 'Select a task first'}
        style={{
          left: pct(TRASH_LEFT),
          top: pct(TRASH_TOP),
          width: pct(TRASH_W),
          height: pct(TRASH_H),
          fontSize
        }}
      >
        <TrashIcon />
      </button>
    </>
  )
}
