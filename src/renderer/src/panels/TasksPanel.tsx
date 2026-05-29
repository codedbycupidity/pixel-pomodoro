import { useState } from 'react'
import { AddTaskButton } from '../components/tasks/AddTaskButton'
import { AddTaskOverlay } from '../components/tasks/AddTaskOverlay'
import { TaskFilters } from '../components/tasks/TaskFilters'
import { TaskRow, TASK_ROW_HEIGHT } from '../components/tasks/TaskRow'
import { applyTaskFilter, type Task, type TaskFilter } from '../lib/tasks'

interface TasksPanelProps {
  tasks: Task[]
  setTasks: (updater: (prev: Task[]) => Task[]) => void
}

// Layout — within tasks-frame.png content band (y 165..348 in 512 design canvas).
const LIST_TOP = 192
const LIST_GAP = 1
const MAX_VISIBLE_ROWS = 7

export function TasksPanel({ tasks, setTasks }: TasksPanelProps): React.JSX.Element {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddOverlay, setShowAddOverlay] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const filtered = applyTaskFilter(tasks, filter)
  const visible = filtered.slice(0, MAX_VISIBLE_ROWS)
  const hasSelection = selectedId !== null && tasks.some((t) => t.id === selectedId)

  function patchTask(id: string, patch: Partial<Task>): void {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function addTask(text: string, pomodoros: number): void {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `t-${Date.now()}`
    setTasks((prev) => [...prev, { id, text, pomodoros, done: false }])
    setShowAddOverlay(false)
  }

  function deleteSelected(): void {
    if (!selectedId) return
    setTasks((prev) => prev.filter((t) => t.id !== selectedId))
    setSelectedId(null)
  }

  // Reorder applies to the *unfiltered* tasks array using id identity, so dragging
  // works regardless of which filter view is active.
  function reorder(): void {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) return
    const draggedTask = visible[dragIndex]
    const targetTask = visible[dragOverIndex]
    if (!draggedTask || !targetTask) return
    setTasks((prev) => {
      const next = prev.slice()
      const fromIdx = next.findIndex((t) => t.id === draggedTask.id)
      const toIdx = next.findIndex((t) => t.id === targetTask.id)
      if (fromIdx === -1 || toIdx === -1) return prev
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
  }

  function endDrag(): void {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <>
      <AddTaskButton onClick={() => setShowAddOverlay(true)} />

      {visible.map((task, i) => (
        <TaskRow
          key={task.id}
          task={task}
          y={LIST_TOP + i * (TASK_ROW_HEIGHT + LIST_GAP)}
          isSelected={selectedId === task.id}
          isDragOver={dragOverIndex === i && dragIndex !== i}
          onSelect={() => setSelectedId(task.id === selectedId ? null : task.id)}
          onToggle={() => patchTask(task.id, { done: !task.done })}
          onTextChange={(text) => patchTask(task.id, { text })}
          onPomodorosChange={(pomodoros) => patchTask(task.id, { pomodoros })}
          onDragStart={() => setDragIndex(i)}
          onDragOver={() => setDragOverIndex(i)}
          onDragEnd={endDrag}
          onDrop={() => {
            reorder()
            endDrag()
          }}
        />
      ))}

      <TaskFilters
        filter={filter}
        setFilter={setFilter}
        onDeleteSelected={deleteSelected}
        hasSelection={hasSelection}
      />

      {showAddOverlay && (
        <AddTaskOverlay onSave={addTask} onCancel={() => setShowAddOverlay(false)} />
      )}
    </>
  )
}
