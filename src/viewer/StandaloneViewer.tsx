import { useEffect } from 'react'
import type { ExplorableDoc } from '../core'
import { Explainer } from './Explainer'

interface Props {
  doc: ExplorableDoc
  remixUrl?: string
}

/**
 * Full-page read-only view used by exported standalone HTML files. Includes the
 * "Made with · Remix" growth-loop footer.
 */
export function StandaloneViewer({ doc, remixUrl }: Props) {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-white px-4 py-10 dark:bg-slate-950">
      <Explainer doc={doc} />
      {remixUrl && (
        <footer className="mx-auto mt-12 max-w-2xl border-t border-slate-200 pt-4 text-center text-sm text-slate-400 dark:border-slate-800">
          <a href={remixUrl} className="transition-colors hover:text-indigo-500">
            ✨ Made with Explorable Studio — remix this →
          </a>
        </footer>
      )}
    </div>
  )
}
