import type {
  Block,
  ControlBlock,
  ControlKind,
  ExplorableDoc,
  MathBlock,
  TextBlock,
  Variable,
  VarType,
  VizBlock,
} from './types'
import { DOC_VERSION } from './types'

/** Short, collision-resistant id (kept compact to minimise shared-URL size). */
export function uid(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-4)
  return prefix + rand + time
}

export function createVariable(partial: Partial<Variable> = {}): Variable {
  const type: VarType = partial.type ?? 'number'
  const defaultValue = type === 'number' ? 0 : type === 'boolean' ? false : ''
  return {
    id: partial.id ?? uid('v_'),
    name: partial.name ?? 'x',
    type,
    value: partial.value ?? defaultValue,
    ...(partial.expr ? { expr: partial.expr } : {}),
    ...(partial.description ? { description: partial.description } : {}),
  }
}

export function createTextBlock(partial: Partial<TextBlock> = {}): TextBlock {
  return {
    id: partial.id ?? uid('b_'),
    type: 'text',
    markdown: partial.markdown ?? 'Write **Markdown** here. Reference a variable with `{{ x }}`.',
  }
}

export function createControlBlock(partial: Partial<ControlBlock> = {}): ControlBlock {
  const control: ControlKind = partial.control ?? 'slider'
  return {
    id: partial.id ?? uid('b_'),
    type: 'control',
    control,
    variable: partial.variable ?? 'x',
    label: partial.label,
    min: partial.min ?? 0,
    max: partial.max ?? 100,
    step: partial.step ?? 1,
    options: partial.options,
  }
}

export function createVizBlock(partial: Partial<VizBlock> = {}): VizBlock {
  return {
    id: partial.id ?? uid('b_'),
    type: 'viz',
    mode: partial.mode ?? 'function',
    title: partial.title,
    height: partial.height ?? 240,
    xName: partial.xName ?? 'x',
    xMin: partial.xMin ?? '0',
    xMax: partial.xMax ?? '10',
    samples: partial.samples ?? 80,
    curves: partial.curves ?? [{ expr: 'x' }],
    xLabel: partial.xLabel,
    yLabel: partial.yLabel,
    bars: partial.bars,
    points: partial.points,
  }
}

export function createMathBlock(partial: Partial<MathBlock> = {}): MathBlock {
  return {
    id: partial.id ?? uid('b_'),
    type: 'math',
    tex: partial.tex ?? 'a^2 + b^2 = c^2',
    display: partial.display ?? true,
  }
}

export function createBlock(type: Block['type']): Block {
  switch (type) {
    case 'text':
      return createTextBlock()
    case 'control':
      return createControlBlock()
    case 'viz':
      return createVizBlock()
    case 'math':
      return createMathBlock()
  }
}

export function createDoc(partial: Partial<ExplorableDoc> = {}): ExplorableDoc {
  return {
    version: DOC_VERSION,
    title: partial.title ?? 'Untitled explainer',
    description: partial.description,
    variables: partial.variables ?? [],
    blocks: partial.blocks ?? [],
  }
}
