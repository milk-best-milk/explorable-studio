import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveProject,
  getProject,
  listProjects,
  renameProject,
  duplicateProject,
  deleteProject,
} from './storage'
import { createDoc, createTextBlock } from '../core'

beforeEach(() => localStorage.clear())

describe('project storage', () => {
  it('renames a project (both index and document title)', () => {
    saveProject('p1', createDoc({ title: 'Old', blocks: [createTextBlock()] }))
    renameProject('p1', 'New name')
    const p = getProject('p1')
    expect(p?.title).toBe('New name')
    expect(p?.doc.title).toBe('New name')
  })

  it('duplicates a project under a new id with a (copy) suffix', () => {
    saveProject('p1', createDoc({ title: 'Thing', blocks: [createTextBlock(), createTextBlock()] }))
    const newId = duplicateProject('p1')
    expect(newId).toBeTruthy()
    expect(newId).not.toBe('p1')
    const copy = getProject(newId as string)
    expect(copy?.title).toBe('Thing (copy)')
    expect(copy?.doc.blocks).toHaveLength(2)
    expect(getProject('p1')?.title).toBe('Thing') // original untouched
    expect(listProjects()).toHaveLength(2)
  })

  it('deletes a project', () => {
    saveProject('p1', createDoc())
    deleteProject('p1')
    expect(getProject('p1')).toBeUndefined()
  })

  it('rename and duplicate are safe no-ops for a missing id', () => {
    expect(duplicateProject('nope')).toBeUndefined()
    renameProject('nope', 'x')
    expect(listProjects()).toHaveLength(0)
  })
})
