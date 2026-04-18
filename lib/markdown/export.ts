import { renderMarkdown, stripMarkdown, slugify, extractTitle } from "./utils"

/** Trigger a browser download for the given string content. */
export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke on next tick to let the download start
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Filename base from first H1, slugified. */
export function filenameFromMarkdown(source: string): string {
  const title = extractTitle(source)
  return slugify(title ?? "document")
}

/** Build a self-contained HTML5 document from rendered markdown HTML. */
export function buildStandaloneHtml(bodyHtml: string, title: string): string {
  const css = STANDALONE_CSS
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${css}</style>
</head>
<body>
<main class="prose">
${bodyHtml}
</main>
</body>
</html>
`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/** Re-export helpers. */
export { renderMarkdown, stripMarkdown, slugify, extractTitle }

const STANDALONE_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #fafaf9;
  color: #1c1917;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
main.prose {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px 96px;
  font-size: 16px;
}
h1,h2,h3,h4,h5,h6 { font-weight: 600; letter-spacing: -0.01em; line-height: 1.25; margin: 1.75em 0 0.6em; }
h1 { font-size: 2rem; border-bottom: 1px solid #e7e5e0; padding-bottom: 0.3em; }
h2 { font-size: 1.5rem; border-bottom: 1px solid #e7e5e0; padding-bottom: 0.25em; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.05rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.9rem; color: #6b6660; }
p { margin: 0.9em 0; }
a { color: #d97706; text-decoration: underline; text-underline-offset: 2px; }
strong { font-weight: 700; }
em { font-style: italic; }
del { color: #6b6660; }
hr { border: 0; border-top: 1px solid #e7e5e0; margin: 2em 0; }
img { max-width: 100%; border: 1px solid #e7e5e0; border-radius: 6px; }
blockquote {
  border-left: 3px solid #d97706;
  padding: 0.2em 1em;
  margin: 1em 0;
  color: #6b6660;
  font-style: italic;
  background: rgba(217,119,6,0.05);
}
ul, ol { padding-left: 1.5em; margin: 0.9em 0; }
ul { list-style: disc; }
ol { list-style: decimal; }
li { margin: 0.3em 0; }
ul.contains-task-list { list-style: none; padding-left: 0.5em; }
li.task-list-item { display: flex; align-items: flex-start; gap: 0.5em; }
li.task-list-item input[type="checkbox"] { margin-top: 0.4em; accent-color: #d97706; }
table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.95em; }
th, td { border: 1px solid #e7e5e0; padding: 0.5em 0.75em; text-align: left; }
thead th { background: #f0efec; font-weight: 600; }
tbody tr:nth-child(even) { background: #f7f6f3; }
:not(pre) > code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.9em;
  background: #f0efec;
  color: #b45309;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  border: 1px solid #e7e5e0;
}
pre {
  position: relative;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.9em;
  line-height: 1.6;
  background: #0d1117;
  color: #e6edf3;
  padding: 1em 1.1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
  border: 1px solid #1f232b;
}
pre code { background: transparent; color: inherit; padding: 0; border: 0; }
pre[data-lang]::before {
  content: attr(data-lang);
  position: absolute;
  top: 0.5em;
  right: 0.75em;
  font-size: 0.7rem;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.1em 0.5em;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 4px;
}
`
