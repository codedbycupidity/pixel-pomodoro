import { useState } from 'react'
import { AddTaskInput } from '../components/tasks/AddTaskInput'
import { TaskFilters } from '../components/tasks/TaskFilters'
import { TaskRow, TASK_ROW_HEIGHT } from '../components/tasks/TaskRow'
import { applyTaskFilter, newTask, type Task, type TaskFilter } from '../lib/tasks'

interface TasksPanelProps {
  tasks: Task[]
  setTasks: (updater: (prev: Task[]) => Task[]) => void
}

// Layout — within tasks-frame.png visible bbox (179..382 in x, 135..383 in y).
// Stack: add-input  →  task rows  →  filter row.
const ADD_INPUT_Y = 173
const LIST_TOP = 200
const LIST_GAP = 1
const MAX_VISIBLE_ROWS = 6

export function TasksPanel({ tasks, setTasks }: TasksPanelProps): React.JSX.Element {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const filtered = applyTaskFilter(tasks, filter)
  const visible = filtered.slice(0, MAX_VISIBLE_ROWS)

  function patchTask(id: string, patch: Partial<Task>): void {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function deleteTask(id: string): void {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function addTask(text: string): void {
    setTasks((prev) => [...prev, newTask(text)])
  }

  function clearDoneTasks(): void {
    setTasks((prev) => prev.filter((t) => !t.done))
  }

  // Reorder applies to the *unfiltered* tasks array using the dragged item's identity,
  // so dragging works regardless of which filter view is active.
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
      <AddTaskInput y={ADD_INPUT_Y} onAdd={addTask} />

      {visible.map((task, i) => (
        <TaskRow
          key={task.id}
          task={task}
          y={LIST_TOP + i * (TASK_ROW_HEIGHT + LIST_GAP)}
          isDragOver={dragOverIndex === i && dragIndex !== i}
          onToggle={() => patchTask(task.id, { done: !task.done })}
          onTextChange={(text) => patchTask(task.id, { text })}
          onPomodorosChange={(pomodoros) => patchTask(task.id, { pomodoros })}
          onDelete={() => deleteTask(task.id)}
          onDragStart={() => setDragIndex(i)}
          onDragOver={() => setDragOverIndex(i)}
          onDragEnd={endDrag}
          onDrop={() => {
            reorder()
            endDrag()
          }}
        />
      ))}

      <TaskFilters filter={filter} setFilter={setFilter} onClearDone={clearDoneTasks} />
    </>
  )
}
