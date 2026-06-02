import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { ExplorableDoc } from './types'
import { parseDoc, serializeDoc, SchemaError } from './serialize'

/** Encode a document into a compact, URL-safe string (for shareable links). */
export function encodeDocToUrl(doc: ExplorableDoc): string {
  return compressToEncodedURIComponent(serializeDoc(doc))
}

/** Decode a document from a shared-link string. Throws SchemaError if invalid. */
export function decodeDocFromUrl(encoded: string): ExplorableDoc {
  const json = decompressFromEncodedURIComponent(encoded)
  if (json === null || json === '') {
    throw new SchemaError('Could not decode the shared link (corrupted or incomplete).')
  }
  return parseDoc(json)
}
