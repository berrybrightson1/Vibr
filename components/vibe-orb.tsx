"use client"

import { useEffect, useRef } from "react"

export function VibeOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.02

      // Clear canvas
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) / 3

      // Create animated gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)

      // Dynamic colors with time-based shifts
      const hue1 = (time * 50 + 200) % 360
      const hue2 = (time * 50 + 260) % 360
      const hue3 = (time * 50 + 320) % 360

      gradient.addColorStop(0, `hsl(${hue1}, 100%, 60%)`)
      gradient.addColorStop(0.5, `hsl(${hue2}, 100%, 50%)`)
      gradient.addColorStop(1, `hsl(${hue3}, 100%, 40%)`)

      // Draw outer glow
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw inner highlight
      const innerGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius * 0.8,
      )
      innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)")
      innerGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.fillStyle = innerGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
