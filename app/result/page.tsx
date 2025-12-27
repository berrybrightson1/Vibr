"use client"

import { Suspense } from "react"
import { ResultContent } from "@/components/result-content"
import { FloatingEmojis } from "@/components/floating-emojis"
import { Toast } from "@/components/toast"

function ResultPageLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <FloatingEmojis />
      <Toast />
      <Suspense fallback={<ResultPageLoading />}>
        <ResultContent />
      </Suspense>
    </div>
  )
}
