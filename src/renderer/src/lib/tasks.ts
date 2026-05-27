export interface Task {
  id: string
  text: string
  done: boolean
  pomodoros: number
}

export type TaskFilter = 'all' | 'active' | 'done'

export function applyTaskFilter(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === 'active') return tasks.filter((t) => !t.done)
  if (filter === 'done') return tasks.filter((t) => t.done)
  return tasks
}

const STORAGE_KEY = 'pixel-pomodoro-tasks'

const DEFAULT_TASKS: Task[] = [
  { id: 'seed-1', text: 'finish design', done: false, pomodoros: 2 },
  { id: 'seed-2', text: 'reply to emails', done: false, pomodoros: 1 }
]

export const MAX_POMODOROS_PER_TASK = 9

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TASKS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_TASKS
    return parsed.filter(
      (t): t is Task =>
        t &&
        typeof t.id === 'string' &&
        typeof t.text === 'string' &&
        typeof t.done === 'boolean' &&
        typeof t.pomodoros === 'number'
    )
  } catch {
    return DEFAULT_TASKS
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // localStorage unavailable; silently drop.
  }
}

export function newTask(text: string): Task {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `t-${Date.now()}`,
    text,
    done: false,
    pomodoros: 1
  }
}
