import { encodeDocToUrl, type ExplorableDoc } from '../core'

/** The site root, e.g. https://user.github.io/explorable-studio/ */
export function siteBase(): string {
  return `${location.origin}${import.meta.env.BASE_URL}`
}

/** Build a shareable hash-route URL with the document encoded in the link. */
export function buildShareUrl(doc: ExplorableDoc, route: 'view' | 'edit' = 'view'): string {
  return `${siteBase()}#/${route}?d=${encodeDocToUrl(doc)}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
