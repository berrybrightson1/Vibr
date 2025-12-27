"use client"

import { Share2, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResultCardProps {
  quote: string
  category: string
  perspective: "me" | "you"
  colorGradient: string
  onShuffle: () => void
  onShare: () => void
}

export function ResultCard({ quote, category, perspective, colorGradient, onShuffle, onShare }: ResultCardProps) {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div
        className={`relative bg-gradient-to-br ${colorGradient} rounded-2xl p-6 md:p-8 text-white overflow-hidden shadow-lg`}
      >
        {/* Background blur element */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <div className="w-full h-full rounded-full blur-3xl bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top Section - Category Badge */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">Vibe Translation</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{category}</h2>
          </div>

          {/* Middle Section - Quote */}
          <div className="flex-1 py-6">
            <p className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-balance">"{quote}"</p>
          </div>

          {/* Bottom Section - Footer Info */}
          <div className="border-t border-white/20 pt-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-white/60 mb-1 uppercase tracking-wide font-medium">Perspective</p>
              <p className="text-sm font-bold text-white">{perspective === "me" ? "Self" : "Others"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60 uppercase tracking-wide font-medium">Via Vibr</p>
              <img src="/app-screenshot.jpg" alt="Vibr App" className="w-10 h-10 rounded-md mt-1 shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onShuffle} variant="outline" size="lg" className="flex-1 rounded-lg bg-transparent">
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
        <Button
          onClick={onShare}
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  )
}
