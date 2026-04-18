import { Marked } from "marked"
import DOMPurify from "dompurify"

// Custom renderer that adds data-lang attribute to <pre> for CSS labels
const marked = new Marked({
  gfm: true,
  breaks: true,
  async: false,
})

marked.use({
  renderer: {
    code(token) {
      const lang = (token.lang || "").split(/\s/)[0] || ""
      const code = token.text
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
      const langAttr = lang ? ` data-lang="${lang}"` : ""
      return `<pre${langAttr}><code${lang ? ` class="language-${lang}"` : ""}>${escaped}</code></pre>`
    },
    listitem(item) {
      // GFM task list items
      const text = this.parser.parse(item.tokens)
      if (item.task) {
        const checked = item.checked ? " checked" : ""
        return `<li class="task-list-item"><input type="checkbox" disabled${checked}/> <span>${text}</span></li>`
      }
      return `<li>${text}</li>`
    },
    list(token) {
      const ordered = token.ordered
      const tag = ordered ? "ol" : "ul"
      const hasTask = token.items.some((i) => i.task)
      const klass = hasTask && !ordered ? ` class="contains-task-list"` : ""
      const body = token.items.map((item) => this.listitem(item)).join("")
      const start = ordered && token.start !== 1 ? ` start="${token.start}"` : ""
      return `<${tag}${klass}${start}>${body}</${tag}>`
    },
  },
})

/**
 * Parse Markdown synchronously and sanitize the resulting HTML.
 * Client-side only — DOMPurify requires a DOM.
 */
export function renderMarkdown(source: string): string {
  if (typeof window === "undefined") return ""
  const raw = marked.parse(source, { async: false }) as string
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ["target", "data-lang"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/[a-z]+):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/** Slugify a string into a safe filename. */
export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return s || "document"
}

/** Extract the first H1 heading text from Markdown source. */
export function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+?)\s*$/m)
  return match ? match[1].trim() : null
}

/** Strip Markdown syntax for plaintext export. */
export function stripMarkdown(source: string): string {
  let s = source
  // fenced code blocks: keep content, drop fences
  s = s.replace(/```[\w-]*\n([\s\S]*?)```/g, (_, code) => code)
  // inline code
  s = s.replace(/`([^`]+)`/g, "$1")
  // images ![alt](url) -> alt
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
  // links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  // headings
  s = s.replace(/^#{1,6}\s+/gm, "")
  // bold / italic / strikethrough
  s = s.replace(/(\*\*|__)(.*?)\1/g, "$2")
  s = s.replace(/(\*|_)(.*?)\1/g, "$2")
  s = s.replace(/~~(.*?)~~/g, "$1")
  // blockquotes
  s = s.replace(/^>\s?/gm, "")
  // list markers
  s = s.replace(/^\s*[-*+]\s+(\[[ xX]\]\s+)?/gm, "")
  s = s.replace(/^\s*\d+\.\s+/gm, "")
  // horizontal rules
  s = s.replace(/^\s*-{3,}\s*$/gm, "")
  // tables — strip pipes and separator rows
  s = s.replace(/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/gm, "")
  s = s.replace(/\|/g, " ")
  return s.replace(/\n{3,}/g, "\n\n").trim()
}

/** Compute word / char / line counts. */
export function computeStats(source: string): { words: number; chars: number; lines: number } {
  const chars = source.length
  const lines = source === "" ? 0 : source.split("\n").length
  const words = source.trim() === "" ? 0 : source.trim().split(/\s+/).length
  return { words, chars, lines }
}

/**
 * Lightweight Markdown syntax highlighter for the editor overlay.
 * Escapes HTML then wraps syntactic tokens with spans.
 * Intentionally not perfect — good enough to provide visual rhythm.
 */
export function highlightMarkdown(source: string): string {
  // 1. escape
  const escaped = source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Process line-by-line for block-level tokens
  const lines = escaped.split("\n")
  let inFence = false
  const out: string[] = []
  for (const line of lines) {
    const fence = line.match(/^(```+)([\w-]*)\s*$/)
    if (fence) {
      inFence = !inFence
      out.push(`<span class="md-cb">${line}</span>`)
      continue
    }
    if (inFence) {
      out.push(`<span class="md-cb">${line || " "}</span>`)
      continue
    }
    // heading
    const h = line.match(/^(#{1,6})(\s+.*)?$/)
    if (h) {
      out.push(`<span class="md-h">${line}</span>`)
      continue
    }
    // horizontal rule
    if (/^\s*-{3,}\s*$/.test(line) || /^\s*\*{3,}\s*$/.test(line)) {
      out.push(`<span class="md-hr">${line}</span>`)
      continue
    }
    // blockquote
    if (/^\s*&gt;/.test(line)) {
      out.push(`<span class="md-q">${line || " "}</span>`)
      continue
    }
    // list marker
    const lm = line.match(/^(\s*)([-*+]|\d+\.)(\s+)(.*)$/)
    if (lm) {
      const [, indent, marker, space, rest] = lm
      out.push(`${indent}<span class="md-list">${marker}</span>${space}${inlineHighlight(rest)}`)
      continue
    }
    out.push(inlineHighlight(line))
  }
  return out.join("\n")
}

function inlineHighlight(line: string): string {
  let s = line
  // inline code
  s = s.replace(/`([^`]+)`/g, '<span class="md-c">`$1`</span>')
  // bold
  s = s.replace(/(\*\*|__)([^*_]+)\1/g, '<span class="md-b">$1$2$1</span>')
  // italic (after bold to avoid collision with **)
  s = s.replace(/(?<![*_])([*_])([^*_\n]+)\1(?![*_])/g, '<span class="md-i">$1$2$1</span>')
  // links [text](url)
  s = s.replace(/(\[[^\]]+\]\([^)]+\))/g, '<span class="md-l">$1</span>')
  return s
}
