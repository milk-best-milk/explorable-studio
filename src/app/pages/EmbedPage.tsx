import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { decodeDocFromUrl, type ExplorableDoc } from '../../core'
import { getExample } from '../../examples'
import { Explainer } from '../../viewer/Explainer'
import { buildShareUrl } from '../share'

/** Chrome-less, iframe-friendly view of an explainer (no app header/nav). */
export function EmbedPage() {
  const [params] = useSearchParams()
  const d = params.get('d')
  const ex = params.get('ex')

  // Embeds follow the host's system colour scheme (there is no theme toggle here).
  useEffect(() => {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const result = useMemo<{ doc?: ExplorableDoc; error?: string }>(() => {
    try {
      if (d) return { doc: decodeDocFromUrl(d) }
      if (ex) {
        const example = getExample(ex)
        if (example) return { doc: example.doc }
      }
      return { error: 'Nothing to show.' }
    } catch {
      return { error: 'This embedded explainer link is invalid.' }
    }
  }, [d, ex])

  if (result.error || !result.doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6 text-sm text-slate-400 dark:bg-slate-950">
        {result.error}
      </div>
    )
  }

  const remixUrl = buildShareUrl(result.doc, 'edit')

  return (
    <div className="min-h-screen bg-white px-4 py-6 dark:bg-slate-950">
      <Explainer doc={result.doc} />
      <div className="mx-auto mt-6 max-w-2xl text-right">
        <a
          href={remixUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 transition-colors hover:text-indigo-500"
        >
          ⚡ Made with Explorable Studio
        </a>
      </div>
    </div>
  )
}
