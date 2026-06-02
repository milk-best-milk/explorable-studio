import { compile, type CompiledExpression, type Value } from '../expression'
import type { Variable } from '../schema/types'

export interface ScopeResult {
  /** All variable values (inputs + successfully derived). */
  scope: Record<string, Value>
  /** Per-variable error messages (syntax error, cycle, unknown ref…). */
  errors: Record<string, string>
}

function coerce(type: Variable['type'], value: Value | undefined, fallback: Value): Value {
  if (value === undefined) value = fallback
  if (type === 'number') return typeof value === 'number' ? value : Number(value)
  if (type === 'boolean') return typeof value === 'boolean' ? value : Boolean(value)
  return typeof value === 'string' ? value : String(value)
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/**
 * Compute the full reactive scope from a set of variables.
 *
 * Input variables (no `expr`) take their value from `overrides` (the live session
 * state) or their default. Derived variables (`expr`) are evaluated in dependency
 * order; cycles and errors are reported per-variable instead of throwing.
 */
export function computeScope(
  variables: Variable[],
  overrides: Record<string, Value> = {},
): ScopeResult {
  const scope: Record<string, Value> = {}
  const errors: Record<string, string> = {}
  const byName = new Map(variables.map((v) => [v.name, v]))

  // Seed input variables.
  for (const v of variables) {
    if (!v.expr) scope[v.name] = coerce(v.type, overrides[v.name], v.value)
  }

  // Compile derived expressions and record dependencies on other variables.
  const derived = variables.filter((v) => v.expr)
  const compiled = new Map<string, CompiledExpression>()
  const deps = new Map<string, string[]>()
  for (const v of derived) {
    try {
      const c = compile(v.expr as string)
      compiled.set(v.name, c)
      deps.set(
        v.name,
        c.references.filter((r) => byName.get(r)?.expr),
      )
    } catch (err) {
      errors[v.name] = message(err)
      deps.set(v.name, [])
    }
  }

  // Topological order via DFS, flagging cycles.
  const visited = new Set<string>()
  const inStack = new Set<string>()
  const order: string[] = []
  const visit = (name: string): void => {
    if (visited.has(name)) return
    if (inStack.has(name)) {
      errors[name] = 'Circular reference'
      return
    }
    inStack.add(name)
    for (const dep of deps.get(name) ?? []) visit(dep)
    inStack.delete(name)
    visited.add(name)
    order.push(name)
  }
  for (const v of derived) visit(v.name)

  // Evaluate derived variables in order.
  for (const name of order) {
    const variable = byName.get(name)
    if (!variable) continue
    if (errors[name]) {
      scope[name] = coerce(variable.type, undefined, variable.value)
      continue
    }
    const c = compiled.get(name)
    if (!c) continue
    try {
      scope[name] = coerce(variable.type, c.evaluate(scope), variable.value)
    } catch (err) {
      errors[name] = message(err)
      scope[name] = coerce(variable.type, undefined, variable.value)
    }
  }

  return { scope, errors }
}
