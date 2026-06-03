import { linearScale, niceTicks, formatTick } from './scales'

export interface Series {
  label?: string
  color: string
  /** Points in data space. A non-finite `y` creates a gap (e.g. asymptotes). */
  points: { x: number; y: number }[]
}

interface Props {
  series: Series[]
  height?: number
  xLabel?: string
  yLabel?: string
}

const VW = 640
const PAD = { left: 48, right: 16, top: 14, bottom: 30 }

export function LineChart({ series, height = 240, xLabel, yLabel }: Props) {
  const H = height
  const all = series.flatMap((s) => s.points)
  const finite = all.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))

  if (finite.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-700"
        style={{ height }}
      >
        No data to plot
      </div>
    )
  }

  const xs = finite.map((p) => p.x)
  const ys = finite.map((p) => p.y)
  let xmin = Math.min(...xs)
  let xmax = Math.max(...xs)
  if (xmin === xmax) {
    xmin -= 1
    xmax += 1
  }
  const yTicks = niceTicks(Math.min(...ys), Math.max(...ys), 5)
  const ymin = yTicks.length ? yTicks[0] : Math.min(...ys)
  const ymax = yTicks.length ? yTicks[yTicks.length - 1] : Math.max(...ys)
  const xTicks = niceTicks(xmin, xmax, 6).filter((t) => t >= xmin - 1e-9 && t <= xmax + 1e-9)

  const sx = linearScale([xmin, xmax], [PAD.left, VW - PAD.right])
  const sy = linearScale([ymin, ymax], [H - PAD.bottom, PAD.top])

  const pathFor = (points: Series['points']): string => {
    let d = ''
    let pen = false
    for (const p of points) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
        pen = false
        continue
      }
      const cx = sx(p.x)
      const cy = sy(Math.max(ymin, Math.min(ymax, p.y)))
      d += `${pen ? 'L' : 'M'}${cx.toFixed(2)} ${cy.toFixed(2)} `
      pen = true
    }
    return d.trim()
  }

  const showLegend = series.length > 1 && series.some((s) => s.label)

  return (
    <svg
      viewBox={`0 0 ${VW} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="chart"
    >
      {/* y gridlines + labels */}
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

      {/* x ticks + labels */}
      {xTicks.map((t) => {
        const x = sx(t)
        return (
          <g key={`x${t}`}>
            <line
              x1={x}
              x2={x}
              y1={H - PAD.bottom}
              y2={H - PAD.bottom + 4}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={1}
            />
            <text
              x={x}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              fontSize={11}
              className="fill-slate-500 dark:fill-slate-400"
            >
              {formatTick(t)}
            </text>
          </g>
        )
      })}

      {/* axis line */}
      <line
        x1={PAD.left}
        x2={VW - PAD.right}
        y1={H - PAD.bottom}
        y2={H - PAD.bottom}
        className="stroke-slate-400 dark:stroke-slate-500"
        strokeWidth={1}
      />

      {/* emphasised y = 0 baseline when the data crosses zero */}
      {ymin < 0 && ymax > 0 && (
        <line
          x1={PAD.left}
          x2={VW - PAD.right}
          y1={sy(0)}
          y2={sy(0)}
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth={1.5}
        />
      )}

      {/* series */}
      {series.map((s, i) => (
        <path
          key={i}
          d={pathFor(s.points)}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* axis labels */}
      {xLabel && (
        <text
          x={(PAD.left + VW - PAD.right) / 2}
          y={H - 2}
          textAnchor="middle"
          fontSize={11}
          className="fill-slate-600 dark:fill-slate-300"
        >
          {xLabel}
        </text>
      )}
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

      {/* legend */}
      {showLegend &&
        series.map((s, i) => (
          <g key={`lg${i}`} transform={`translate(${PAD.left + 6 + i * 96}, ${PAD.top})`}>
            <rect width={10} height={10} y={-9} rx={2} fill={s.color} />
            <text x={14} y={0} fontSize={11} className="fill-slate-600 dark:fill-slate-300">
              {s.label ?? `series ${i + 1}`}
            </text>
          </g>
        ))}
    </svg>
  )
}
