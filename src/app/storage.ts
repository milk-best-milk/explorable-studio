import type { ExplorableDoc } from '../core'

const KEY = 'explorable-studio.projects.v1'
const LAST_KEY = 'explorable-studio.lastProject'

export interface StoredProject {
  id: string
  title: string
  doc: ExplorableDoc
  updatedAt: number
}

function readStore(): Record<string, StoredProject> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, StoredProject>) : {}
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, StoredProject>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // storage full or unavailable — fail silently; the in-memory doc is unaffected.
  }
}

export function listProjects(): StoredProject[] {
  return Object.values(readStore()).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getProject(id: string): StoredProject | undefined {
  return readStore()[id]
}

export function saveProject(id: string, doc: ExplorableDoc): void {
  const store = readStore()
  store[id] = { id, title: doc.title, doc, updatedAt: Date.now() }
  writeStore(store)
  setLastProjectId(id)
}

export function deleteProject(id: string): void {
  const store = readStore()
  delete store[id]
  writeStore(store)
}

export function setLastProjectId(id: string): void {
  try {
    localStorage.setItem(LAST_KEY, id)
  } catch {
    /* ignore */
  }
}

export function getLastProjectId(): string | undefined {
  try {
    return localStorage.getItem(LAST_KEY) ?? undefined
  } catch {
    return undefined
  }
}
