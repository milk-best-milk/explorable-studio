/** Minimal linear-scale + nice-ticks helpers for the hand-rolled SVG charts. */

export type Scale = (value: number) => number

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0 || 1
  return (v) => r0 + ((v - d0) / span) * (r1 - r0)
}

function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range))
  const frac = range / Math.pow(10, exp)
  let niceFrac: number
  if (round) niceFrac = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10
  else niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10
  return niceFrac * Math.pow(10, exp)
}

/** Produce "nice" round tick values spanning [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) {
    min -= 1
    max += 1
  }
  const range = niceNum(max - min, false)
  const step = niceNum(range / Math.max(1, count - 1), true)
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) {
    ticks.push(Number(v.toPrecision(12)))
  }
  return ticks
}

/** Compact tick label (avoids long floating point tails). */
export function formatTick(n: number): string {
  if (!Number.isFinite(n)) return ''
  if (n === 0) return '0'
  const abs = Math.abs(n)
  if (abs >= 1e6 || abs < 1e-3) return n.toExponential(1).replace('e+', 'e')
  return Number(n.toPrecision(4)).toString()
}

export const CHART_PALETTE = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#0ea5e9', // sky
]
