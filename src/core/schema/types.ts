/** The document model for an explorable explanation. Fully serializable & portable. */

export type VarType = 'number' | 'boolean' | 'string'
export type Value = number | boolean | string

/**
 * A reactive variable. If `expr` is set it is *derived* (computed from other
 * variables); otherwise it is a free *input* whose value can be driven by controls.
 */
export interface Variable {
  id: string
  name: string // identifier used in expressions, e.g. "rate"
  type: VarType
  value: Value // default value for inputs (ignored when `expr` is set)
  expr?: string // when set, the variable is derived from other variables
  description?: string
}

export interface BaseBlock {
  id: string
  type: string
}

/** Prose with Markdown and `{{ expression }}` interpolation. */
export interface TextBlock extends BaseBlock {
  type: 'text'
  markdown: string
}

export type ControlKind = 'slider' | 'number' | 'toggle' | 'select'

/** An input widget bound to a variable. */
export interface ControlBlock extends BaseBlock {
  type: 'control'
  control: ControlKind
  variable: string // name of the variable it drives
  label?: string
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: Value }[]
}

export interface Curve {
  label?: string
  color?: string
  expr: string // y = f(x, ...vars)
}

export interface Bar {
  label: string
  expr: string
  color?: string
}

export type VizMode = 'function' | 'bars'

/** A live chart driven by expressions. */
export interface VizBlock extends BaseBlock {
  type: 'viz'
  mode: VizMode
  title?: string
  height?: number
  // function mode: sweep `xName` from xMin..xMax and plot each curve
  xName?: string
  xMin?: string // expression evaluated without x in scope
  xMax?: string
  samples?: number
  curves?: Curve[]
  xLabel?: string
  yLabel?: string
  // bars mode: one bar per entry, height = expr
  bars?: Bar[]
}

/** A KaTeX formula; may contain `{{ expression }}` interpolation. */
export interface MathBlock extends BaseBlock {
  type: 'math'
  tex: string
  display?: boolean
}

export type Block = TextBlock | ControlBlock | VizBlock | MathBlock
export type BlockType = Block['type']

export interface ExplorableDoc {
  version: 1
  title: string
  description?: string
  variables: Variable[]
  blocks: Block[]
}

export const DOC_VERSION = 1 as const
