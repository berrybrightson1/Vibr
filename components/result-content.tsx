"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { ArrowLeft, Share2, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { vibeDB, type Category } from "@/lib/vibe-db"
import { showToast } from "./toast"
import html2canvas from "html2canvas"

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
        if (newQuote && !alternatives.includes(newQuote)) {
          const newAlternatives = [...alternatives, newQuote]
          setAlternatives(newAlternatives)
          setCurrentIndex(newAlternatives.length - 1)
          showToast("New vibe generated!")
        } else {
          showToast("Generating alternative...")
          setTimeout(() => handleNext(), 500)
          return
        }
      }
    } catch (error) {
      showToast("Failed to generate alternative")
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
    if (!cardRef.current) {
      showToast("Error loading card")
      return
    }

    setIsDownloading(true)
    try {
      const clone = cardRef.current.cloneNode(true) as HTMLElement
      clone.style.position = "absolute"
      clone.style.left = "-9999px"
      document.body.appendChild(clone)

      const canvas = await html2canvas(clone, {
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 10000,
        logging: false,
      })

      document.body.removeChild(clone)

      const jpegData = canvas.toDataURL("image/jpeg", 0.95)
      const link = document.createElement("a")
      link.href = jpegData
      link.download = `vibr-${category}-${Date.now()}.jpg`
      link.click()

      showToast("Downloaded!")
    } catch (error) {
      console.log("[v0] Download error:", error)
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
            <div className={`${categoryData.color} p-8 md:p-10 text-white relative`}>
              {/* Background blur effects */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col gap-6">
                {/* Top Section - Category Badge */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" />
                    <span className="text-xs font-bold tracking-widest text-white/70 uppercase">Vibr Translation</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    {categoryData.label} Vibes
                  </h2>
                </div>

                {/* Quote */}
                <div className="flex-1 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <p className="text-5xl md:text-6xl lg:text-7xl font-black leading-snug">"{currentQuote}"</p>
                </div>

                {/* Footer Section */}
                <div className="border-t border-white/20 pt-4 md:pt-5 grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <div>
                    <p className="text-xs text-white/60 mb-1 uppercase tracking-wide font-semibold">About Us</p>
                    <p className="text-sm font-bold text-white">{perspective === "me" ? "My Vibe" : "Your Vibe"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 uppercase tracking-wide font-semibold mb-2">Download Now</p>
                    <Button
                      onClick={() => router.push("/")}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-4 py-1.5 rounded-lg backdrop-blur"
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
                className="px-4 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-95 font-semibold"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                disabled={isGenerating}
                className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 hover:text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 font-semibold"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="text-sm">{isGenerating ? "Generating..." : "Next Vibe"}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-green-400 rounded-xl flex items-center justify-center transition-all active:scale-95 font-semibold"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
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
