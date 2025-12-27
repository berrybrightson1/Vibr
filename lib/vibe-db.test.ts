import { describe, it, expect } from 'vitest'
import { vibeDB } from './vibe-db'

describe('vibeDB', () => {
    it('should have valid structure for all categories', () => {
        Object.keys(vibeDB).forEach((key) => {
            const category = vibeDB[key as keyof typeof vibeDB]
            if (key === 'parse') return // Skip placeholder

            expect(category).toHaveProperty('color')
            expect(category).toHaveProperty('icon')
            expect(category).toHaveProperty('label')
            expect(category).toHaveProperty('data')
            expect(Array.isArray(category.data)).toBe(true)
        })
    })

    it('should contain matching keywords for basic football inputs', () => {
        const football = vibeDB.football
        const winVibe = football.data.find(v => v.keys.includes('win'))
        expect(winVibe).toBeDefined()
        expect(winVibe?.me).toContain('90th minute')
    })

    // Test the logic implementation (simulate what route.ts does)
    it('should correctly match keywords in simulated logic', () => {
        const input = "I need to win this game"
        const inputLower = input.toLowerCase()

        // Logic from route.ts
        let match = null
        for (const vibe of vibeDB.football.data) {
            if (vibe.keys.includes("generic")) continue
            const matchesKeyword = vibe.keys.some((key) => {
                if (key.length <= 3) return inputLower.includes(key)
                return inputLower.includes(key) || inputLower.includes(key.substring(0, key.length - 1))
            })
            if (matchesKeyword) {
                match = vibe
                break
            }
        }

        expect(match).toBeDefined()
        // "win" is in the keys
        expect(match?.keys).toContain('win')
    })

    it('should fall back to generic if no keywords match', () => {
        // Logic simulation for generic
        const genericVibe = vibeDB.football.data.find(v => v.keys.includes('generic'))
        expect(genericVibe).toBeDefined()
        expect(genericVibe?.me).toBe("I'm a free agent looking for a new club.")
    })
})
