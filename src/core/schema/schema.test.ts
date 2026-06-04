import { describe, it, expect } from 'vitest'
import {
  createDoc,
  createVariable,
  createTextBlock,
  createControlBlock,
  createVizBlock,
  createMathBlock,
} from './factory'
import { parseDoc, serializeDoc, cloneDoc, SchemaError } from './serialize'
import { encodeDocToUrl, decodeDocFromUrl } from './url'

function sampleDoc() {
  return createDoc({
    title: 'Compound interest',
    variables: [
      createVariable({ id: 'v1', name: 'principal', type: 'number', value: 1000 }),
      createVariable({ id: 'v2', name: 'rate', type: 'number', value: 0.05 }),
      createVariable({ id: 'v3', name: 'total', type: 'number', value: 0, expr: 'principal * (1 + rate)' }),
    ],
    blocks: [
      createTextBlock({ id: 'b1', markdown: 'You will have {{ total }}.' }),
      createControlBlock({ id: 'b2', control: 'slider', variable: 'rate', min: 0, max: 1, step: 0.01, label: 'Rate' }),
      createVizBlock({ id: 'b3' }),
      createMathBlock({ id: 'b4', tex: 'P(1+r)' }),
    ],
  })
}

describe('schema serialize/parse', () => {
  it('round-trips a document', () => {
    const doc = sampleDoc()
    const parsed = parseDoc(serializeDoc(doc))
    expect(parsed).toEqual(doc)
  })

  it('fills defaults for a sparse document', () => {
    const parsed = parseDoc({ version: 1, blocks: [{ type: 'text', markdown: 'hi' }] })
    expect(parsed.title).toBe('Untitled explainer')
    expect(parsed.variables).toEqual([])
    expect(parsed.blocks[0]).toMatchObject({ type: 'text', markdown: 'hi' })
  })

  it('preserves a valid accent theme and drops an invalid one', () => {
    expect(parseDoc({ version: 1, theme: { accent: '#22c55e' }, blocks: [] }).theme?.accent).toBe('#22c55e')
    expect(parseDoc({ version: 1, theme: { accent: 123 }, blocks: [] }).theme).toBeUndefined()
  })

  it('rejects invalid documents', () => {
    expect(() => parseDoc('not json')).toThrow(SchemaError)
    expect(() => parseDoc(42)).toThrow(SchemaError)
    expect(() => parseDoc({ variables: [{ name: 'x', type: 'frob', value: 1 }] })).toThrow(SchemaError)
    expect(() => parseDoc({ blocks: [{ type: 'unknownBlock' }] })).toThrow(SchemaError)
    expect(() => parseDoc({ version: 99 })).toThrow(/newer than supported/)
  })

  it('deep clones without aliasing', () => {
    const doc = sampleDoc()
    const copy = cloneDoc(doc)
    copy.blocks[0] = createTextBlock({ id: 'b1', markdown: 'changed' })
    expect((doc.blocks[0] as { markdown: string }).markdown).toBe('You will have {{ total }}.')
  })
})

describe('shareable URL codec', () => {
  it('round-trips through a compact URL string', () => {
    const doc = sampleDoc()
    const encoded = encodeDocToUrl(doc)
    expect(typeof encoded).toBe('string')
    expect(encoded).not.toContain(' ')
    expect(decodeDocFromUrl(encoded)).toEqual(doc)
  })

  it('throws on corrupted input', () => {
    expect(() => decodeDocFromUrl('@@@not-valid@@@')).toThrow(SchemaError)
  })
})
