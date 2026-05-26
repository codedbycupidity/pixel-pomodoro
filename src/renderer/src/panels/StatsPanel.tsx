import {
  CANVAS,
  designVw,
  pct,
  STRAWBERRY_OVERFLOW_LABEL,
  STRAWBERRY_SLOTS
} from '../lib/canvas'

interface StatsPanelProps {
  pomodorosToday: number
}

// Renders the dynamic strawberry counter:
// - N filled + (6-N) empty strawberries
// - "+M" overflow label when count exceeds 6
export function StatsPanel({ pomodorosToday }: StatsPanelProps): React.JSX.Element {
  const overflow = pomodorosToday > STRAWBERRY_SLOTS.length
  return (
    <>
      {STRAWBERRY_SLOTS.map((slot, i) => {
        const filled = i < Math.min(pomodorosToday, STRAWBERRY_SLOTS.length)
        const src = filled
          ? '/stats/completed-strawberry.png'
          : '/stats/empty-strawberry.png'
        return (
          <img
            key={`berry-${i}`}
            className="figma-asset"
            alt=""
            src={src}
            style={{
              left: pct(slot.x),
              top: pct(slot.y),
              width: pct(CANVAS),
              height: pct(CANVAS)
            }}
          />
        )
      })}
      {overflow && (
        <div
          className="figma-text"
          style={{
            left: pct(STRAWBERRY_OVERFLOW_LABEL.x),
            top: pct(STRAWBERRY_OVERFLOW_LABEL.y),
            width: pct(STRAWBERRY_OVERFLOW_LABEL.width),
            height: pct(STRAWBERRY_OVERFLOW_LABEL.height),
            fontSize: designVw(STRAWBERRY_OVERFLOW_LABEL.fontSize),
            lineHeight: designVw(STRAWBERRY_OVERFLOW_LABEL.lineHeightPx),
            color: 'rgb(137, 55, 96)'
          }}
        >
          +{pomodorosToday - STRAWBERRY_SLOTS.length}
        </div>
      )}
    </>
  )
}
