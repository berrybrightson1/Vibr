"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { vibeDB, type Category } from "@/lib/vibe-db"

interface CategorySliderProps {
  selectedCategory: Category | null
  onSelectCategory: (category: Category) => void
}

export function CategorySlider({ selectedCategory, onSelectCategory }: CategorySliderProps) {
  const categories: Category[] = ["football", "church", "street", "corporate", "creative", "romance"]
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length)

      if (scrollContainerRef.current) {
        const scrollAmount = 280
        scrollContainerRef.current.scrollTo({
          left: ((currentIndex + 1) % categories.length) * scrollAmount,
          behavior: "smooth",
        })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [currentIndex, categories.length])

  const handleCategoryClick = (index: number) => {
    setCurrentIndex(index)
    onSelectCategory(categories[index])
  }

  const itemsPerSlide = 2
  const totalSlides = Math.ceil(categories.length / itemsPerSlide)

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Categories</p>

      <div ref={scrollContainerRef} className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map((category, index) => (
          <Button
            key={category}
            onClick={() => handleCategoryClick(index)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`whitespace-nowrap flex-shrink-0 py-2 px-4 sm:px-6 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-300 ${selectedCategory === category
                ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                : "bg-card hover:bg-primary/10 hover:text-primary text-foreground dark:text-muted-foreground border-border"
              }`}
          >
            {vibeDB[category].label}
          </Button>
        ))}
      </div>

      <div className="flex justify-center gap-2 pt-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const targetIndex = index * itemsPerSlide
              setCurrentIndex(targetIndex)
              onSelectCategory(categories[targetIndex])
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                  left: targetIndex * 280,
                  behavior: "smooth",
                })
              }
            }}
            className={`rounded-full transition-all duration-500 ${Math.floor(currentIndex / itemsPerSlide) === index
                ? "bg-primary w-8 h-2.5"
                : "bg-muted-foreground/30 w-2.5 h-2.5 hover:bg-muted-foreground/60"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
