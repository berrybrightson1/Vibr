import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResultContent } from './result-content'

// Mock Next.js navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => ({
        get: (key: string) => {
            if (key === 'quote') return 'Test Vibe Quote'
            if (key === 'category') return 'football'
            if (key === 'perspective') return 'me'
            if (key === 'input') return 'I wan win'
            return null
        }
    })
}))

// Mock html2canvas
vi.mock('html2canvas', () => ({
    default: vi.fn(() => Promise.resolve({
        toDataURL: () => 'data:image/jpeg;base64,fakeimage'
    }))
}))

// Mock navigator.share and clipboard
const mockShare = vi.fn()
const mockWriteText = vi.fn()
Object.assign(navigator, {
    share: mockShare,
    clipboard: {
        writeText: mockWriteText
    }
})

// Mock global fetch for "Shuffle" (Next Vibe)
global.fetch = vi.fn()

describe('ResultContent', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the quote and category correctly', () => {
        render(<ResultContent />)
        expect(screen.getByText('"Test Vibe Quote"')).toBeDefined()
        expect(screen.getByText('Football Vibes')).toBeDefined()
    })

    it('handles Download button click', async () => {
        render(<ResultContent />)
        // Download button has specific text "Download Now" inside a span, and is the last button on the page usually (or in the action block).
        // The previous failure was likely due to ambiguous text or structure.
        // Let's find the button by its unique class combo "bg-green-500" or just get all buttons and pick the last one.

        // Safer: Get button containing text "Download Now"
        // The error was likely "TestingLibraryElementError: Unable to find an element with the text: /Download Now/i" if simple, or "Found multiple elements".
        // Let's use getAllByText and pick the one inside a button.

        const downloadTexts = screen.getAllByText(/Download Now/i)
        const downloadBtn = downloadTexts.find(el => el.closest('button'))?.closest('button')

        expect(downloadBtn).toBeDefined()
        if (downloadBtn) {
            // Prevent default submit if any
            fireEvent.click(downloadBtn)
        }

        // Increase timeout or just check if it was called eventually
        await waitFor(() => {
            const html2canvas = require('html2canvas').default
            expect(html2canvas).toHaveBeenCalled()
        }, { timeout: 3000 })
    })

    it('handles Share button click (calls navigator.share)', async () => {
        // Buttons are: Back, Previous, Next, Share
        // Share is the 3rd button in the action row diff from navigation
        // Let's rely on the svg icon class "lucide-share-2" if possible, or just index in the action container.
        // The action container has 3 buttons: Prev, Next, Share.
        // Download is separate.

        render(<ResultContent />)

        // Find the container with 3 buttons
        const actionContainer = screen.getByText('Next Vibe').closest('div')?.parentElement
        const buttons = actionContainer?.querySelectorAll('button')
        // buttons[0] = Prev, buttons[1] = Next, buttons[2] = Share
        const shareBtn = buttons?.[2]

        expect(shareBtn).toBeDefined()
        if (shareBtn) fireEvent.click(shareBtn)

        await waitFor(() => {
            expect(mockShare).toHaveBeenCalled()
        })
    })

    it('handles Shuffle (Next Vibe) button click', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ quote: "New Vibe Quote" })
        })

        render(<ResultContent />)
        const nextBtn = screen.getByText('Next Vibe')
        fireEvent.click(nextBtn)

        expect(screen.getByText('Generating...')).toBeDefined()

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/translate', expect.any(Object))
            expect(screen.getByText('"New Vibe Quote"')).toBeDefined()
        })
    })
})
