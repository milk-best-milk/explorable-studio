/**
 * A small, sandboxed expression language for explorable explanations.
 *
 * Design goals:
 *  - Safe to evaluate untrusted, shared explainers: there is NO `eval`, NO access to
 *    JavaScript globals, NO property access (`.`) and NO indexing (`[]`). Identifiers
 *    resolve only from an explicit scope, a fixed set of constants, and a whitelist of
 *    pure math functions. This makes prototype-pollution and arbitrary code execution
 *    impossible by construction.
 *  - Expressive enough for explainers: arithmetic, comparisons, logical operators,
 *    a ternary, string concatenation, and common math functions.
 *
 * Public API: {@link compile}, {@link evaluate}, {@link references}, {@link ExpressionError}.
 */

export type Value = number | boolean | string

export class ExpressionError extends Error {
  pos?: number
  constructor(message: string, pos?: number) {
    super(message)
    this.name = 'ExpressionError'
    this.pos = pos
  }
}

/* ------------------------------------------------------------------ *
 * Tokenizer
 * ------------------------------------------------------------------ */

type TokenType = 'num' | 'str' | 'ident' | 'op' | 'lparen' | 'rparen' | 'comma' | 'eof'
interface Token {
  type: TokenType
  value: string
  pos: number
}

const MULTI_OPS = ['<=', '>=', '==', '!=', '&&', '||']
const SINGLE_OPS = new Set(['+', '-', '*', '/', '%', '^', '<', '>', '!', '?', ':'])

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const n = input.length

  while (i < n) {
    const c = input[i]

    // whitespace
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++
      continue
    }

    // number: 123, 1.5, .5, 1e3, 2.5E-4
    if ((c >= '0' && c <= '9') || (c === '.' && input[i + 1] >= '0' && input[i + 1] <= '9')) {
      const start = i
      while (i < n && input[i] >= '0' && input[i] <= '9') i++
      if (input[i] === '.') {
        i++
        while (i < n && input[i] >= '0' && input[i] <= '9') i++
      }
      if (input[i] === 'e' || input[i] === 'E') {
        i++
        if (input[i] === '+' || input[i] === '-') i++
        if (!(input[i] >= '0' && input[i] <= '9')) {
          throw new ExpressionError('Malformed number', start)
        }
        while (i < n && input[i] >= '0' && input[i] <= '9') i++
      }
      tokens.push({ type: 'num', value: input.slice(start, i), pos: start })
      continue
    }

    // string: '...' or "..."
    if (c === '"' || c === "'") {
      const quote = c
      const start = i
      i++
      let str = ''
      while (i < n && input[i] !== quote) {
        if (input[i] === '\\') {
          const next = input[i + 1]
          if (next === 'n') str += '\n'
          else if (next === 't') str += '\t'
          else if (next === '\\') str += '\\'
          else if (next === quote) str += quote
          else str += next
          i += 2
        } else {
          str += input[i]
          i++
        }
      }
      if (i >= n) throw new ExpressionError('Unterminated string', start)
      i++ // closing quote
      tokens.push({ type: 'str', value: str, pos: start })
      continue
    }

    // identifier: letter or _ followed by alphanumerics/_
    if (/[A-Za-z_]/.test(c)) {
      const start = i
      while (i < n && /[A-Za-z0-9_]/.test(input[i])) i++
      tokens.push({ type: 'ident', value: input.slice(start, i), pos: start })
      continue
    }

    if (c === '(') {
      tokens.push({ type: 'lparen', value: c, pos: i++ })
      continue
    }
    if (c === ')') {
      tokens.push({ type: 'rparen', value: c, pos: i++ })
      continue
    }
    if (c === ',') {
      tokens.push({ type: 'comma', value: c, pos: i++ })
      continue
    }

    const two = input.slice(i, i + 2)
    if (MULTI_OPS.includes(two)) {
      tokens.push({ type: 'op', value: two, pos: i })
      i += 2
      continue
    }
    if (SINGLE_OPS.has(c)) {
      tokens.push({ type: 'op', value: c, pos: i++ })
      continue
    }

    throw new ExpressionError(`Unexpected character '${c}'`, i)
  }

  tokens.push({ type: 'eof', value: '', pos: n })
  return tokens
}

/* ------------------------------------------------------------------ *
 * Parser (Pratt / precedence climbing) → AST
 * ------------------------------------------------------------------ */

export type Node =
  | { kind: 'num'; value: number }
  | { kind: 'str'; value: string }
  | { kind: 'ident'; name: string }
  | { kind: 'unary'; op: string; operand: Node }
  | { kind: 'binary'; op: string; left: Node; right: Node }
  | { kind: 'logical'; op: '&&' | '||'; left: Node; right: Node }
  | { kind: 'ternary'; cond: Node; then: Node; otherwise: Node }
  | { kind: 'call'; name: string; args: Node[] }

