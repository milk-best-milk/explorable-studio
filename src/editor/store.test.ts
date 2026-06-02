import { describe, it, expect, beforeEach } from 'vitest'
import { useEditor } from './store'
import { getProject } from '../app/storage'
import { createDoc, type TextBlock } from '../core'

const s = () => useEditor.getState()

beforeEach(() => {
  localStorage.clear()
  s().load(createDoc({ title: 'T' }), 'p_test')
})

describe('editor store', () => {
  it('adds, updates, reorders, duplicates and removes blocks', () => {
    s().addBlock('text')
    s().addBlock('control')
    expect(s().doc.blocks).toHaveLength(2)

    const [b1, b2] = s().doc.blocks
    s().updateBlock({ ...(b1 as TextBlock), markdown: 'hello' })
    expect((s().doc.blocks[0] as TextBlock).markdown).toBe('hello')

    s().reorderBlocks([b2.id, b1.id])
    expect(s().doc.blocks[0].id).toBe(b2.id)

    s().duplicateBlock(b1.id)
    expect(s().doc.blocks).toHaveLength(3)

    s().removeBlock(b1.id)
    expect(s().doc.blocks.find((b) => b.id === b1.id)).toBeUndefined()
  })

  it('supports undo and redo', () => {
    s().addBlock('text')
    s().addBlock('control')
    expect(s().doc.blocks).toHaveLength(2)

    s().undo()
    expect(s().doc.blocks).toHaveLength(1)
    s().undo()
    expect(s().doc.blocks).toHaveLength(0)
    s().redo()
    expect(s().doc.blocks).toHaveLength(1)

    // a fresh edit clears the redo stack
    s().addBlock('math')
    expect(s().doc.blocks).toHaveLength(2)
    s().redo()
    expect(s().doc.blocks).toHaveLength(2)
  })

  it('manages variables', () => {
    s().addVariable({ name: 'rate', type: 'number', value: 5 })
    const v = s().doc.variables[0]
    expect(v.name).toBe('rate')
    s().updateVariable({ ...v, value: 9 })
    expect(s().doc.variables[0].value).toBe(9)
    s().removeVariable(v.id)
    expect(s().doc.variables).toHaveLength(0)
  })

  it('autosaves to local storage (debounced)', async () => {
    s().setTitle('Saved title')
    await new Promise((r) => setTimeout(r, 500))
    expect(getProject('p_test')?.doc.title).toBe('Saved title')
  })
})
