import { describe, it, expect } from 'vitest'
import { interpolate, formatValue } from './interpolate'

describe('interpolate', () => {
  it('substitutes evaluated expressions', () => {
    expect(interpolate('Total is {{ a + b }}.', { a: 1, b: 2 })).toBe('Total is 3.')
    expect(interpolate('{{ rate * 100 }}% per year', { rate: 0.05 })).toBe('5% per year')
    expect(interpolate('pi ≈ {{ pi }}', {})).toBe('pi ≈ 3.1416')
  })

  it('renders errors inline rather than throwing', () => {
    expect(interpolate('{{ bad( }}', {})).toContain('⚠️')
    expect(interpolate('no placeholders', {})).toBe('no placeholders')
    expect(interpolate('{{}}', {})).toBe('')
  })
})

describe('formatValue', () => {
  it('formats numbers cleanly', () => {
    expect(formatValue(42)).toBe('42')
    expect(formatValue(1 / 3)).toBe('0.3333')
    expect(formatValue(5.0)).toBe('5')
    expect(formatValue(Infinity)).toBe('∞')
  })

  it('formats booleans and strings', () => {
    expect(formatValue(true)).toBe('true')
    expect(formatValue('hello')).toBe('hello')
  })
})
