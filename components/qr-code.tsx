"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCode({ value, size = 120, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const { toCanvas } = await import("qrcode")
        if (canvasRef.current) {
          await toCanvas(canvasRef.current, value, {
            errorCorrectionLevel: "H",
            type: "image/png",
            quality: 0.95,
            margin: 1,
            color: {
              dark: "#ffffff",
              light: "#1e293b",
            },
          })
        }
      } catch (err) {
        console.error("Error generating QR code:", err)
      }
    }

    generateQRCode()
  }, [value])

  return <canvas ref={canvasRef} className={`${className}`} />
}
