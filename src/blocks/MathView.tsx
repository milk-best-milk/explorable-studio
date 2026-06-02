import katex from 'katex'
import 'katex/dist/katex.min.css'
import { interpolate, type Value } from '../core'

interface Props {
  tex: string
  display?: boolean
  scope: Record<string, Value>
}

/** Renders a KaTeX formula, supporting `{{ expression }}` interpolation. */
export function MathView({ tex, display = true, scope }: Props) {
  const source = interpolate(tex, scope)
  let html: string
  try {
    html = katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      errorColor: '#ef4444',
    })
  } catch (err) {
    html = `<span style="color:#ef4444">${(err as Error).message}</span>`
  }
  return (
    <div
      className={display ? 'my-1 text-center' : 'inline'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
