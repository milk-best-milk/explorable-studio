import { linearScale, niceTicks, formatTick } from './scales'

export interface BarDatum {
  label: string
  value: number
  color: string
}

interface Props {
  bars: BarDatum[]
  height?: number
  yLabel?: string
}

const VW = 640
const PAD = { left: 48, right: 16, top: 14, bottom: 34 }

export function BarChart({ bars, height = 240, yLabel }: Props) {
  const H = height
  const values = bars.map((b) => (Number.isFinite(b.value) ? b.value : 0))

  if (bars.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700"
        style={{ height }}
      >
        No bars to plot
      </div>
    )
  }

  const yTicks = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 5)
  const ymin = yTicks.length ? yTicks[0] : Math.min(0, ...values)
  const ymax = yTicks.length ? yTicks[yTicks.length - 1] : Math.max(0, ...values)
  const sy = linearScale([ymin, ymax], [H - PAD.bottom, PAD.top])
  const zeroY = sy(0)

  const plotW = VW - PAD.left - PAD.right
  const slot = plotW / bars.length
  const barW = Math.min(64, slot * 0.62)

  return (
    <svg
      viewBox={`0 0 ${VW} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="bar chart"
    >
      {yTicks.map((t) => {
        const y = sy(t)
        return (
          <g key={`y${t}`}>
            <line
              x1={PAD.left}
              x2={VW - PAD.right}
              y1={y}
              y2={y}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={11}
              className="fill-slate-500 dark:fill-slate-400"
            >
              {formatTick(t)}
            </text>
          </g>
        )
      })}

      {bars.map((b, i) => {
        const value = Number.isFinite(b.value) ? b.value : 0
        const cx = PAD.left + slot * i + slot / 2
        const y = sy(value)
        const top = Math.min(y, zeroY)
        const h = Math.abs(y - zeroY)
        return (
          <g key={i}>
            <rect
              x={cx - barW / 2}
              y={top}
              width={barW}
              height={Math.max(0, h)}
              rx={3}
              fill={b.color}
            />
            <text
              x={cx}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              fontSize={11}
              className="fill-slate-600 dark:fill-slate-300"
            >
              {b.label}
            </text>
            <text
              x={cx}
              y={top - 4}
              textAnchor="middle"
              fontSize={10}
              className="fill-slate-500 dark:fill-slate-400"
            >
              {formatTick(value)}
            </text>
          </g>
        )
      })}

      <line
        x1={PAD.left}
        x2={VW - PAD.right}
        y1={zeroY}
        y2={zeroY}
        className="stroke-slate-400 dark:stroke-slate-500"
        strokeWidth={1}
      />

      {yLabel && (
        <text
          x={12}
          y={H / 2}
          textAnchor="middle"
          fontSize={11}
          transform={`rotate(-90 12 ${H / 2})`}
          className="fill-slate-600 dark:fill-slate-300"
        >
          {yLabel}
        </text>
      )}
    </svg>
  )
}
