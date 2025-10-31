// Server-only security utilities with DOMPurify
import 'server-only'

import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// Create DOMPurify instance for server-side use  
const {window} = new JSDOM('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DOMPurifyServer = DOMPurify(window as any)

export function sanitizeHtml(input: string): string {
  return DOMPurifyServer.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame', 'frameset', 'meta', 'link', 'style'],
  })
}

export function sanitizeRichText(input: string): string {
  return DOMPurifyServer.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
    ALLOWED_ATTR: ['class', 'style'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'frame', 'frameset', 'meta', 'link', 'style'],
    FORBID_ATTR: ['style']
  })
}
