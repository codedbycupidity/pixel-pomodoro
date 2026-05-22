import { useState } from 'react'
import Timer from './components/Timer/Timer'
import Tasks from './components/Tasks/Tasks'
import Stats from './components/Stats/Stats'
import Settings from './components/Settings/Settings'

type Panel = 'timer' | 'tasks' | 'stats' | 'settings'

const PANELS: { id: Panel; label: string }[] = [
  { id: 'timer', label: 'Timer' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'stats', label: 'Stats' },
  { id: 'settings', label: 'Settings' }
]

function App(): React.JSX.Element {
  const [active, setActive] = useState<Panel>('timer')

  return (
    <div>
      <nav>
        <ul>
          {PANELS.map((panel) => (
            <li key={panel.id}>
              <button onClick={() => setActive(panel.id)}>{panel.label}</button>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        {active === 'timer' && <Timer />}
        {active === 'tasks' && <Tasks />}
        {active === 'stats' && <Stats />}
        {active === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
