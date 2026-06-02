import { serializeDoc, type ExplorableDoc } from '../core'
import { buildShareUrl } from './share'

/**
 * Produce a self-contained HTML page for an explainer.
 *
 * It inlines the app's own bundled JS + CSS (fetched from the current page) and boots
 * it in "standalone" mode with the document embedded. The result works offline and is
 * fully owned by the author. (Runs against a production build; in dev the module graph
 * isn't bundled, so use `npm run build && npm run preview` to test exports.)
 */
export async function buildStandaloneHtml(doc: ExplorableDoc): Promise<string> {
  const scriptEls = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'),
  )
  const linkEls = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'),
  )
  const styleEls = Array.from(document.querySelectorAll<HTMLStyleElement>('style'))

  const jsParts = await Promise.all(scriptEls.map((s) => fetch(s.src).then((r) => r.text())))
  const cssParts = await Promise.all(linkEls.map((l) => fetch(l.href).then((r) => r.text())))
  const inlineCss = styleEls.map((s) => s.textContent ?? '').join('\n')

  const remixUrl = buildShareUrl(doc, 'edit')
  const title = escapeHtml(doc.title || 'Explorable explanation')
  const description = escapeHtml(doc.description ?? 'An interactive explorable explanation.')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<style>${cssParts.join('\n')}\n${inlineCss}</style>
</head>
<body>
<div id="root"></div>
<script>
window.__EXPLORABLE_DOC__ = ${jsonForScript(serializeDoc(doc))};
window.__EXPLORABLE_REMIX_URL__ = ${jsonForScript(remixUrl)};
</script>
<script type="module">
${jsParts.join('\n')}
</script>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Safely embed a JSON string inside an inline <script> (escape `<` to avoid `</script>`). */
function jsonForScript(value: string): string {
  return JSON.stringify(value).split('<').join('\\u003c')
}
