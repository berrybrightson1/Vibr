"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { InputSection } from "@/components/input-section"
import { CategorySlider } from "@/components/category-slider"
import { FloatingEmojis } from "@/components/floating-emojis"
import { AIListeningOrb } from "@/components/ai-listening-orb"
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

  const handleTranslate = async () => {
    if (!selectedCategory || !input.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input.trim(),
          category: selectedCategory,
          perspective,
          modelId: selectedModel || null,
          apiKey: selectedModelApiKey || null,
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
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">
            Vib<span className="text-primary">r</span>
            <span className="text-primary">.</span>
          </h1>
          <ThemeToggle isDark={isDark} onChange={setIsDark} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-8 md:px-16 py-16 md:py-20 relative z-10">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-16 md:mb-20">
            <div className="flex justify-center mb-10">
              <AIListeningOrb />
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-balance mb-3">
              What's your
              <br />
              vibe today?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose a category,
              <br />
              express yourself.
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
