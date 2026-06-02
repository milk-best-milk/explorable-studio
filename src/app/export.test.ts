import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildStandaloneHtml } from './exportHtml'
import { createDoc, createTextBlock } from '../core'

describe('buildStandaloneHtml', () => {
  beforeEach(() => {
    document.head.innerHTML =
      '<link rel="stylesheet" href="https://example.test/app.css"><style>.inline-marker{}</style>'
    const sc = document.createElement('script')
    sc.type = 'module'
    sc.src = 'https://example.test/app.js'
    document.body.appendChild(sc)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        text: async () => (String(url).endsWith('.css') ? 'body{color:red}' : 'console.log("app-bundle")'),
      })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  it('produces a self-contained page embedding the doc and inlined assets', async () => {
    const doc = createDoc({ title: 'My Explainer', blocks: [createTextBlock({ markdown: 'hi' })] })
    const html = await buildStandaloneHtml(doc)
    expect(html).toContain('<title>My Explainer</title>')
    expect(html).toContain('window.__EXPLORABLE_DOC__')
    expect(html).toContain('My Explainer') // doc embedded as JSON
    expect(html).toContain('body{color:red}') // inlined stylesheet
    expect(html).toContain('.inline-marker') // inlined <style>
    expect(html).toContain('console.log("app-bundle")') // inlined bundle
  })

  it('escapes </script> in embedded JSON to avoid breaking out', async () => {
    const doc = createDoc({ title: 'x', blocks: [createTextBlock({ markdown: '</script><b>x' })] })
    const html = await buildStandaloneHtml(doc)
    expect(html).not.toContain('</script><b>x')
    expect(html).toContain('\\u003c/script>')
  })
})
