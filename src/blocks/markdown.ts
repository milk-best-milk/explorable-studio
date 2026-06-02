import MarkdownIt from 'markdown-it'

// html:false means raw HTML in source is escaped, so rendered explainers are safe to
// share and embed (no script/style injection through Markdown).
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
})

export function renderMarkdown(src: string): string {
  return md.render(src)
}

export function renderMarkdownInline(src: string): string {
  return md.renderInline(src)
}
