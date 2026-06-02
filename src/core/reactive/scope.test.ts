import { describe, it, expect } from 'vitest'
import { computeScope } from './scope'
import { createVariable } from '../schema/factory'

describe('computeScope', () => {
  it('seeds input variables from defaults and overrides', () => {
    const vars = [
      createVariable({ name: 'a', type: 'number', value: 3 }),
      createVariable({ name: 'label', type: 'string', value: 'hi' }),
    ]
    expect(computeScope(vars).scope).toEqual({ a: 3, label: 'hi' })
    expect(computeScope(vars, { a: 10 }).scope.a).toBe(10)
  })

  it('evaluates derived variables in dependency order', () => {
    const vars = [
      createVariable({ name: 'a', type: 'number', value: 3 }),
      createVariable({ name: 'b', type: 'number', expr: 'a * 2' }),
      createVariable({ name: 'c', type: 'number', expr: 'b + 1' }),
    ]
    const { scope, errors } = computeScope(vars)
    expect(scope).toMatchObject({ a: 3, b: 6, c: 7 })
    expect(errors).toEqual({})
    expect(computeScope(vars, { a: 5 }).scope.c).toBe(11)
  })

  it('reports circular references without hanging', () => {
    const vars = [
      createVariable({ name: 'x', type: 'number', expr: 'y' }),
      createVariable({ name: 'y', type: 'number', expr: 'x' }),
    ]
    const { errors } = computeScope(vars)
    expect(Object.keys(errors).length).toBeGreaterThan(0)
  })

  it('records expression errors per-variable instead of throwing', () => {
    const vars = [createVariable({ name: 'z', type: 'number', expr: '1 +' })]
    const { errors, scope } = computeScope(vars)
    expect(errors.z).toBeTruthy()
    expect(scope.z).toBe(0)
  })
})
