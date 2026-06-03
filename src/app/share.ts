import { encodeDocToUrl, type ExplorableDoc } from '../core'

/** The site root, e.g. https://user.github.io/explorable-studio/ */
export function siteBase(): string {
  return `${location.origin}${import.meta.env.BASE_URL}`
}

/** Build a shareable hash-route URL with the document encoded in the link. */
export function buildShareUrl(
  doc: ExplorableDoc,
  route: 'view' | 'edit' | 'embed' = 'view',
): string {
  return `${siteBase()}#/${route}?d=${encodeDocToUrl(doc)}`
}

/** Build an `<iframe>` embed snippet for an explainer (points at the chrome-less /embed view). */
export function buildEmbedCode(doc: ExplorableDoc, height = 600): string {
  const src = buildShareUrl(doc, 'embed')
  const title = (doc.title || 'Explorable explanation').replace(/"/g, '&quot;')
  return `<iframe src="${src}" width="100%" height="${height}" style="border:1px solid #e5e7eb;border-radius:8px" loading="lazy" title="${title}"></iframe>`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
