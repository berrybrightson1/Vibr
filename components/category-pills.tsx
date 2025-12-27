"use client"

import { Button } from "@/components/ui/button"
import { vibeDB, type Category } from "@/lib/vibe-db"

interface CategoryPillsProps {
  selectedCategory: Category | null
  onSelectCategory: (category: Category) => void
}

export function CategoryPills({ selectedCategory, onSelectCategory }: CategoryPillsProps) {
  const categories: Category[] = ["football", "church", "street", "corporate"]

  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onSelectCategory(category)}
          variant={selectedCategory === category ? "default" : "outline"}
          className={`py-5 font-semibold text-sm rounded-lg transition-all ${
            selectedCategory === category
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-card hover:bg-secondary text-foreground border-border"
          }`}
        >
          {vibeDB[category].label}
        </Button>
      ))}
    </div>
  )
}
