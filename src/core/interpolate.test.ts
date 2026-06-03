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

  it('applies format filters', () => {
    expect(interpolate('{{ rate | pct }}', { rate: 0.05 })).toBe('5%')
    expect(interpolate('{{ x | fixed(2) }}', { x: 3.14159 })).toBe('3.14')
    expect(interpolate('{{ n | commas }}', { n: 1234567 })).toBe('1,234,567')
    expect(interpolate('{{ p | $ }}', { p: 1999.5 })).toBe('$1,999.50')
  })

  it('does not mistake || or a ternary colon for a filter', () => {
    expect(interpolate('{{ a || b }}', { a: 0, b: 7 })).toBe('7')
    expect(interpolate('{{ x > 0 ? 1 : 2 }}', { x: 5 })).toBe('1')
    expect(interpolate('{{ (a || b) | fixed(1) }}', { a: 0, b: 2 })).toBe('2.0')
  })

  it('falls back to default formatting for an unknown filter', () => {
    expect(interpolate('{{ x | wat }}', { x: 5 })).toBe('5')
  })

  it('formats ordinals', () => {
    expect(interpolate('{{ 1 | ordinal }}', {})).toBe('1st')
    expect(interpolate('{{ 2 | ordinal }}', {})).toBe('2nd')
    expect(interpolate('{{ 3 | ordinal }}', {})).toBe('3rd')
    expect(interpolate('{{ 4 | ordinal }}', {})).toBe('4th')
    expect(interpolate('{{ 11 | ordinal }}', {})).toBe('11th')
    expect(interpolate('{{ 21 | ordinal }}', {})).toBe('21st')
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
