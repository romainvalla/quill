"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { renderMarkdown } from "@/lib/markdown/utils"

interface PreviewPaneProps {
  source: string
  className?: string
}

export function PreviewPane({ source, className }: PreviewPaneProps) {
  // Render only on client to ensure DOMPurify has access to a DOM.
  const [mounted, setMounted] = React.useState(false)
  const previewRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    React.startTransition(() => setMounted(true))
  }, [])

  const html = React.useMemo(() => (mounted ? renderMarkdown(source) : ""), [mounted, source])

  // Assign HTML via ref so React does not warn about <script> in sanitized HTML strings.
  React.useLayoutEffect(() => {
    const el = previewRef.current
    if (!el) return
    el.innerHTML = html
  }, [html])

  return (
    <div className={cn("h-full w-full overflow-auto bg-background subtle-scroll", className)}>
      <div
        ref={previewRef}
        className="md-preview mx-auto max-w-3xl px-8 py-10"
      />
    </div>
  )
}