const BINDING_POWER: Record<string, number> = {
  '||': 6,
  '&&': 7,
  '==': 10,
  '!=': 10,
  '<': 11,
  '<=': 11,
  '>': 11,
  '>=': 11,
  '+': 13,
  '-': 13,
  '*': 15,
  '/': 15,
  '%': 15,
  '^': 18,
}
const TERNARY_BP = 4
const UNARY_BP = 20

class Parser {
  private pos = 0
  private tokens: Token[]
  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }
  private next(): Token {
    return this.tokens[this.pos++]
  }
  private expect(type: TokenType): Token {
    const t = this.peek()
    if (t.type !== type) {
      throw new ExpressionError(`Expected ${type} but found '${t.value || 'end of input'}'`, t.pos)
    }
    return this.next()
  }

  parse(): Node {
    const node = this.parseExpr(0)
    if (this.peek().type !== 'eof') {
      const t = this.peek()
      throw new ExpressionError(`Unexpected '${t.value}'`, t.pos)
    }
    return node
  }

  /** Precedence climbing. `minBp` is the minimum binding power to continue. */
  private parseExpr(minBp: number): Node {
    let left = this.parsePrefix()

    for (;;) {
      const t = this.peek()
      if (t.type !== 'op') break

      // ternary
      if (t.value === '?') {
        if (TERNARY_BP < minBp) break
        this.next()
        const thenBranch = this.parseExpr(0)
        const colon = this.peek()
        if (colon.type !== 'op' || colon.value !== ':') {
          throw new ExpressionError("Expected ':' in ternary", colon.pos)
        }
        this.next()
        const elseBranch = this.parseExpr(TERNARY_BP) // right associative
        left = { kind: 'ternary', cond: left, then: thenBranch, otherwise: elseBranch }
        continue
      }

      const bp = BINDING_POWER[t.value]
      if (bp === undefined || bp < minBp) break
      this.next()
      // '^' is right-associative; others left-associative
      const nextMin = t.value === '^' ? bp : bp + 1
      const right = this.parseExpr(nextMin)
      if (t.value === '&&' || t.value === '||') {
        left = { kind: 'logical', op: t.value, left, right }
      } else {
        left = { kind: 'binary', op: t.value, left, right }
      }
    }

    return left
  }

  private parsePrefix(): Node {
    const t = this.next()

    if (t.type === 'num') {
      return { kind: 'num', value: Number(t.value) }
    }
    if (t.type === 'str') {
      return { kind: 'str', value: t.value }
    }
    if (t.type === 'ident') {
      if (this.peek().type === 'lparen') {
        return this.parseCall(t.value)
      }
      return { kind: 'ident', name: t.value }
    }
    if (t.type === 'lparen') {
      const node = this.parseExpr(0)
      this.expect('rparen')
      return node
    }
    if (t.type === 'op' && (t.value === '-' || t.value === '+' || t.value === '!')) {
      const operand = this.parseExpr(UNARY_BP)
      return { kind: 'unary', op: t.value, operand }
    }
    throw new ExpressionError(`Unexpected '${t.value || 'end of input'}'`, t.pos)
  }

  private parseCall(name: string): Node {
    this.expect('lparen')
    const args: Node[] = []
    if (this.peek().type !== 'rparen') {
      args.push(this.parseExpr(0))
      while (this.peek().type === 'comma') {
        this.next()
        args.push(this.parseExpr(0))
      }
    }
    this.expect('rparen')
    return { kind: 'call', name, args }
  }
}

function parse(input: string): Node {
  return new Parser(tokenize(input)).parse()
}

/* ------------------------------------------------------------------ *
 * Constants + function whitelist
 * ------------------------------------------------------------------ */

const CONSTANTS: Record<string, Value> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
  true: true,
  false: false,
}

function intGcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a))
  b = Math.abs(Math.trunc(b))
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

type Fn = (...args: number[]) => number
const FUNCTIONS: Record<string, Fn> = {
  abs: Math.abs,
  sign: Math.sign,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  exp: Math.exp,
  log: Math.log,
  ln: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc,
  pow: Math.pow,
  hypot: (...a) => Math.hypot(...a),
  min: (...a) => Math.min(...a),
  max: (...a) => Math.max(...a),
  mod: (a, b) => ((a % b) + b) % b,
  clamp: (x, lo, hi) => Math.min(Math.max(x, lo), hi),
  lerp: (a, b, t) => a + (b - a) * t,
  deg: (x) => (x * 180) / Math.PI,
  rad: (x) => (x * Math.PI) / 180,
  gcd: (a, b) => intGcd(a, b),
  lcm: (a, b) => {
    const g = intGcd(a, b)
    return g === 0 ? 0 : Math.abs(Math.trunc(a) * Math.trunc(b)) / g
  },
}

