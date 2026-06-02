import { evaluate, ExpressionError, type Value } from './expression'

/** Format a value for display inside prose or formulas. */
export function formatValue(v: Value): string {
  if (typeof v === 'number') return formatNumber(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  return v
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return n > 0 ? '∞' : n < 0 ? '-∞' : 'NaN'
  if (Number.isInteger(n)) return String(n)
  const abs = Math.abs(n)
  // Use significant-digit formatting for very large/small magnitudes.
  if (abs !== 0 && (abs >= 1e7 || abs < 1e-4)) {
    return Number(n.toPrecision(4)).toString()
  }
  return n.toFixed(4).replace(/\.?0+$/, '')
}

const INTERP = /\{\{([\s\S]*?)\}\}/g

/**
 * Replace `{{ expression }}` placeholders in a template with evaluated, formatted
 * values. Errors are rendered inline (helpful while authoring) rather than thrown.
 */
export function interpolate(template: string, scope: Record<string, Value>): string {
  return template.replace(INTERP, (_match, raw: string) => {
    const expr = raw.trim()
    if (!expr) return ''
    try {
      return formatValue(evaluate(expr, scope))
    } catch (err) {
      return `⚠️${err instanceof ExpressionError ? err.message : 'error'}`
    }
  })
}
