"use client"

import type React from "react"
import { Send, X } from "lucide-react"
import { useState } from "react"
import type { Category } from "@/lib/vibe-db"
import { vibeDB } from "@/lib/vibe-db"
import { ModelSelector } from "./model-selector"
import type { Model } from "./model-selector"

interface InputSectionProps {
  input: string
  onInputChange: (value: string) => void
  perspective: "me" | "you"
  onPerspectiveChange: (value: "me" | "you") => void
  onSend: () => void
  selectedCategory: Category | null
  onCategoryChange: (category: Category | null) => void
  isLoading?: boolean
  selectedModel: string | null
  selectedModelApiKey: string | null
  onModelSelect: (model: Model, apiKey: string) => void
  onModelClear: () => void
}

export function InputSection({
  input,
  onInputChange,
  perspective,
  onPerspectiveChange,
  onSend,
  selectedCategory,
  onCategoryChange,
  isLoading = false,
  selectedModel,
  selectedModelApiKey,
  onModelSelect,
  onModelClear,
}: InputSectionProps) {
  const [showUpgrade, setShowUpgrade] = useState(true)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !isLoading && selectedCategory && input.trim()) {
      onSend()
    }
  }

  const isSubmitDisabled = !selectedCategory || !input.trim() || isLoading

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full rounded-xl border border-border bg-card dark:bg-card overflow-hidden shadow-2xl transition-all duration-300">
        {/* Input area */}
        <div className="p-4 pb-3">
          <div className="relative mb-3">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's your vibe..."
              disabled={isLoading}
              className="w-full bg-transparent text-base text-foreground placeholder-muted-foreground py-3 px-0 focus:outline-none disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between gap-3 mt-3">
            {/* Left controls - Perspective toggle and Model Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-secondary/50 dark:bg-secondary/50 rounded-md p-1">
                <button
                  onClick={() => onPerspectiveChange("me")}
                  disabled={isLoading}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded transition-all duration-200 ${perspective === "me"
                      ? "bg-muted text-foreground dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                    } disabled:opacity-50`}
                >
                  Self
                </button>
                <button
                  onClick={() => onPerspectiveChange("you")}
                  disabled={isLoading}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded transition-all duration-200 ${perspective === "you"
                      ? "bg-muted text-foreground dark:bg-muted dark:text-foreground"
                      : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                    } disabled:opacity-50`}
                >
                  Other
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ModelSelector selectedModel={selectedModel} onModelSelect={onModelSelect} onModelClear={onModelClear} />
                {!selectedModel && (
                  <span className="text-xs text-muted-foreground" title="Best model will be auto-selected for you">Auto 🤖</span>
                )}
              </div>
            </div>

            {/* Right controls - Category selector and Submit button */}
            <div className="flex items-center gap-2">
              {/* Category selector - shows selected or prompt */}
              <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary dark:hover:bg-secondary rounded-md text-xs font-medium text-muted-foreground dark:text-muted-foreground transition-colors group/category cursor-default">
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {selectedCategory ? vibeDB[selectedCategory]?.label : ""}
                </span>
              </div>

              {/* Submit button - white on dark, working properly */}
              <button
                onClick={onSend}
                disabled={isSubmitDisabled}
                className="flex items-center gap-2 bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upgrade banner - integrated below input */}
        {showUpgrade && (
          <div className="bg-secondary/40 dark:bg-secondary/40 border-t border-border dark:border-border px-4 py-2.5 flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-muted-foreground dark:text-muted-foreground font-medium tracking-wide">
              Upgrade to unlock Vibr's features and more credits
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <a
                href="#"
                className="text-primary dark:text-primary hover:text-primary/90 dark:hover:text-primary/90 font-medium transition-colors"
              >
                Upgrade Plan
              </a>
              <button
                onClick={() => setShowUpgrade(false)}
                className="text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected category chip - below the chatbox */}
      {selectedCategory && (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 dark:border-primary/30 rounded-lg px-3 py-2 w-fit animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-sm font-semibold text-primary dark:text-primary">{vibeDB[selectedCategory].label}</span>
          <button
            onClick={() => onCategoryChange(null)}
            className="text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors flex-shrink-0 ml-1"
            aria-label="Remove category"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground dark:text-muted-foreground text-center font-medium">
        Ctrl + Enter to translate
      </p>
    </div>
  )
}
