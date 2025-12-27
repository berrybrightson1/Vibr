"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { InputSection } from "@/components/input-section"
import { CategorySlider } from "@/components/category-slider"
import { FloatingEmojis } from "@/components/floating-emojis"
import { AIListeningOrb } from "@/components/ai-listening-orb"
import { contributeStore } from "@/lib/contribute-store"
import type { Category } from "@/lib/vibe-db"
import type { Model } from "@/components/model-selector"

export default function Home() {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [perspective, setPerspective] = useState<"me" | "you">("me")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDark, setIsDark] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedModelApiKey, setSelectedModelApiKey] = useState<string | null>(null)
  const [contributionInput, setContributionInput] = useState("")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    localStorage.setItem("vibr_theme_dark", isDark.toString())
  }, [isDark])

  useEffect(() => {
    const savedTheme = localStorage.getItem("vibr_theme_dark")
    if (savedTheme) {
      setIsDark(savedTheme === "true")
    }

    const saved = localStorage.getItem("vibr_model_config")
    if (saved) {
      const { model, apiKey } = JSON.parse(saved)
      setSelectedModel(model)
      setSelectedModelApiKey(apiKey)
    }
  }, [])

  const handleModelSelect = (model: Model, apiKey: string) => {
    setSelectedModel(model.id)
    setSelectedModelApiKey(apiKey)
    localStorage.setItem("vibr_model_config", JSON.stringify({ model: model.id, apiKey }))
  }

  const handleModelClear = () => {
    setSelectedModel(null)
    setSelectedModelApiKey(null)
    localStorage.removeItem("vibr_model_config")
  }

  const showFeedback = (message: string, type: "success" | "error" | "warning") => {
    const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-yellow-500"

    const toast = document.createElement("div")
    toast.className = `fixed top-20 right-4 ${bgColor} text-black px-6 py-3 rounded-lg font-semibold z-50 shadow-lg`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity", "duration-300")
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const handleContribute = () => {
    const phrase = contributionInput.trim()
    if (!phrase || !selectedCategory) return

    contributeStore.addContribution(phrase, selectedCategory)
    setContributionInput("")

    // Show success feedback
    const toast = document.createElement("div")
    toast.className = "fixed top-20 right-4 bg-green-500 text-black px-6 py-3 rounded-lg font-semibold z-50 animate-fade-in"
    toast.textContent = "✓ Vibe added to " + selectedCategory + "!"
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.classList.add("opacity-0", "transition-opacity")
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  const handleTranslate = async () => {
    if (!selectedCategory || !input.trim()) return

    setIsLoading(true)
    try {
      // Auto-select best model if none is manually chosen
      let modelToUse = selectedModel
      let apiKeyToUse = selectedModelApiKey

      if (!modelToUse) {
        const { selectBestModel } = await import("@/lib/smart-model-selection")
        modelToUse = selectBestModel(input, selectedCategory)

        // Check if we have an API key saved for the auto-selected model
        const savedConfig = localStorage.getItem("vibr_model_config")
        if (savedConfig) {
          const config = JSON.parse(savedConfig)
          if (config.model === modelToUse) {
            apiKeyToUse = config.apiKey
          }
        }
      }

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          category: selectedCategory,
          perspective,
          modelId: modelToUse,
          apiKey: apiKeyToUse,
        }),
      })

      if (response.ok) {
        const { quote } = await response.json()
        const params = new URLSearchParams({
          quote,
          category: selectedCategory,
          perspective,
          input: input.trim(),
        })
        router.push(`/result?${params.toString()}`)
      } else {
        console.error("Translation failed")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <FloatingEmojis />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex-shrink-0">
            Vib<span className="text-primary">r</span>
            <span className="text-primary">.</span>
          </h1>

          {/* Contribution Input - grows to fill space */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={contributionInput}
              onChange={(e) => setContributionInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleContribute()}
              placeholder="Share your vibr"
              title="Describe a feeling, relationship, or experience"
              className="w-full px-3 sm:px-4 py-2 pr-[9.5rem] sm:pr-[11rem] rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all text-sm truncate"
              style={{
                maskImage: "linear-gradient(to right, black 70%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, black 70%, transparent 100%)"
              }}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-background/50 backdrop-blur-sm p-1 rounded-md">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className="px-2 py-1 bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 text-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-xs font-semibold hover:bg-primary/20 dark:hover:bg-primary/30 transition-all shadow-sm"
                title="Select category"
              >
                <option value="" disabled>Select</option>
                <option value="football">Football</option>
                <option value="relationship">Street</option>
                <option value="money">Corporate</option>
                <option value="career">Church</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="travel">Travel</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
              <button
                onClick={handleContribute}
                disabled={!contributionInput.trim()}
                title="Submit your vibe"
                className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle isDark={isDark} onChange={setIsDark} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 py-1 md:py-3 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-3 md:mb-5">
            <div className="flex justify-center mb-1">
              <AIListeningOrb />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-balance mb-0.5">
              Got a vibe ?
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose a category, express yourself.
            </p>
          </div>

          {/* Form Section - Centered and Expanded */}
          <div className="flex flex-col gap-10 max-w-3xl mx-auto w-full">
            {/* Categories */}
            <CategorySlider selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

            {/* Input Section */}
            <InputSection
              input={input}
              onInputChange={setInput}
              perspective={perspective}
              onPerspectiveChange={setPerspective}
              onSend={handleTranslate}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              isLoading={isLoading}
              selectedModel={selectedModel}
              selectedModelApiKey={selectedModelApiKey}
              onModelSelect={handleModelSelect}
              onModelClear={handleModelClear}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
