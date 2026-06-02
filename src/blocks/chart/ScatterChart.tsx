import { linearScale, niceTicks, formatTick } from './scales'

export interface ScatterDatum {
  x: number
  y: number
  label?: string
  color: string
}

interface Props {
  points: ScatterDatum[]
  height?: number
  xLabel?: string
  yLabel?: string
}

const VW = 640
const PAD = { left: 48, right: 16, top: 14, bottom: 30 }

export function ScatterChart({ points, height = 240, xLabel, yLabel }: Props) {
  const H = height
  const finite = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))

  if (finite.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700"
        style={{ height }}
      >
        No points to plot
      </div>
    )
  }

  const xTicks = niceTicks(Math.min(...finite.map((p) => p.x)), Math.max(...finite.map((p) => p.x)), 6)
  const yTicks = niceTicks(Math.min(...finite.map((p) => p.y)), Math.max(...finite.map((p) => p.y)), 5)
  const xmin = xTicks[0]
  const xmax = xTicks[xTicks.length - 1]
  const ymin = yTicks[0]
  const ymax = yTicks[yTicks.length - 1]

  const sx = linearScale([xmin, xmax], [PAD.left, VW - PAD.right])
  const sy = linearScale([ymin, ymax], [H - PAD.bottom, PAD.top])

  const zeroInX = xmin <= 0 && xmax >= 0
  const zeroInY = ymin <= 0 && ymax >= 0

  return (
    <svg
      viewBox={`0 0 ${VW} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="scatter chart"
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
            <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize={11} className="fill-slate-500 dark:fill-slate-400">
              {formatTick(t)}
            </text>
          </g>
        )
      })}
      {xTicks.map((t) => {
        const x = sx(t)
        return (
          <text key={`x${t}`} x={x} y={H - PAD.bottom + 16} textAnchor="middle" fontSize={11} className="fill-slate-500 dark:fill-slate-400">
            {formatTick(t)}
          </text>
        )
      })}

      {/* zero axes (coordinate plane) */}
      {zeroInY && (
        <line x1={PAD.left} x2={VW - PAD.right} y1={sy(0)} y2={sy(0)} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1} />
      )}
      {zeroInX && (
        <line x1={sx(0)} x2={sx(0)} y1={PAD.top} y2={H - PAD.bottom} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1} />
      )}

      {finite.map((p, i) => (
        <g key={i}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill={p.color} stroke="white" strokeWidth={1} />
          {p.label && (
            <text x={sx(p.x) + 7} y={sy(p.y) - 6} fontSize={11} className="fill-slate-600 dark:fill-slate-300">
              {p.label}
            </text>
          )}
        </g>
      ))}

      {xLabel && (
        <text x={(PAD.left + VW - PAD.right) / 2} y={H - 2} textAnchor="middle" fontSize={11} className="fill-slate-600 dark:fill-slate-300">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={12} y={H / 2} textAnchor="middle" fontSize={11} transform={`rotate(-90 12 ${H / 2})`} className="fill-slate-600 dark:fill-slate-300">
          {yLabel}
        </text>
      )}
    </svg>
  )
}
