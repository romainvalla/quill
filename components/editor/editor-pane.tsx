"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { highlightMarkdown } from "@/lib/markdown/utils"

export interface EditorPaneHandle {
  getSelection: () => { start: number; end: number }
  setSelection: (start: number, end: number) => void
  focus: () => void
  getTextarea: () => HTMLTextAreaElement | null
}

interface EditorPaneProps {
  value: string
  onChange: (next: string) => void
  className?: string
}

const PAIR_OPEN: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "`": "`",
  '"': '"',
  "'": "'",
}

export const EditorPane = React.forwardRef<EditorPaneHandle, EditorPaneProps>(function EditorPane(
  { value, onChange, className },
  ref,
) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const highlightRef = React.useRef<HTMLPreElement | null>(null)
  const gutterRef = React.useRef<HTMLDivElement | null>(null)

  React.useImperativeHandle(ref, () => ({
    getSelection: () => {
      const t = textareaRef.current
      if (!t) return { start: 0, end: 0 }
      return { start: t.selectionStart, end: t.selectionEnd }
    },
    setSelection: (start: number, end: number) => {
      const t = textareaRef.current
      if (!t) return
      t.focus()
      t.setSelectionRange(start, end)
    },
    focus: () => textareaRef.current?.focus(),
    getTextarea: () => textareaRef.current,
  }))

  const lineCount = React.useMemo(() => (value === "" ? 1 : value.split("\n").length), [value])

  const handleScroll = React.useCallback(() => {
    const t = textareaRef.current
    const h = highlightRef.current
    const g = gutterRef.current
    if (!t) return
    if (h) {
      h.scrollTop = t.scrollTop
      h.scrollLeft = t.scrollLeft
    }
    if (g) g.scrollTop = t.scrollTop
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const t = e.currentTarget
      // Tab -> 2 spaces
      if (e.key === "Tab") {
        e.preventDefault()
        const { selectionStart: s, selectionEnd: en, value: v } = t
        if (s !== en && v.slice(s, en).includes("\n")) {
          // indent / outdent selected lines
          const startLine = v.lastIndexOf("\n", s - 1) + 1
          const segment = v.slice(startLine, en)
          let replaced: string
          let delta: number
          if (e.shiftKey) {
            replaced = segment.replace(/^(\s{1,2})/gm, "")
            delta = replaced.length - segment.length
          } else {
            replaced = segment.replace(/^/gm, "  ")
            delta = replaced.length - segment.length
          }
          const next = v.slice(0, startLine) + replaced + v.slice(en)
          onChange(next)
          requestAnimationFrame(() => {
            t.setSelectionRange(s + (e.shiftKey ? Math.max(-2, delta / (replaced.split("\n").length || 1)) : 2), en + delta)
          })
          return
        }
        // no multiline selection: insert 2 spaces
        const next = v.slice(0, s) + "  " + v.slice(en)
        onChange(next)
        requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2))
        return
      }

      // Auto-pair brackets / backticks / quotes
      if (PAIR_OPEN[e.key]) {
        const { selectionStart: s, selectionEnd: en, value: v } = t
        const open = e.key
        const close = PAIR_OPEN[open]
        // if selection exists: wrap
        if (s !== en) {
          e.preventDefault()
          const wrapped = open + v.slice(s, en) + close
          const next = v.slice(0, s) + wrapped + v.slice(en)
          onChange(next)
          requestAnimationFrame(() => t.setSelectionRange(s + 1, en + 1))
          return
        }
        // only auto-pair mirrored chars for symmetric pairs or known openers
        e.preventDefault()
        const next = v.slice(0, s) + open + close + v.slice(en)
        onChange(next)
        requestAnimationFrame(() => t.setSelectionRange(s + 1, s + 1))
        return
      }

      // Enter: continue list/blockquote prefixes
      if (e.key === "Enter" && !e.shiftKey) {
        const { selectionStart: s, value: v } = t
        const lineStart = v.lastIndexOf("\n", s - 1) + 1
        const currentLine = v.slice(lineStart, s)
        const m = currentLine.match(/^(\s*)([-*+]\s+(?:\[[ xX]\]\s+)?|>\s?|\d+\.\s+)(.*)$/)
        if (m) {
          const [, indent, marker, rest] = m
          if (rest.trim() === "") {
            // empty item -> break out of list
            e.preventDefault()
            const next = v.slice(0, lineStart) + v.slice(s)
            onChange(next)
            requestAnimationFrame(() => t.setSelectionRange(lineStart, lineStart))
            return
          }
          e.preventDefault()
          // increment ordered list numbers
          let nextMarker = marker.replace(/\[[xX]\]/, "[ ]")
          const ord = marker.match(/^(\d+)\.\s+$/)
          if (ord) {
            nextMarker = `${parseInt(ord[1], 10) + 1}. `
          }
          const insert = "\n" + indent + nextMarker
          const next = v.slice(0, s) + insert + v.slice(s)
          onChange(next)
          const pos = s + insert.length
          requestAnimationFrame(() => t.setSelectionRange(pos, pos))
        }
      }
    },
    [onChange],
  )

  const highlighted = React.useMemo(() => highlightMarkdown(value) + "\n", [value])

  return (
    <div className={cn("relative flex h-full w-full overflow-hidden bg-background", className)}>
      {/* Line number gutter */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="md-editor-shared select-none overflow-hidden border-r border-border bg-muted/40 px-3 py-4 text-right text-muted-foreground"
        style={{ minWidth: "3.25rem" }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="tabular-nums leading-[1.6]">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Text region: highlight layer + transparent textarea */}
      <div className="relative flex-1 overflow-hidden">
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="md-editor-shared md-highlight subtle-scroll pointer-events-none absolute inset-0 m-0 overflow-auto px-4 py-4 text-foreground"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Start writing in Markdown..."
          aria-label="Markdown editor"
          className={cn(
            "md-editor-shared md-editor-textarea subtle-scroll absolute inset-0 h-full w-full resize-none overflow-auto border-0 bg-transparent px-4 py-4 outline-none",
          )}
        />
      </div>
    </div>
  )
})
