import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useTheme } from './theme'
import { APP_NAME, REPO_URL } from './config'

function NavItem({
  to,
  label,
  pathname,
  match,
}: {
  to: string
  label: string
  pathname: string
  match?: string
}) {
  const active = match ? pathname.startsWith(match) : pathname === to
  return (
    <Link
      to={to}
      className={clsx(
        'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
        active
          ? 'text-indigo-600 dark:text-indigo-300'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
      )}
    >
      {label}
    </Link>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen flex-col bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="text-indigo-500" aria-hidden>
              ✦
            </span>
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            <NavItem to="/edit" label="Editor" match="/edit" pathname={pathname} />
            <NavItem to="/" label="Gallery" pathname={pathname} />
            <NavItem to="/docs" label="Docs" pathname={pathname} />
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2.5 py-1 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
