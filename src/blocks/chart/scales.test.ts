import { describe, it, expect } from 'vitest'
import { linearScale, niceTicks, formatTick } from './scales'

describe('chart scales', () => {
  it('maps a domain onto a range linearly', () => {
    const s = linearScale([0, 10], [0, 100])
    expect(s(0)).toBe(0)
    expect(s(5)).toBe(50)
    expect(s(10)).toBe(100)
  })

  it('handles a zero-width domain without dividing by zero', () => {
    const s = linearScale([5, 5], [0, 100])
    expect(Number.isFinite(s(5))).toBe(true)
  })

  it('produces nice round ticks spanning the data', () => {
    const ticks = niceTicks(0, 100, 5)
    expect(ticks[0]).toBe(0)
    expect(ticks[ticks.length - 1]).toBe(100)
    expect(ticks).toContain(40)
  })

  it('formats tick labels compactly', () => {
    expect(formatTick(0)).toBe('0')
    expect(formatTick(1000)).toBe('1000')
    expect(formatTick(0.00001)).toContain('e')
  })
})
