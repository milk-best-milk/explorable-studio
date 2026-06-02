import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EXAMPLES } from '../../examples'
import { deleteProject, listProjects, type StoredProject } from '../storage'
import { TAGLINE } from '../config'

export function HomePage() {
  const [projects, setProjects] = useState<StoredProject[]>(() => listProjects())
  const remove = (id: string) => {
    deleteProject(id)
    setProjects(listProjects())
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <section className="py-14 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Make ideas you can <span className="text-indigo-500">play with</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
            {TAGLINE} Compose sliders, live charts and prose into interactive{' '}
            <em>explorable explanations</em> — right in your browser, then share them as a link or
            a self-contained page.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/edit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Start building →
            </Link>
            <a
              href="#examples"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Browse examples
            </a>
          </div>
        </section>

        {projects.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Your explainers
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <h3 className="truncate font-semibold text-slate-800 dark:text-slate-100">
                    {p.title || 'Untitled explainer'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {p.doc.blocks.length} blocks · updated {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={`/edit/${p.id}`}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="examples" className="scroll-mt-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Examples</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Learn by remixing. Open any example to see exactly how it is built.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.slug}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
              >
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{ex.doc.title}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">
                  {ex.doc.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to={`/view?ex=${ex.slug}`}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    View
                  </Link>
                  <Link
                    to={`/edit?ex=${ex.slug}`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Remix
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
