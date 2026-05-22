import { useEffect, useRef, useState } from 'react'

const SESSION_SECONDS = 25 * 60

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Timer(): React.JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return

    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  return (
    <section>
      <div>{formatTime(secondsLeft)}</div>
      <button onClick={() => setRunning((r) => !r)} disabled={secondsLeft === 0}>
        {running ? 'Pause' : 'Start'}
      </button>
    </section>
  )
}

export default Timer
