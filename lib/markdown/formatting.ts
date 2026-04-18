export type FormatAction =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "codeblock"
  | "h1"
  | "h2"
  | "h3"
  | "hr"
  | "link"
  | "image"
  | "quote"
  | "ul"
  | "ol"
  | "table"

export interface FormatResult {
  value: string
  selection: { start: number; end: number }
}

/**
 * Apply a Markdown formatting action to a text value with a given selection.
 */
export function applyFormatting(
  value: string,
  start: number,
  end: number,
  action: FormatAction,
): FormatResult {
  const selected = value.slice(start, end)

  const wrap = (prefix: string, suffix: string, placeholder: string): FormatResult => {
    const text = selected || placeholder
    const insert = prefix + text + suffix
    const before = value.slice(0, start)
    const after = value.slice(end)
    const newStart = start + prefix.length
    const newEnd = newStart + text.length
    return { value: before + insert + after, selection: { start: newStart, end: newEnd } }
  }

  const prefixLines = (prefix: string, placeholder: string): FormatResult => {
    // Expand selection to full lines
    const lineStart = value.lastIndexOf("\n", start - 1) + 1
    const lineEnd = end === value.length ? end : value.indexOf("\n", end) === -1 ? value.length : value.indexOf("\n", end)
    const segment = value.slice(lineStart, lineEnd) || placeholder
    const lines = segment.split("\n")
    const transformed = lines
      .map((l, i) => {
        if (prefix === "1. ") return `${i + 1}. ${l}`
        return prefix + l
      })
      .join("\n")
    const next = value.slice(0, lineStart) + transformed + value.slice(lineEnd)
    return {
      value: next,
      selection: { start: lineStart, end: lineStart + transformed.length },
    }
  }

  switch (action) {
    case "bold":
      return wrap("**", "**", "bold text")
    case "italic":
      return wrap("*", "*", "italic text")
    case "strike":
      return wrap("~~", "~~", "strikethrough")
    case "code":
      return wrap("`", "`", "code")
    case "codeblock": {
      const body = selected || "// code"
      const insert = `\n\`\`\`ts\n${body}\n\`\`\`\n`
      const before = value.slice(0, start)
      const after = value.slice(end)
      const newStart = start + 8 // after "\n```ts\n"
      const newEnd = newStart + body.length
      return { value: before + insert + after, selection: { start: newStart, end: newEnd } }
    }
    case "h1":
      return prefixLines("# ", "Heading 1")
    case "h2":
      return prefixLines("## ", "Heading 2")
    case "h3":
      return prefixLines("### ", "Heading 3")
    case "hr": {
      const before = value.slice(0, start)
      const after = value.slice(end)
      const needLeading = before.length && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : ""
      const needTrailing = after.startsWith("\n") ? "\n" : "\n\n"
      const insert = `${needLeading}---${needTrailing}`
      const pos = start + insert.length
      return { value: before + insert + after, selection: { start: pos, end: pos } }
    }
    case "link": {
      const text = selected || "link text"
      const url = "https://"
      const insert = `[${text}](${url})`
      const before = value.slice(0, start)
      const after = value.slice(end)
      // select the URL placeholder
      const newStart = start + 1 + text.length + 2 // after "[text]("
      const newEnd = newStart + url.length
      return { value: before + insert + after, selection: { start: newStart, end: newEnd } }
    }
    case "image": {
      const alt = selected || "alt text"
      const url = "https://"
      const insert = `![${alt}](${url})`
      const before = value.slice(0, start)
      const after = value.slice(end)
      const newStart = start + 2 + alt.length + 2
      const newEnd = newStart + url.length
      return { value: before + insert + after, selection: { start: newStart, end: newEnd } }
    }
    case "quote":
      return prefixLines("> ", "quote")
    case "ul":
      return prefixLines("- ", "list item")
    case "ol":
      return prefixLines("1. ", "list item")
    case "table": {
      const template = `\n| Column A | Column B | Column C |\n| -------- | -------- | -------- |\n| Cell     | Cell     | Cell     |\n| Cell     | Cell     | Cell     |\n`
      const before = value.slice(0, start)
      const after = value.slice(end)
      return {
        value: before + template + after,
        selection: { start: start + template.length, end: start + template.length },
      }
    }
  }
}
