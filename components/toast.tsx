"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

export function Toast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([])

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const id = Date.now().toString()
      const newToast = { id, message: event.detail.message }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 2000)
    }

    window.addEventListener("showToast", handleShowToast as EventListener)
    return () => window.removeEventListener("showToast", handleShowToast as EventListener)
  }, [])

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-zinc-800 text-white px-4 py-3 rounded-full text-sm font-medium shadow-lg border border-zinc-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <Check className="w-4 h-4 text-green-400" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

export function showToast(message: string) {
  const event = new CustomEvent("showToast", { detail: { message } })
  window.dispatchEvent(event)
}
