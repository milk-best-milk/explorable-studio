import { interpolate, type Value } from '../core'
import { renderMarkdown } from './markdown'

interface Props {
  markdown: string
  scope: Record<string, Value>
}

/** Renders Markdown prose with `{{ expression }}` interpolation. */
export function TextView({ markdown, scope }: Props) {
  const html = renderMarkdown(interpolate(markdown, scope))
  return <div className="es-prose" dangerouslySetInnerHTML={{ __html: html }} />
}
