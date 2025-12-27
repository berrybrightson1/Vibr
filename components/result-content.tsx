"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Share2, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { vibeDB, type Category } from "@/lib/vibe-db"
import { showToast } from "./toast"

export function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [alternatives, setAlternatives] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const quote = searchParams.get("quote") || ""
  const category = (searchParams.get("category") || "") as Category
  const perspective = searchParams.get("perspective") as "me" | "you"
  const input = searchParams.get("input") || ""

  useEffect(() => {
    if (!quote) return
    setAlternatives([quote])
  }, [quote])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  if (!quote || !category) {
    return null
  }

  const categoryData = vibeDB[category]
  const currentQuote = alternatives[currentIndex] || quote

  const handleNext = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, category, perspective }),
      })

      if (response.ok) {
        const { quote: newQuote } = await response.json()
        if (newQuote) {
          const newAlternatives = [...alternatives, newQuote]
          setAlternatives(newAlternatives)
          setCurrentIndex(newAlternatives.length - 1)
          showToast("New vibe generated!")
        }
      }
    } catch (error) {
      showToast("Failed to generate vibe")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      showToast("Previous vibe")
    }
  }

  const handleShare = async () => {
    const shareText = `"${currentQuote}" - Vibr Translation\n\nCategory: ${categoryData.label}\nVibe: ${perspective === "me" ? "My Vibe" : "Your Vibe"}`
    const shareUrl = typeof window !== "undefined" ? window.location.href : ""

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vibr - Vibe Translation",
          text: shareText,
          url: shareUrl,
        })
        showToast("Shared!")
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        showToast("Copied to clipboard!")
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
          showToast("Copied!")
        } catch {
          showToast("Share error")
        }
      }
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      if (!cardRef.current) {
        showToast("Card element not found")
        return
      }

      const { toJpeg } = await import("html-to-image")

      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#000000",
      })

      const link = document.createElement("a")
      link.download = `vibr-${category}-${Date.now()}.jpg`
      link.href = dataUrl
      link.click()

      showToast("Downloaded!")
    } catch (error) {
      console.error("[v0] Download error:", error)
      showToast("Download error - please try again")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-muted rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Back</span>
          </Button>
          <h1 className="text-lg font-black tracking-tight">
            Vib<span className="text-primary">r</span>
            <span className="text-primary">.</span>
          </h1>
          <ThemeToggle isDark={isDark} onChange={setIsDark} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-6 md:px-8 py-8 md:py-12 relative z-10">
        <div className="w-full max-w-3xl">
          {/* Result Card */}
          <div
            ref={cardRef}
            className="relative rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500"
          >
            <div className={`${categoryData.color} p-8 md:p-10 relative ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {/* Background blur effects */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                {/* Top Section - Category Badge */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-white/70' : 'bg-zinc-900/70'}`} />
                    <span className={`text-xs font-bold tracking-widest uppercase ${isDark ? 'text-white/70' : 'text-zinc-900/70'}`}>Vibr Translation</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    {categoryData.label} Vibes
                  </h2>
                </div>

                {/* Quote */}
                <div className="flex-1 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <p className={`font-black leading-snug ${currentQuote.length > 150
                    ? 'text-3xl md:text-4xl lg:text-5xl'
                    : currentQuote.length > 100
                      ? 'text-4xl md:text-5xl lg:text-6xl'
                      : 'text-5xl md:text-6xl lg:text-7xl'
                    }`}>"{currentQuote}"</p>
                </div>

                {/* Footer Section */}
                <div className={`border-t pt-4 md:pt-5 grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ${isDark ? 'border-white/20' : 'border-zinc-900/20'}`}>
                  <div>
                    <p className={`text-xs mb-1 uppercase tracking-wide font-semibold ${isDark ? 'text-white/60' : 'text-zinc-900/60'}`}>About Us</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{perspective === "me" ? "My Vibe" : "Your Vibe"}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs uppercase tracking-wide font-semibold mb-2 ${isDark ? 'text-white/60' : 'text-zinc-900/60'}`}>Download Now</p>
                    <Button
                      onClick={() => router.push("/")}
                      className={`font-bold text-sm px-4 py-1.5 rounded-lg backdrop-blur ${isDark
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-zinc-900/20 hover:bg-zinc-900/30 text-zinc-900'
                        }`}
                    >
                      Vibr App
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-10 md:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 w-full">
            {/* Navigation and Share Row */}
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                aria-label="Previous vibe"
                data-testid="prev-btn"
                className="px-4 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 font-semibold"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleNext()}
                disabled={isGenerating}
                data-testid="next-btn"
                className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 hover:text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 font-semibold"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm">{isGenerating ? "Generating..." : "Next Vibe"}</span>
              </button>

              <button
                onClick={handleShare}
                aria-label="Share vibe"
                data-testid="share-btn"
                className="px-4 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 rounded-xl flex items-center justify-center transition-all active:scale-95 font-semibold"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              data-testid="download-btn"
              className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              <Download className="w-5 h-5" />
              <span>{isDownloading ? "Downloading..." : "Download Now"}</span>
            </button>
          </div>

          {/* Back Home CTA */}
          <div className="text-center mt-8 animate-in fade-in duration-700 delay-500">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground font-medium text-sm"
            >
              Try another vibe
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
