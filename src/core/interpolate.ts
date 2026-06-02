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
 * Split `expr | filter` on a top-level lone `|`, ignoring `||`, parentheses and string
 * literals (so ternaries and logical-or expressions are never mistaken for a filter).
 */
function splitFilter(inner: string): { expr: string; filter?: string } {
  let depth = 0
  let inStr = false
  let strCh = ''
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (inStr) {
      if (c === strCh && inner[i - 1] !== '\\') inStr = false
      continue
    }
    if (c === '"' || c === "'") {
      inStr = true
      strCh = c
    } else if (c === '(') {
      depth++
    } else if (c === ')') {
      depth--
    } else if (c === '|' && depth === 0) {
      if (inner[i + 1] === '|') {
        i++
        continue
      }
      if (inner[i - 1] === '|') continue
      return { expr: inner.slice(0, i).trim(), filter: inner.slice(i + 1).trim() }
    }
  }
  return { expr: inner.trim() }
}

/** Apply a display filter to a value: `pct`, `fixed(k)`, `commas`, `$`/`usd`. */
function applyFilter(value: Value, filter: string): string {
  const n = typeof value === 'number' ? value : Number(value)
  const m = filter.match(/^([A-Za-z$]+)(?:\(\s*(-?\d+)\s*\))?$/)
  const name = m ? m[1] : filter
  const arg = m && m[2] !== undefined ? parseInt(m[2], 10) : undefined
  if (!Number.isFinite(n)) return formatValue(value)
  switch (name) {
    case 'pct':
      return formatValue(n * 100) + '%'
    case 'fixed':
      return n.toFixed(Math.min(20, Math.max(0, arg ?? 0)))
    case 'commas':
      return n.toLocaleString('en-US')
    case '$':
    case 'usd':
      return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    default:
      return formatValue(value)
  }
}

/**
 * Replace `{{ expression }}` (optionally `{{ expression | filter }}`) placeholders with
 * evaluated, formatted values. Filters: `pct`, `fixed(k)`, `commas`, `$`. Errors are
 * rendered inline (helpful while authoring) rather than thrown.
 */
export function interpolate(template: string, scope: Record<string, Value>): string {
  return template.replace(INTERP, (_match, raw: string) => {
    const { expr, filter } = splitFilter(raw)
    if (!expr) return ''
    try {
      const value = evaluate(expr, scope)
      return filter ? applyFilter(value, filter) : formatValue(value)
    } catch (err) {
      return `⚠️${err instanceof ExpressionError ? err.message : 'error'}`
    }
  })
}
