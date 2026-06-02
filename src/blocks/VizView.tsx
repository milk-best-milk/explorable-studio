import { compile, evaluate, type Value, type VizBlock } from '../core'
import { LineChart, type Series } from './chart/LineChart'
import { BarChart, type BarDatum } from './chart/BarChart'
import { ScatterChart, type ScatterDatum } from './chart/ScatterChart'
import { CHART_PALETTE } from './chart/scales'

interface Props {
  block: VizBlock
  scope: Record<string, Value>
}

function num(v: Value): number {
  return typeof v === 'number' ? v : Number(v)
}

function tryEval(expr: string | undefined, scope: Record<string, Value>, fallback: number): number {
  if (!expr) return fallback
  try {
    return num(evaluate(expr, scope))
  } catch {
    return fallback
  }
}

/** A live chart driven by expressions over the reactive scope. */
export function VizView({ block, scope }: Props) {
  const title = block.title ? (
    <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">{block.title}</div>
  ) : null

  if (block.mode === 'bars') {
    const errors: string[] = []
    const bars: BarDatum[] = (block.bars ?? []).map((b, i) => {
      let value = NaN
      try {
        value = num(evaluate(b.expr, scope))
      } catch (err) {
        errors.push(`${b.label || `bar ${i + 1}`}: ${(err as Error).message}`)
      }
      return { label: b.label || `#${i + 1}`, value, color: b.color || CHART_PALETTE[i % CHART_PALETTE.length] }
    })
    return (
      <div>
        {title}
        <BarChart bars={bars} height={block.height} yLabel={block.yLabel} />
        <ChartErrors errors={errors} />
      </div>
    )
  }

  if (block.mode === 'scatter') {
    const errors: string[] = []
    const pts: ScatterDatum[] = (block.points ?? []).map((p, i) => {
      let x = NaN
      let y = NaN
      try {
        x = num(evaluate(p.x, scope))
      } catch (err) {
        errors.push(`point ${i + 1} x: ${(err as Error).message}`)
      }
      try {
        y = num(evaluate(p.y, scope))
      } catch (err) {
        errors.push(`point ${i + 1} y: ${(err as Error).message}`)
      }
      return { x, y, label: p.label, color: p.color || CHART_PALETTE[i % CHART_PALETTE.length] }
    })
    return (
      <div>
        {title}
        <ScatterChart points={pts} height={block.height} xLabel={block.xLabel} yLabel={block.yLabel} />
        <ChartErrors errors={errors} />
      </div>
    )
  }

  // function mode
  const xName = block.xName || 'x'
  const samples = Math.max(2, Math.min(1000, block.samples ?? 80))
  const xmin = tryEval(block.xMin, scope, 0)
  const xmax = tryEval(block.xMax, scope, 10)
  const errors: string[] = []

  const series: Series[] = (block.curves ?? []).map((curve, i) => {
    const color = curve.color || CHART_PALETTE[i % CHART_PALETTE.length]
    let compiled: ReturnType<typeof compile>
    try {
      compiled = compile(curve.expr)
    } catch (err) {
      errors.push(`${curve.label || `curve ${i + 1}`}: ${(err as Error).message}`)
      return { label: curve.label, color, points: [] }
    }
    const points: { x: number; y: number }[] = []
    for (let s = 0; s < samples; s++) {
      const x = xmin + ((xmax - xmin) * s) / (samples - 1)
      let y: number
      try {
        y = num(compiled.evaluate({ ...scope, [xName]: x }))
      } catch {
        y = NaN
      }
      points.push({ x, y })
    }
    return { label: curve.label, color, points }
  })

  return (
    <div>
      {title}
      <LineChart series={series} height={block.height} xLabel={block.xLabel} yLabel={block.yLabel} />
      <ChartErrors errors={errors} />
    </div>
  )
}

function ChartErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <div className="mt-1 space-y-0.5 text-xs text-red-500">
      {errors.map((e, i) => (
        <div key={i}>⚠️ {e}</div>
      ))}
    </div>
  )
}
