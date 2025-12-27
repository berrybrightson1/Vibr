"use client"

import { useState } from "react"
import { X } from "lucide-react"

export function UpgradeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 px-8 md:px-12 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">Upgrade to Team to unlock all of Vibr's features and more credits</p>

        <div className="flex items-center gap-6">
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            Upgrade Plan
          </button>
          <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
