import Timer from './components/Timer/Timer'
import Tasks from './components/Tasks/Tasks'
import Stats from './components/Stats/Stats'
import Settings from './components/Settings/Settings'

function App(): React.JSX.Element {
  return (
    <main>
      <Timer />
      <Tasks />
      <Stats />
      <Settings />
    </main>
  )
}

export default App
