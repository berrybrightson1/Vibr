"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, X } from "lucide-react"

export interface Model {
  id: string
  name: string
  provider: string
  logo: string
}

const AVAILABLE_MODELS: Model[] = [
  { id: "openai", name: "GPT-4o", provider: "OpenAI", logo: "🔷" },
  { id: "anthropic", name: "Claude 3.5 Sonnet", provider: "Anthropic", logo: "🤖" },
  { id: "google", name: "Gemini 2.0", provider: "Google", logo: "🔍" },
  { id: "groq", name: "Llama 3.3 70B", provider: "Groq", logo: "⚡" },
  { id: "huggingface", name: "Llama 3.2", provider: "HF", logo: "🤗" },
]

interface ModelSelectorProps {
  selectedModel: string | null
  onModelSelect: (model: Model, apiKey: string) => void
  onModelClear: () => void
}

export function ModelSelector({ selectedModel, onModelSelect, onModelClear }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [pendingModel, setPendingModel] = useState<Model | null>(null)

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel)

  const handleModelClick = (model: Model) => {
    setPendingModel(model)
    setApiKey("")
  }

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingModel && apiKey.trim()) {
      onModelSelect(pendingModel, apiKey)
      setIsOpen(false)
      setPendingModel(null)
      setApiKey("")
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-800 rounded text-xs font-medium text-zinc-400 dark:text-zinc-400 transition-colors flex items-center gap-1 disabled:opacity-50"
        title="Select AI Model"
      >
        {currentModel ? (
          <>
            <span>{currentModel.logo}</span>
            <span className="text-xs">{currentModel.name.split(" ")[0]}</span>
          </>
        ) : (
          <>
            <span>Select Model...</span>
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 w-48 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {!pendingModel ? (
            <div className="py-1 max-h-64 overflow-y-auto">
              {AVAILABLE_MODELS.map((model, index) => (
                <button
                  key={model.id}
                  onClick={() => handleModelClick(model)}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 transition-all duration-150 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className="text-sm">{model.logo}</span>
                  <div>
                    <div className="font-medium text-zinc-100 text-xs">{model.name}</div>
                    <div className="text-xs text-zinc-500">{model.provider}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 animate-in fade-in zoom-in duration-200">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm">{pendingModel.logo}</span>
                <div>
                  <div className="font-medium text-zinc-100 text-xs">{pendingModel.name}</div>
                  <div className="text-xs text-zinc-500">{pendingModel.provider}</div>
                </div>
              </div>
              <form onSubmit={handleApiKeySubmit} className="space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API key..."
                  className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!apiKey.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-xs font-medium py-1.5 rounded transition-all duration-200"
                  >
                    Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingModel(null)
                      setApiKey("")
                    }}
                    className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-medium rounded transition-colors"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {currentModel && (
        <button
          onClick={onModelClear}
          className="absolute -top-1 -right-1 bg-zinc-900 border border-zinc-700 rounded-full p-0.5 hover:bg-zinc-800 transition-colors"
          title="Clear model"
        >
          <X className="w-2.5 h-2.5 text-zinc-400" />
        </button>
      )}
    </div>
  )
}
