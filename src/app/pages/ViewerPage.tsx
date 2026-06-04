import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { decodeDocFromUrl, type ExplorableDoc } from '../../core'
import { getExample } from '../../examples'
import { Explainer } from '../../viewer/Explainer'

export function ViewerPage() {
  const [params, setParams] = useSearchParams()
  const d = params.get('d')
  const ex = params.get('ex')
  const reader = params.get('reader') === '1'

  const toggleReader = () => {
    const next = new URLSearchParams(params)
    if (reader) next.delete('reader')
    else next.set('reader', '1')
    setParams(next, { replace: true })
  }

  const result = useMemo<{ doc?: ExplorableDoc; error?: string }>(() => {
    try {
      if (d) return { doc: decodeDocFromUrl(d) }
      if (ex) {
        const example = getExample(ex)
        if (example) return { doc: example.doc }
      }
      return { error: 'Nothing to show — this link has no explainer.' }
    } catch {
      return { error: 'This shared link is invalid or corrupted.' }
    }
  }, [d, ex])

  const remixTo = d ? `/edit?d=${encodeURIComponent(d)}` : ex ? `/edit?ex=${ex}` : '/edit'

  if (result.error || !result.doc) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div>
          <p className="text-slate-500">{result.error}</p>
          <Link to="/" className="mt-3 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
            ← Back to the gallery
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className={`mx-auto px-4 ${reader ? 'max-w-3xl py-12' : 'max-w-2xl py-8'}`}>
        <div className="mb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleReader}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {reader ? '✕ Exit reader' : '📖 Reader mode'}
          </button>
          {!reader && (
            <Link
              to={remixTo}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ✨ Remix in editor
            </Link>
          )}
        </div>
        <Explainer doc={result.doc} reader={reader} />
        {!reader && (
          <footer className="mt-12 border-t border-slate-200 pt-4 text-center text-sm text-slate-400 dark:border-slate-800">
            <Link to="/" className="hover:text-indigo-500">
              Made with Explorable Studio
            </Link>
          </footer>
        )}
      </div>
    </div>
  )
}
