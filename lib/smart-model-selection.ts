/**
 * Intelligent model selection based on prompt characteristics
 */

export interface Model {
    id: string
    name: string
    provider: string
    logo: string
}

export const AVAILABLE_MODELS: Model[] = [
    { id: "openai", name: "GPT-4o", provider: "OpenAI", logo: "🔷" },
    { id: "anthropic", name: "Claude 3.5 Sonnet", provider: "Anthropic", logo: "🤖" },
    { id: "google", name: "Gemini 2.0", provider: "Google", logo: "🔍" },
    { id: "groq", name: "Llama 3.3 70B", provider: "Groq", logo: "⚡" },
    { id: "huggingface", name: "Llama 3.2", provider: "HF", logo: "🤗" },
]

/**
 * Intelligently selects the best model based on prompt characteristics
 * @param prompt - The user's input prompt
 * @param category - The selected category
 * @returns The recommended model ID
 */
export function selectBestModel(prompt: string, category: string): string {
    const promptLength = prompt.length
    const hasComplexity = /[,;:]/.test(prompt) || prompt.split(' ').length > 10

    // Groq (Llama 3.3) - Best for fast, savage responses
    // Great for short, punchy roasts
    if (promptLength < 50 && category !== 'career') {
        return 'groq'
    }

    // Claude - Best for nuanced, detailed responses
    // Excellent for complex situations
    if (hasComplexity || promptLength > 100) {
        return 'anthropic'
    }

    // GPT-4o - Balanced, creative responses
    // Good for relationship and emotional contexts
    if (category === 'relationship' || category === 'career') {
        return 'openai'
    }

    // Gemini - Good for factual, straightforward responses
    if (category === 'money' || category === 'education') {
        return 'google'
    }

    // Default to Groq for speed and quality
    return 'groq'
}

/**
 * Gets the model display name
 */
export function getModelDisplayName(modelId: string): string {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId)
    return model ? `${model.logo} ${model.name}` : 'Auto'
}
