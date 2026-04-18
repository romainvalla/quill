"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast, Toaster } from "sonner"

import { Toolbar } from "./toolbar"
import { EditorPane, type EditorPaneHandle } from "./editor-pane"
import { PreviewPane } from "./preview-pane"
import { StatusBar } from "./status-bar"
import type { ViewMode, ExportKind } from "./types"
import { DEFAULT_MARKDOWN } from "@/lib/markdown/default-content"
import {
  computeStats,
  extractTitle,
  renderMarkdown,
  stripMarkdown,
} from "@/lib/markdown/utils"
import { applyFormatting, type FormatAction } from "@/lib/markdown/formatting"
import {
  buildStandaloneHtml,
  copyTextToClipboard,
  downloadFile,
  filenameFromMarkdown,
} from "@/lib/markdown/export"
import { APP_DEFAULT_THEME } from "@/lib/theme-default"

const STORAGE_KEY = "quill.markdown.v1"
const VIEW_KEY = "quill.view.v1"

export function MarkdownEditor() {
  const [value, setValue] = React.useState<string>("")
  const [hydrated, setHydrated] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>("split")
  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved">("idle")
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const { resolvedTheme, setTheme } = useTheme()
  const [themeReady, setThemeReady] = React.useState(false)
  const editorRef = React.useRef<EditorPaneHandle>(null)

  React.useEffect(() => {
    setThemeReady(true)
  }, [])

  // Hydrate from localStorage
  React.useEffect(() => {
    React.startTransition(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        setValue(stored !== null ? stored : DEFAULT_MARKDOWN)
        const storedView = localStorage.getItem(VIEW_KEY) as ViewMode | null
        if (storedView === "split" || storedView === "edit" || storedView === "preview") {
          setViewMode(storedView)
        }
      } catch {
        setValue(DEFAULT_MARKDOWN)
      }
      setHydrated(true)
    })
  }, [])

  // Debounced auto-save
  const saveTimer = React.useRef<number | null>(null)
  const savedTimer = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (!hydrated) return
    React.startTransition(() => setSaveState("saving"))
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, value)
        setSaveState("saved")
        if (savedTimer.current) window.clearTimeout(savedTimer.current)
        savedTimer.current = window.setTimeout(() => setSaveState("idle"), 1500)
      } catch {
        setSaveState("idle")
      }
    }, 500)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [value, hydrated])

  // Persist view mode
  React.useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(VIEW_KEY, viewMode)
    } catch {
      /* noop */
    }
  }, [viewMode, hydrated])

  const stats = React.useMemo(() => computeStats(value), [value])
  const title = React.useMemo(() => extractTitle(value), [value])

  const handleFormat = React.useCallback(
    (action: FormatAction) => {
      const ta = editorRef.current?.getTextarea()
      if (!ta) return
      const { selectionStart, selectionEnd } = ta
      const result = applyFormatting(value, selectionStart, selectionEnd, action)
      setValue(result.value)
      requestAnimationFrame(() => {
        editorRef.current?.setSelection(result.selection.start, result.selection.end)
      })
    },
    [value],
  )

  const handleCopyMarkdown = React.useCallback(async () => {
    const ok = await copyTextToClipboard(value)
    if (ok) toast.success("Markdown copied to clipboard")
    else toast.error("Could not copy to clipboard")
  }, [value])

  const handleExport = React.useCallback(
    async (kind: ExportKind) => {
      const base = filenameFromMarkdown(value)
      const docTitle = extractTitle(value) ?? "Document"

      if (kind === "md") {
        downloadFile(`${base}.md`, value, "text/markdown")
        toast.success(`Exported ${base}.md`)
        return
      }

      if (kind === "html") {
        const body = renderMarkdown(value)
        const html = buildStandaloneHtml(body, docTitle)
        downloadFile(`${base}.html`, html, "text/html")
        toast.success(`Exported ${base}.html`)
        return
      }

      if (kind === "txt") {
        const txt = stripMarkdown(value)
        downloadFile(`${base}.txt`, txt, "text/plain")
        toast.success(`Exported ${base}.txt`)
        return
      }

      if (kind === "copy-html") {
        const body = renderMarkdown(value)
        const ok = await copyTextToClipboard(body)
        if (ok) toast.success("HTML copied to clipboard")
        else toast.error("Could not copy HTML")
        return
      }
    },
    [value],
  )

  const handleThemeToggle = React.useCallback(() => {
    const current = resolvedTheme ?? APP_DEFAULT_THEME
    setTheme(current === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const toolbarTheme = themeReady
    ? (resolvedTheme ?? APP_DEFAULT_THEME)
    : APP_DEFAULT_THEME

  // Keyboard shortcuts (Cmd/Ctrl + B / I / K)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ta = editorRef.current?.getTextarea()
      if (!ta || document.activeElement !== ta) return
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      const map: Record<string, FormatAction> = {
        b: "bold",
        i: "italic",
        k: "link",
      }
      const action = map[e.key.toLowerCase()]
      if (action) {
        e.preventDefault()
        handleFormat(action)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [handleFormat])

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <Toolbar
        onFormat={handleFormat}
        onNewDocument={() => setConfirmOpen(true)}
        onCopyMarkdown={handleCopyMarkdown}
        onExport={handleExport}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={toolbarTheme}
        onThemeToggle={handleThemeToggle}
      />

      <main className="min-h-0 flex-1">
        {!hydrated ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="font-mono text-xs">Loading editor...</span>
          </div>
        ) : viewMode === "split" ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={25} className="min-w-0">
              <EditorPane ref={editorRef} value={value} onChange={setValue} />
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-border" />
            <ResizablePanel defaultSize={50} minSize={25} className="min-w-0">
              <PreviewPane source={value} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : viewMode === "edit" ? (
          <EditorPane ref={editorRef} value={value} onChange={setValue} />
        ) : (
          <PreviewPane source={value} />
        )}
      </main>

      <StatusBar
        words={stats.words}
        chars={stats.chars}
        lines={stats.lines}
        saveState={saveState}
        title={title}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the editor. Your current content will be removed from this device&apos;s auto-save.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false)
                setValue("")
                try {
                  localStorage.removeItem(STORAGE_KEY)
                } catch {
                  /* noop */
                }
                requestAnimationFrame(() => editorRef.current?.focus())
                toast.success("New document started")
              }}
            >
              New document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!font-mono !text-xs !rounded-sm !border-border",
          },
        }}
      />
    </div>
  )
}
