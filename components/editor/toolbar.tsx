"use client"

import * as React from "react"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Moon,
  Sun,
  Download,
  Copy,
  FilePlus,
  PanelsTopLeft,
  FileText,
  Eye,
  Columns2,
  FileCode,
  FileDown,
  ClipboardCopy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { FormatAction } from "@/lib/markdown/formatting"
import type { ViewMode, ExportKind } from "./types"

interface ToolbarProps {
  onFormat: (action: FormatAction) => void
  onNewDocument: () => void
  onCopyMarkdown: () => void
  onExport: (kind: ExportKind) => void
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
  theme: string
  onThemeToggle: () => void
}

interface FormatButton {
  action: FormatAction
  label: string
  icon: React.ComponentType<{ className?: string }>
  text?: string
}

const GROUP_INLINE: FormatButton[] = [
  { action: "bold", label: "Bold", icon: Bold },
  { action: "italic", label: "Italic", icon: Italic },
  { action: "strike", label: "Strikethrough", icon: Strikethrough },
  { action: "code", label: "Inline code", icon: Code },
  { action: "codeblock", label: "Code block", icon: Code2 },
]

const GROUP_HEADING: FormatButton[] = [
  { action: "h1", label: "Heading 1", icon: Heading1 },
  { action: "h2", label: "Heading 2", icon: Heading2 },
  { action: "h3", label: "Heading 3", icon: Heading3 },
  { action: "hr", label: "Horizontal rule", icon: Minus },
]

const GROUP_BLOCK: FormatButton[] = [
  { action: "link", label: "Link", icon: LinkIcon },
  { action: "image", label: "Image", icon: ImageIcon },
  { action: "quote", label: "Blockquote", icon: Quote },
  { action: "ul", label: "Bulleted list", icon: List },
  { action: "ol", label: "Numbered list", icon: ListOrdered },
  { action: "table", label: "Table", icon: TableIcon },
]

function ToolButton({
  btn,
  onClick,
}: {
  btn: FormatButton
  onClick: () => void
}) {
  const Icon = btn.icon
  return (
    <Tooltip>
      <TooltipTrigger
        delay={200}
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={btn.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        }
      />
      <TooltipContent side="bottom" className="font-mono text-xs">
        {btn.label}
      </TooltipContent>
    </Tooltip>
  )
}

export function Toolbar({
  onFormat,
  onNewDocument,
  onCopyMarkdown,
  onExport,
  viewMode,
  onViewModeChange,
  theme,
  onThemeToggle,
}: ToolbarProps) {
  return (
    <div className="flex w-full items-center gap-1 border-b border-border bg-background px-3 py-2">
      <div className="mr-2 flex items-center gap-2 pr-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground text-background">
          <PanelsTopLeft className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono text-sm font-medium tracking-tight">Quill</span>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-0.5">
        {GROUP_INLINE.map((b) => (
          <ToolButton key={b.action} btn={b} onClick={() => onFormat(b.action)} />
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-0.5">
        {GROUP_HEADING.map((b) => (
          <ToolButton key={b.action} btn={b} onClick={() => onFormat(b.action)} />
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-0.5">
        {GROUP_BLOCK.map((b) => (
          <ToolButton key={b.action} btn={b} onClick={() => onFormat(b.action)} />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <div
          role="group"
          aria-label="View mode"
          className="flex items-center overflow-hidden rounded-sm border border-border bg-background"
        >
          <ViewSegment
            active={viewMode === "split"}
            onClick={() => onViewModeChange("split")}
            icon={Columns2}
            label="Split"
          />
          <ViewSegment
            active={viewMode === "edit"}
            onClick={() => onViewModeChange("edit")}
            icon={FileText}
            label="Edit"
          />
          <ViewSegment
            active={viewMode === "preview"}
            onClick={() => onViewModeChange("preview")}
            icon={Eye}
            label="Preview"
          />
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Tooltip>
          <TooltipTrigger
            delay={200}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onNewDocument}
                className="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="New document"
              >
                <FilePlus className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom" className="font-mono text-xs">
            New document
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            delay={200}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onCopyMarkdown}
                className="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Copy Markdown"
              >
                <Copy className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent side="bottom" className="font-mono text-xs">
            Copy Markdown
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-sm border-border bg-background font-mono text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">
                Export as
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport("md")}>
                <FileText className="mr-2 h-4 w-4" /> Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("html")}>
                <FileCode className="mr-2 h-4 w-4" /> HTML (.html)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("txt")}>
                <FileDown className="mr-2 h-4 w-4" /> Plain text (.txt)
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onExport("copy-html")}>
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger
            delay={200}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onThemeToggle}
                className="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            }
          />
          <TooltipContent side="bottom" className="font-mono text-xs">
            Toggle theme
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function ViewSegment({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-8 items-center gap-1.5 px-2.5 font-mono text-xs transition-colors",
        active
          ? "bg-foreground text-background"
          : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  )
}
