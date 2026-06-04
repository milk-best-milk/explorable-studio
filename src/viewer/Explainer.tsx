import { useMemo, useState, type CSSProperties } from 'react'
import { computeScope, type ExplorableDoc, type Value } from '../core'
import { BlockView } from '../blocks'

interface Props {
  doc: ExplorableDoc
  /** Show the document title & description header (default true). */
  showHeader?: boolean
  /** Distraction-free reading layout: wider column, larger type. */
  reader?: boolean
}

/**
 * The read-only runtime for an explorable explanation. It owns the live "override"
 * state produced by reader interactions, recomputes the reactive scope, and renders
 * every block. The exact same component powers the editor preview, shared links and
 * the exported standalone HTML — so authors get true WYSIWYG.
 */
export function Explainer({ doc, showHeader = true, reader = false }: Props) {
  const [overrides, setOverrides] = useState<Record<string, Value>>({})

  const { scope } = useMemo(
    () => computeScope(doc.variables, overrides),
    [doc.variables, overrides],
  )

  const onControlChange = (variable: string, value: Value) =>
    setOverrides((prev) => ({ ...prev, [variable]: value }))

  const accent = doc.theme?.accent

  return (
    <article
      style={accent ? ({ '--es-accent': accent } as unknown as CSSProperties) : undefined}
      className={`es-explainer mx-auto w-full text-slate-800 dark:text-slate-100 ${
        reader ? 'max-w-3xl text-lg' : 'max-w-2xl'
      }`}
    >
      {showHeader && (
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {doc.title}
          </h1>
          {doc.description && (
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{doc.description}</p>
          )}
        </header>
      )}

      <div className="space-y-4">
        {doc.blocks.map((block) => {
          const isControl = block.type === 'control'
          return (
            <div
              key={block.id}
              className={
                isControl
                  ? 'rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40'
                  : ''
              }
            >
              <BlockView block={block} scope={scope} onControlChange={onControlChange} />
            </div>
          )
        })}

        {doc.blocks.length === 0 && (
          <p className="py-10 text-center text-slate-400">This explainer is empty.</p>
        )}
      </div>
    </article>
  )
}
