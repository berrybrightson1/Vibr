"use client"

import { useEffect, useState } from "react"

interface FloatingEmoji {
  id: number
  emoji: string
  left: number
  top: number
  duration: number
  delay: number
}

export function FloatingEmojis() {
  const [displayEmojis, setDisplayEmojis] = useState<FloatingEmoji[]>([])
  const allEmojis = ["😌", "😊", "😎", "😍", "🤔", "😤", "😭", "😴", "🤗"]

  useEffect(() => {
    let currentSet = 0
    const updateEmojis = () => {
      const emojiGroups = [
        [
          { emoji: allEmojis[0], left: 10, top: 20 },
          { emoji: allEmojis[1], left: 20, top: 60 },
          { emoji: allEmojis[2], left: 80, top: 30 },
        ],
        [
          { emoji: allEmojis[3], left: 70, top: 70 },
          { emoji: allEmojis[4], left: 15, top: 80 },
          { emoji: allEmojis[5], left: 85, top: 50 },
        ],
        [
          { emoji: allEmojis[6], left: 25, top: 40 },
          { emoji: allEmojis[7], left: 75, top: 15 },
          { emoji: allEmojis[8], left: 50, top: 75 },
        ],
      ]

      const newEmojis: FloatingEmoji[] = emojiGroups[currentSet].map((item, index) => ({
        id: index,
        emoji: item.emoji,
        left: item.left,
        top: item.top,
        duration: 8 + index,
        delay: index * 0.5,
      }))

      setDisplayEmojis(newEmojis)
      currentSet = (currentSet + 1) % emojiGroups.length
    }

    updateEmojis()
    const interval = setInterval(updateEmojis, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {displayEmojis.map((item) => (
        <div
          key={item.id}
          className="absolute text-8xl md:text-9xl opacity-12 dark:opacity-5 transition-opacity duration-500"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            animation: `float ${item.duration}s ease-in-out ${item.delay}s infinite`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  )
}
