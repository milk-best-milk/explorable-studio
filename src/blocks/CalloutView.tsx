import { interpolate, type CalloutBlock, type Value } from '../core'
import { renderMarkdown } from './markdown'

const STYLES: Record<CalloutBlock['variant'], { box: string; icon: string }> = {
  info: {
    box: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40',
    icon: 'ℹ️',
  },
  tip: {
    box: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
    icon: '💡',
  },
  warning: {
    box: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
    icon: '⚠️',
  },
}

interface Props {
  block: CalloutBlock
  scope: Record<string, Value>
}

/** A styled info / tip / warning box with Markdown + interpolation. */
export function CalloutView({ block, scope }: Props) {
  const style = STYLES[block.variant] ?? STYLES.info
  const html = renderMarkdown(interpolate(block.markdown, scope))
  return (
    <div role="note" className={`flex gap-3 rounded-lg border px-4 py-3 ${style.box}`}>
      <span aria-hidden className="text-lg leading-snug">
        {style.icon}
      </span>
      <div className="es-prose min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
