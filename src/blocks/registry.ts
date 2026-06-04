import type { BlockType } from '../core'

export interface BlockMeta {
  type: BlockType
  label: string
  description: string
  icon: string
}

/** Metadata used by the editor's "add block" menu. */
export const BLOCK_LIST: BlockMeta[] = [
  { type: 'text', label: 'Text', description: 'Markdown prose with live {{ values }}', icon: '¶' },
  { type: 'control', label: 'Control', description: 'Slider, number, toggle or select', icon: '🎚️' },
  { type: 'viz', label: 'Chart', description: 'Plot a function or compare bars', icon: '📈' },
  { type: 'math', label: 'Math', description: 'A KaTeX formula', icon: '∑' },
  { type: 'callout', label: 'Callout', description: 'Info / tip / warning box', icon: '💡' },
]

export const BLOCK_META: Record<BlockType, BlockMeta> = Object.fromEntries(
  BLOCK_LIST.map((m) => [m.type, m]),
) as Record<BlockType, BlockMeta>
