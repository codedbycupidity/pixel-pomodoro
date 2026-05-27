import { useState } from 'react'
import { AddTaskInput } from '../components/tasks/AddTaskInput'
import { TaskRow, TASK_ROW_HEIGHT } from '../components/tasks/TaskRow'
import { newTask, type Task } from '../lib/tasks'

interface TasksPanelProps {
  tasks: Task[]
  setTasks: (updater: (prev: Task[]) => Task[]) => void
}

// List geometry — design units in the 512x512 canvas.
const LIST_TOP = 175
const LIST_GAP = 1 // visual gap between rows
const MAX_VISIBLE_ROWS = 8

export function TasksPanel({ tasks, setTasks }: TasksPanelProps): React.JSX.Element {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const visible = tasks.slice(0, MAX_VISIBLE_ROWS)
  const addRowY = LIST_TOP + visible.length * (TASK_ROW_HEIGHT + LIST_GAP)

  function patchTask(id: string, patch: Partial<Task>): void {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function deleteTask(id: string): void {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function addTask(text: string): void {
    setTasks((prev) => [...prev, newTask(text)])
  }

  function reorder(): void {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) return
    setTasks((prev) => {
      const next = prev.slice()
      const [moved] = next.splice(dragIndex, 1)
      next.splice(dragOverIndex, 0, moved)
      return next
    })
  }

  function endDrag(): void {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <>
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
      {visible.length < MAX_VISIBLE_ROWS && <AddTaskInput y={addRowY} onAdd={addTask} />}
    </>
  )
}
