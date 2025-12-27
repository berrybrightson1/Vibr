"use client"

import { useEffect, useRef } from "react"

export function AIListeningOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 160
    canvas.width = size
    canvas.height = size

    let animationFrameId: number

    const animate = (time: number) => {
      ctx.clearRect(0, 0, size, size)

      const centerX = size / 2
      const centerY = size / 2

      const gradient = ctx.createRadialGradient(centerX - 10, centerY - 10, 0, centerX, centerY, 40)
      gradient.addColorStop(0, "rgba(74, 222, 128, 0.95)")
      gradient.addColorStop(0.4, "rgba(34, 197, 94, 0.85)")
      gradient.addColorStop(0.7, "rgba(20, 184, 166, 0.75)")
      gradient.addColorStop(1, "rgba(6, 182, 212, 0.4)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
      ctx.fill()

      // Glossy highlight for modern look
      const highlight = ctx.createRadialGradient(centerX - 12, centerY - 12, 0, centerX - 12, centerY - 12, 30)
      highlight.addColorStop(0, "rgba(255, 255, 255, 0.4)")
      highlight.addColorStop(0.5, "rgba(255, 255, 255, 0.1)")
      highlight.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.fillStyle = highlight
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
      ctx.fill()

      const waveCount = 3
      for (let w = 0; w < waveCount; w++) {
        const waveRadius = 45 + w * 8
        const wavePhase = time * 0.003 + w * ((Math.PI * 2) / waveCount)
        const waveOpacity = 0.4 - w * 0.1

        ctx.strokeStyle = `rgba(74, 222, 128, ${waveOpacity})`
        ctx.lineWidth = 1.5
        ctx.beginPath()

        const segments = 100
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2
          const waveAmplitude = Math.sin(wavePhase + angle * 3) * 4
          const x = centerX + Math.cos(angle) * (waveRadius + waveAmplitude)
          const y = centerY + Math.sin(angle) * (waveRadius + waveAmplitude)

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.closePath()
        ctx.stroke()
      }

      // Breathing pulse effect
      const pulse = 35 + Math.sin(time * 0.002) * 3
      ctx.strokeStyle = `rgba(74, 222, 128, ${0.15 + Math.sin(time * 0.002) * 0.08})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2)
      ctx.stroke()

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="flex justify-center mb-4">
      <canvas ref={canvasRef} className="w-32 h-32 drop-shadow-2xl" />
    </div>
  )
}
