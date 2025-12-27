import { describe, it, expect, vi } from 'vitest'
import { POST } from './route'

// Mock the environment or specific imports if necessary
// But since vibe-db is a local file, we can let it resolve naturally or mock it if we want to isolate.
// For this test, integration with real vibe-db is fine as we want to test the whole flow.

describe('POST /api/translate', () => {
    it('should return 400 if required parameters are missing', async () => {
        const request = new Request('http://localhost:3000/api/translate', {
            method: 'POST',
            body: JSON.stringify({
                input: 'test',
                // missing category and perspective
            })
        })

        const response = await POST(request)
        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe("Missing required parameters")
    })

    it('should return a valid translation for a known football vibe', async () => {
        const request = new Request('http://localhost:3000/api/translate', {
            method: 'POST',
            body: JSON.stringify({
                input: 'I need to win this match',
                category: 'football',
                perspective: 'me'
            })
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.quote).toBeDefined()
        // Should match the 'win' key logic we fixed
        expect(data.quote).toContain("90th minute winner")
    })

    it('should return generic fallback for unknown inputs', async () => {
        const request = new Request('http://localhost:3000/api/translate', {
            method: 'POST',
            body: JSON.stringify({
                input: 'Something completely random 12345',
                category: 'football',
                perspective: 'me'
            })
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.quote).toContain("free agent")
    })
})
