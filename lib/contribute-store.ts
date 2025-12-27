export interface Contribution {
    phrase: string
    category: string
    submittedAt: number
}

const STORAGE_KEY = 'vibr_contributions'

export const contributeStore = {
    addContribution(phrase: string, category: string): void {
        if (typeof window === 'undefined') return

        const contributions = this.getContributions()
        const newContribution: Contribution = {
            phrase: phrase.trim(),
            category,
            submittedAt: Date.now()
        }

        contributions.push(newContribution)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions))
    },

    getContributions(): Contribution[] {
        if (typeof window === 'undefined') return []

        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (!stored) return []
            return JSON.parse(stored)
        } catch (error) {
            console.error('Failed to load contributions:', error)
            return []
        }
    },

    getContributionsByCategory(category: string): string[] {
        return this.getContributions()
            .filter(c => c.category === category)
            .map(c => c.phrase)
    },

    clearContributions(): void {
        if (typeof window === 'undefined') return
        localStorage.removeItem(STORAGE_KEY)
    }
}