/* ------------------------------------------------------------------ *
 * Evaluator
 * ------------------------------------------------------------------ */

function toNum(v: Value): number {
  if (typeof v === 'number') return v
  if (typeof v === 'boolean') return v ? 1 : 0
  const n = Number(v)
  return n
}

function truthy(v: Value): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0 && !Number.isNaN(v)
  return v.length > 0
}

function evalNode(node: Node, scope: Record<string, Value>): Value {
  switch (node.kind) {
    case 'num':
      return node.value
    case 'str':
      return node.value
    case 'ident': {
      if (Object.prototype.hasOwnProperty.call(scope, node.name)) return scope[node.name]
      if (Object.prototype.hasOwnProperty.call(CONSTANTS, node.name)) return CONSTANTS[node.name]
      throw new ExpressionError(`Unknown variable '${node.name}'`)
    }
    case 'unary': {
      const v = evalNode(node.operand, scope)
      if (node.op === '-') return -toNum(v)
      if (node.op === '+') return toNum(v)
      return !truthy(v)
    }
    case 'logical': {
      const l = evalNode(node.left, scope)
      if (node.op === '&&') return truthy(l) ? evalNode(node.right, scope) : l
      return truthy(l) ? l : evalNode(node.right, scope)
    }
    case 'ternary':
      return truthy(evalNode(node.cond, scope))
        ? evalNode(node.then, scope)
        : evalNode(node.otherwise, scope)
    case 'call': {
      const fn = FUNCTIONS[node.name]
      if (!fn) throw new ExpressionError(`Unknown function '${node.name}'`)
      const args = node.args.map((a) => toNum(evalNode(a, scope)))
      return fn(...args)
    }
    case 'binary': {
      const l = evalNode(node.left, scope)
      const r = evalNode(node.right, scope)
      switch (node.op) {
        case '+':
          if (typeof l === 'string' || typeof r === 'string') return String(l) + String(r)
          return toNum(l) + toNum(r)
        case '-':
          return toNum(l) - toNum(r)
        case '*':
          return toNum(l) * toNum(r)
        case '/':
          return toNum(l) / toNum(r)
        case '%':
          return toNum(l) % toNum(r)
        case '^':
          return Math.pow(toNum(l), toNum(r))
        case '==':
          return l === r
        case '!=':
          return l !== r
        case '<':
          return toNum(l) < toNum(r)
        case '<=':
          return toNum(l) <= toNum(r)
        case '>':
          return toNum(l) > toNum(r)
        case '>=':
          return toNum(l) >= toNum(r)
      }
      throw new ExpressionError(`Unknown operator '${node.op}'`)
    }
  }
}

function collectRefs(node: Node, out: Set<string>): void {
  switch (node.kind) {
    case 'ident':
      if (!Object.prototype.hasOwnProperty.call(CONSTANTS, node.name)) out.add(node.name)
      break
    case 'unary':
      collectRefs(node.operand, out)
      break
    case 'binary':
    case 'logical':
      collectRefs(node.left, out)
      collectRefs(node.right, out)
      break
    case 'ternary':
      collectRefs(node.cond, out)
      collectRefs(node.then, out)
      collectRefs(node.otherwise, out)
      break
    case 'call':
      node.args.forEach((a) => collectRefs(a, out))
      break
  }
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

export interface CompiledExpression {
  /** Evaluate against a scope of variable values. Throws {@link ExpressionError}. */
  evaluate(scope: Record<string, Value>): Value
  /** Names of free variables referenced (excludes constants and functions). */
  references: string[]
}

/** Parse an expression once and reuse it. Throws on syntax errors. */
export function compile(expr: string): CompiledExpression {
  const ast = parse(expr)
  const refs = new Set<string>()
  collectRefs(ast, refs)
  return {
    evaluate: (scope) => evalNode(ast, scope),
    references: [...refs],
  }
}

/** Convenience: parse + evaluate in one call. */
export function evaluate(expr: string, scope: Record<string, Value> = {}): Value {
  return evalNode(parse(expr), scope)
}

/** Names of the free variables an expression references. */
export function references(expr: string): string[] {
  const refs = new Set<string>()
  collectRefs(parse(expr), refs)
  return [...refs]
}

/** Built-in function names, for editor autocomplete / docs. */
export const BUILTIN_FUNCTIONS = Object.keys(FUNCTIONS)
/** Built-in constant names, for editor autocomplete / docs. */
export const BUILTIN_CONSTANTS = Object.keys(CONSTANTS)
