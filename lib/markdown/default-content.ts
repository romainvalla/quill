export const DEFAULT_MARKDOWN = `# Welcome to Inkwell

A refined, **developer-focused** Markdown editor with _live preview_, built with Next.js and Tailwind.

## Features at a glance

Inkwell supports **GitHub-flavored Markdown**, including tables, task lists, and fenced code blocks with syntax labels.

### Table

| Feature          | Status | Notes                          |
| ---------------- | ------ | ------------------------------ |
| Live preview     | Ready  | Renders on every keystroke     |
| Export to HTML   | Ready  | Self-contained, embedded CSS   |
| Auto-save        | Ready  | Debounced 500ms to localStorage|
| Theme toggle     | Ready  | Light / Dark, 150ms transition |

### Code block

\`\`\`ts
// A small utility that slugifies a title for filenames
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-")
    || "document"
}
\`\`\`

### Blockquote

> "The first draft of anything is sh*t." — Ernest Hemingway
>
> Write freely. Edit ruthlessly.

### Task list

- [x] Scaffold the split-pane layout
- [x] Wire up live Markdown rendering
- [ ] Add collaborative cursors
- [ ] Ship to production

### Image

![A placeholder landscape](/placeholder.svg?height=400&width=800)

---

Start writing below, or hit **New Document** to clear the canvas.
`
