import { create } from 'zustand'
import {
  cloneDoc,
  createBlock,
  createDoc,
  createVariable,
  uid,
  type Block,
  type BlockType,
  type ExplorableDoc,
  type Variable,
} from '../core'
import { saveProject } from '../app/storage'

let saveTimer: ReturnType<typeof setTimeout> | undefined
function scheduleSave(id: string, doc: ExplorableDoc): void {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveProject(id, doc), 400)
}

export interface EditorState {
  doc: ExplorableDoc
  projectId: string
  selectedBlockId: string | null
  past: ExplorableDoc[]
  future: ExplorableDoc[]

  load: (doc: ExplorableDoc, projectId: string) => void
  newProject: () => string
  setTitle: (title: string) => void
  setDescription: (description: string) => void
  setAccent: (accent: string | undefined) => void

  undo: () => void
  redo: () => void

  addBlock: (type: BlockType) => void
  updateBlock: (block: Block) => void
  removeBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  reorderBlocks: (orderedIds: string[]) => void
  selectBlock: (id: string | null) => void

  addVariable: (partial?: Partial<Variable>) => void
  updateVariable: (variable: Variable) => void
  removeVariable: (id: string) => void
}

export const useEditor = create<EditorState>((set, get) => {
  const commit = (doc: ExplorableDoc) => {
    const previous = get().doc
    scheduleSave(get().projectId, doc)
    set({ doc, past: [...get().past, previous].slice(-100), future: [] })
  }

  return {
    doc: createDoc(),
    projectId: uid('p_'),
    selectedBlockId: null,
    past: [],
    future: [],

    load: (doc, projectId) =>
      set({ doc: cloneDoc(doc), projectId, selectedBlockId: null, past: [], future: [] }),

    newProject: () => {
      const doc = createDoc()
      const projectId = uid('p_')
      saveProject(projectId, doc)
      set({ doc, projectId, selectedBlockId: null, past: [], future: [] })
      return projectId
    },

    undo: () => {
      const { past, doc, future, projectId } = get()
      if (past.length === 0) return
      const previous = past[past.length - 1]
      scheduleSave(projectId, previous)
      set({ doc: previous, past: past.slice(0, -1), future: [doc, ...future] })
    },

    redo: () => {
      const { future, doc, past, projectId } = get()
      if (future.length === 0) return
      const next = future[0]
      scheduleSave(projectId, next)
      set({ doc: next, future: future.slice(1), past: [...past, doc] })
    },

    setTitle: (title) => commit({ ...get().doc, title }),
    setDescription: (description) => commit({ ...get().doc, description }),
    setAccent: (accent) => commit({ ...get().doc, theme: accent ? { accent } : undefined }),

    addBlock: (type) => {
      const block = createBlock(type)
      commit({ ...get().doc, blocks: [...get().doc.blocks, block] })
      set({ selectedBlockId: block.id })
    },

    updateBlock: (block) =>
      commit({
        ...get().doc,
        blocks: get().doc.blocks.map((b) => (b.id === block.id ? block : b)),
      }),

    removeBlock: (id) =>
      commit({ ...get().doc, blocks: get().doc.blocks.filter((b) => b.id !== id) }),

    duplicateBlock: (id) => {
      const blocks = get().doc.blocks
      const idx = blocks.findIndex((b) => b.id === id)
      if (idx < 0) return
      const copy = { ...cloneDoc({ ...get().doc, blocks: [blocks[idx]] }).blocks[0], id: uid('b_') }
      const next = [...blocks.slice(0, idx + 1), copy, ...blocks.slice(idx + 1)]
      commit({ ...get().doc, blocks: next })
      set({ selectedBlockId: copy.id })
    },

    reorderBlocks: (orderedIds) => {
      const map = new Map(get().doc.blocks.map((b) => [b.id, b]))
      const blocks = orderedIds
        .map((id) => map.get(id))
        .filter((b): b is Block => Boolean(b))
      commit({ ...get().doc, blocks })
    },

    selectBlock: (id) => set({ selectedBlockId: id }),

    addVariable: (partial) => {
      const variable = createVariable(partial)
      commit({ ...get().doc, variables: [...get().doc.variables, variable] })
    },

    updateVariable: (variable) =>
      commit({
        ...get().doc,
        variables: get().doc.variables.map((v) => (v.id === variable.id ? variable : v)),
      }),

    removeVariable: (id) =>
      commit({ ...get().doc, variables: get().doc.variables.filter((v) => v.id !== id) }),
  }
})
