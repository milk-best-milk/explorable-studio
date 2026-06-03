import { describe, it, expect } from 'vitest'
import { compile, evaluate, references, ExpressionError } from './index'

describe('expression evaluator', () => {
  it('respects arithmetic precedence', () => {
    expect(evaluate('2 + 3 * 4')).toBe(14)
    expect(evaluate('(2 + 3) * 4')).toBe(20)
    expect(evaluate('10 - 2 - 3')).toBe(5) // left associative
  })

  it('treats ^ as right-associative power', () => {
    expect(evaluate('2 ^ 3 ^ 2')).toBe(512) // 2^(3^2)
    expect(evaluate('2 ^ 10')).toBe(1024)
  })

  it('handles unary operators', () => {
    expect(evaluate('-5')).toBe(-5)
    expect(evaluate('--5')).toBe(5)
    expect(evaluate('!0')).toBe(true)
    expect(evaluate('!5')).toBe(false)
  })

  it('resolves variables from scope', () => {
    expect(evaluate('rate / 100', { rate: 5 })).toBe(0.05)
    expect(evaluate('a + b', { a: 2, b: 40 })).toBe(42)
  })

  it('supports comparisons and ternary', () => {
    expect(evaluate("x > 5 ? 'big' : 'small'", { x: 10 })).toBe('big')
    expect(evaluate("x > 5 ? 'big' : 'small'", { x: 1 })).toBe('small')
    expect(evaluate('3 == 3')).toBe(true)
    expect(evaluate('3 != 4')).toBe(true)
    expect(evaluate('2 <= 2')).toBe(true)
  })

  it('short-circuits logical operators (no eval of dead branch)', () => {
    expect(evaluate('true || missingVar')).toBe(true)
    expect(evaluate('false && missingVar')).toBe(false)
    expect(evaluate('a && b', { a: true, b: 7 })).toBe(7)
  })

  it('concatenates strings with +', () => {
    expect(evaluate("'a' + 1")).toBe('a1')
    expect(evaluate("'value: ' + x", { x: 42 })).toBe('value: 42')
  })

  it('evaluates whitelisted functions and constants', () => {
    expect(evaluate('max(1, 2, 3)')).toBe(3)
    expect(evaluate('min(4, 2, 8)')).toBe(2)
    expect(evaluate('clamp(5, 0, 3)')).toBe(3)
    expect(evaluate('mod(-1, 3)')).toBe(2)
    expect(evaluate('round(3.6)')).toBe(4)
    expect(evaluate('pi')).toBeCloseTo(Math.PI)
    expect(evaluate('sqrt(16)')).toBe(4)
  })

  it('converts between degrees and radians', () => {
    expect(evaluate('deg(pi)')).toBeCloseTo(180)
    expect(evaluate('rad(180)')).toBeCloseTo(Math.PI)
    expect(evaluate('sin(rad(90))')).toBeCloseTo(1)
  })

  it('extracts variable references, excluding constants and functions', () => {
    expect(references('a + b * 2 + sin(c)')).toEqual(['a', 'b', 'c'])
    expect(references('pi * r ^ 2')).toEqual(['r'])
    expect(references('42')).toEqual([])
  })

  it('caches compiled expressions for reuse', () => {
    const fn = compile('principal * (1 + rate) ^ years')
    expect(fn.references.sort()).toEqual(['principal', 'rate', 'years'])
    expect(fn.evaluate({ principal: 100, rate: 0.1, years: 2 })).toBeCloseTo(121)
  })

  it('throws ExpressionError on syntax and reference errors', () => {
    expect(() => evaluate('1 +')).toThrow(ExpressionError)
    expect(() => evaluate('(1 + 2')).toThrow(ExpressionError)
    expect(() => evaluate('foo')).toThrow(/Unknown variable/)
    expect(() => evaluate('bar(1)')).toThrow(/Unknown function/)
  })

  it('does not allow property access or globals (sandbox)', () => {
    expect(() => evaluate('x.y', { x: 1 })).toThrow(ExpressionError)
    expect(() => evaluate('constructor')).toThrow(/Unknown variable/)
    expect(() => evaluate('window')).toThrow(/Unknown variable/)
  })
})
