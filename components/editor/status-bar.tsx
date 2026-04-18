"use client"

import * as React from "react"
import { Check, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBarProps {
  words: number
  chars: number
  lines: number
  saveState: "idle" | "saving" | "saved"
  title: string | null
}

export function StatusBar({ words, chars, lines, saveState, title }: StatusBarProps) {
  return (
    <div className="flex w-full items-center justify-between border-t border-border bg-background px-4 py-1.5 font-mono text-[11px] text-muted-foreground">
      <div className="flex items-center gap-4">
        <Stat label="words" value={words} />
        <Divider />
        <Stat label="chars" value={chars} />
        <Divider />
        <Stat label="lines" value={lines} />
        {title && (
          <>
            <Divider />
            <span className="truncate">
              <span className="text-muted-foreground/60">title:</span>{" "}
              <span className="text-foreground">{title}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SaveIndicator state={saveState} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="tabular-nums text-foreground">{value.toLocaleString()}</span>
      <span className="text-muted-foreground/70">{label}</span>
    </span>
  )
}

function Divider() {
  return <span aria-hidden="true" className="h-3 w-px bg-border" />
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 transition-opacity",
        state === "idle" ? "opacity-50" : "opacity-100",
      )}
    >
      {state === "saved" ? (
        <Check className="h-3 w-3 text-accent" />
      ) : (
        <CircleDot className={cn("h-3 w-3", state === "saving" ? "animate-pulse text-accent" : "text-muted-foreground")} />
      )}
      <span className={cn(state === "saved" ? "text-foreground" : "text-muted-foreground")}>
        {state === "saved" ? "Saved" : state === "saving" ? "Saving..." : "Ready"}
      </span>
    </span>
  )
}
