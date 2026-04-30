"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const shortcuts = [
  { keys: ["Ctrl", "Enter"], description: "Submit order form" },
  { keys: ["Ctrl", "S"], description: "Save draft" },
  { keys: ["Esc"], description: "Close modal" },
  { keys: ["?"], description: "Show this help" }
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-[#2f81f7] hover:text-[#79c0ff] text-sm underline">
          Keyboard shortcuts
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#161b22] border-[#30363d] text-[#e6edf3]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-[#848d97]">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i} className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#e6edf3]">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}