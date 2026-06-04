import type { Block, Value } from '../core'
import { TextView } from './TextView'
import { MathView } from './MathView'
import { ControlView } from './ControlView'
import { VizView } from './VizView'
import { CalloutView } from './CalloutView'

interface Props {
  block: Block
  scope: Record<string, Value>
  onControlChange?: (variable: string, value: Value) => void
}

/** Read-only renderer for a single block. Shared by preview, shared links & exports. */
export function BlockView({ block, scope, onControlChange }: Props) {
  switch (block.type) {
    case 'text':
      return <TextView markdown={block.markdown} scope={scope} />
    case 'math':
      return <MathView tex={block.tex} display={block.display} scope={scope} />
    case 'viz':
      return <VizView block={block} scope={scope} />
    case 'callout':
      return <CalloutView block={block} scope={scope} />
    case 'control':
      return (
        <ControlView
          block={block}
          value={scope[block.variable]}
          onChange={(v) => onControlChange?.(block.variable, v)}
        />
      )
  }
}
