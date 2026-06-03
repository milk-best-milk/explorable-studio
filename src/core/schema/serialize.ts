import type { Block, ControlKind, ExplorableDoc, Value, Variable, VarType } from './types'
import { DOC_VERSION } from './types'

export class SchemaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SchemaError'
  }
}

const VAR_TYPES: VarType[] = ['number', 'boolean', 'string']
const BLOCK_TYPES = ['text', 'control', 'viz', 'math']
const CONTROL_KINDS = ['slider', 'number', 'toggle', 'select', 'radio']
const VIZ_MODES = ['function', 'bars', 'scatter']

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isValue(v: unknown): v is Value {
  return typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string'
}

function validateVariable(raw: unknown, i: number): Variable {
  if (!isObj(raw)) throw new SchemaError(`variables[${i}] must be an object`)
  if (typeof raw.name !== 'string' || !raw.name) {
    throw new SchemaError(`variables[${i}].name must be a non-empty string`)
  }
  if (typeof raw.type !== 'string' || !VAR_TYPES.includes(raw.type as VarType)) {
    throw new SchemaError(`variables[${i}].type must be one of ${VAR_TYPES.join(', ')}`)
  }
  if (!isValue(raw.value)) {
    throw new SchemaError(`variables[${i}].value must be a number, boolean or string`)
  }
  if (raw.expr !== undefined && typeof raw.expr !== 'string') {
    throw new SchemaError(`variables[${i}].expr must be a string`)
  }
  const v: Variable = {
    id: typeof raw.id === 'string' ? raw.id : `v_${i}`,
    name: raw.name,
    type: raw.type as VarType,
    value: raw.value,
  }
  if (typeof raw.expr === 'string' && raw.expr.trim()) v.expr = raw.expr
  if (typeof raw.description === 'string') v.description = raw.description
  return v
}

function validateBlock(raw: unknown, i: number): Block {
  if (!isObj(raw)) throw new SchemaError(`blocks[${i}] must be an object`)
  if (typeof raw.type !== 'string' || !BLOCK_TYPES.includes(raw.type)) {
    throw new SchemaError(`blocks[${i}].type must be one of ${BLOCK_TYPES.join(', ')}`)
  }
  const id = typeof raw.id === 'string' ? raw.id : `b_${i}`

  switch (raw.type) {
    case 'text':
      return { id, type: 'text', markdown: typeof raw.markdown === 'string' ? raw.markdown : '' }
    case 'control': {
      if (typeof raw.control !== 'string' || !CONTROL_KINDS.includes(raw.control)) {
        throw new SchemaError(`blocks[${i}].control is invalid`)
      }
      if (typeof raw.variable !== 'string' || !raw.variable) {
        throw new SchemaError(`blocks[${i}].variable must reference a variable name`)
      }
      const c: Extract<Block, { type: 'control' }> = {
        id,
        type: 'control',
        control: raw.control as ControlKind,
        variable: raw.variable,
      }
      if (typeof raw.label === 'string') c.label = raw.label
      if (typeof raw.min === 'number') c.min = raw.min
      if (typeof raw.max === 'number') c.max = raw.max
      if (typeof raw.step === 'number') c.step = raw.step
      if (Array.isArray(raw.options)) {
        c.options = raw.options
          .filter((o): o is { label?: unknown; value: Value } => isObj(o) && isValue(o.value))
          .map((o) => ({ label: String(o.label ?? o.value), value: o.value }))
      }
      return c
    }
    case 'viz': {
      const mode = VIZ_MODES.includes(raw.mode as string) ? (raw.mode as 'function' | 'bars') : 'function'
      const b: Extract<Block, { type: 'viz' }> = { id, type: 'viz', mode }
      if (typeof raw.title === 'string') b.title = raw.title
      if (typeof raw.height === 'number') b.height = raw.height
      if (typeof raw.xName === 'string') b.xName = raw.xName
      if (typeof raw.xMin === 'string') b.xMin = raw.xMin
      if (typeof raw.xMax === 'string') b.xMax = raw.xMax
      if (typeof raw.samples === 'number') b.samples = raw.samples
      if (typeof raw.xLabel === 'string') b.xLabel = raw.xLabel
      if (typeof raw.yLabel === 'string') b.yLabel = raw.yLabel
      if (Array.isArray(raw.curves)) {
        b.curves = raw.curves
          .filter((c): c is Record<string, unknown> => isObj(c) && typeof c.expr === 'string')
          .map((c) => ({
            expr: c.expr as string,
            ...(typeof c.label === 'string' ? { label: c.label } : {}),
            ...(typeof c.color === 'string' ? { color: c.color } : {}),
          }))
      }
      if (Array.isArray(raw.bars)) {
        b.bars = raw.bars
          .filter((c): c is Record<string, unknown> => isObj(c) && typeof c.expr === 'string')
          .map((c) => ({
            label: typeof c.label === 'string' ? c.label : '',
            expr: c.expr as string,
            ...(typeof c.color === 'string' ? { color: c.color } : {}),
          }))
      }
      if (Array.isArray(raw.points)) {
        b.points = raw.points
          .filter(
            (p): p is Record<string, unknown> =>
              isObj(p) && typeof p.x === 'string' && typeof p.y === 'string',
          )
          .map((p) => ({
            x: p.x as string,
            y: p.y as string,
            ...(typeof p.label === 'string' ? { label: p.label } : {}),
            ...(typeof p.color === 'string' ? { color: p.color } : {}),
          }))
      }
      return b
    }
    case 'math': {
      const b: Extract<Block, { type: 'math' }> = {
        id,
        type: 'math',
        tex: typeof raw.tex === 'string' ? raw.tex : '',
      }
      if (typeof raw.display === 'boolean') b.display = raw.display
      return b
    }
  }
  throw new SchemaError(`blocks[${i}] could not be parsed`)
}

/** Validate and normalise an arbitrary value into an ExplorableDoc. Throws SchemaError. */
export function parseDoc(input: unknown): ExplorableDoc {
  const raw: unknown = typeof input === 'string' ? safeJsonParse(input) : input
  if (!isObj(raw)) throw new SchemaError('Document must be a JSON object')

  // version migration hook (only v1 exists today)
  const version = typeof raw.version === 'number' ? raw.version : DOC_VERSION
  if (version > DOC_VERSION) {
    throw new SchemaError(`Document version ${version} is newer than supported (${DOC_VERSION})`)
  }

  const variables = Array.isArray(raw.variables)
    ? raw.variables.map((v, i) => validateVariable(v, i))
    : []
  const blocks = Array.isArray(raw.blocks) ? raw.blocks.map((b, i) => validateBlock(b, i)) : []

  return {
    version: DOC_VERSION,
    title: typeof raw.title === 'string' ? raw.title : 'Untitled explainer',
    ...(typeof raw.description === 'string' ? { description: raw.description } : {}),
    variables,
    blocks,
  }
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    throw new SchemaError('Invalid JSON')
  }
}

/** Serialise a document to a stable JSON string. */
export function serializeDoc(doc: ExplorableDoc, pretty = false): string {
  return JSON.stringify(doc, null, pretty ? 2 : undefined)
}

/** Deep clone a document (structuredClone is available in modern browsers & Node ≥17). */
export function cloneDoc(doc: ExplorableDoc): ExplorableDoc {
  return structuredClone(doc)
}
