"use client"

import { Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

interface ThemeToggleProps {
  isDark: boolean
  onChange: (isDark: boolean) => void
}

export function ThemeToggle({ isDark, onChange }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => onChange(!isDark)}
      className="group relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ease-in-out hover:bg-secondary/80"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon - visible in light mode */}
        <Sun
          className="absolute w-5 h-5 text-amber-500 transition-all duration-500 ease-in-out"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(-90deg) scale(0.8)" : "rotate(0deg) scale(1)",
          }}
        />

        {/* Moon Icon - visible in dark mode */}
        <Moon
          className="absolute w-5 h-5 text-slate-400 transition-all duration-500 ease-in-out"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.8)",
          }}
        />
      </div>

      {/* Subtle glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out"
        style={{
          background: isDark
            ? "radial-gradient(circle, rgba(148, 163, 184, 0.5), transparent)"
            : "radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent)",
        }}
      />
    </button>
  )
}
