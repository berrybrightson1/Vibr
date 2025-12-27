export async function POST(request: Request) {
  try {
    const { input, category, perspective, modelId, apiKey } = await request.json()

    if (!input || !category || !perspective) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const { vibeDB } = await import("@/lib/vibe-db")
    const { contributeStore } = await import("@/lib/contribute-store")
    const categoryData = vibeDB[category as keyof typeof vibeDB]

    let responseText = ""

    // First check user contributions
    const userContributions = contributeStore.getContributionsByCategory(category)
    if (userContributions.length > 0) {
      // Simple random selection from contributions
      responseText = userContributions[Math.floor(Math.random() * userContributions.length)]
    }

    // If no contribution match, check vibeDB
    if (!responseText && categoryData?.data) {
      const inputLower = input.toLowerCase()

      for (const vibe of categoryData.data) {
        if (vibe.keys.includes("generic")) continue

        const matchesKeyword = vibe.keys.some((key) => {
          if (key.length <= 3) return inputLower.includes(key)
          return inputLower.includes(key) || inputLower.includes(key.substring(0, key.length - 1))
        })

        if (matchesKeyword) {
          responseText = perspective === "me" ? vibe.me : vibe.you
          break
        }
      }
    }

    if (!responseText && modelId && apiKey) {
      // Anti-repetition: Load previous responses from session
      const sessionKey = `vibr_history_${category}`
      const previousResponses = typeof sessionStorage !== 'undefined'
        ? JSON.parse(sessionStorage.getItem(sessionKey) || '[]')
        : []

      const enhancedPrompt = `You are Vibr, a thoughtful vibe translator specializing in ${category}. Generate mindful, advice-based responses that translate the user's feeling/relationship/experience into insightful wisdom.

IMPORTANT STYLE GUIDELINES - Your responses should be:
- Thoughtful and advisory (not just witty/funny)
- 1-2 sentences max
- In "${perspective === "me" ? "first person (I/me)" : "second person (you)"}" perspective
- Describe feelings, relationships, or experiences in ${category} terms
- Directly relevant to: "${input}"

EXAMPLES OF THE TONE (for football category):
- "Always check the medicals before signing. Some injuries aren't visible on the pitch."
- "Be careful of football players who have played for many teams within a short period of time"
- "Leave the football before the football leaves you."
- "Another team recommended this player and there's rumours that she will sign for the club in the January transfer window."
- "After scoring hat trick and giving 2 assist she gave another person man of the match"
- "Currently scouting the youth talent 👍"

CRITICAL: You must generate a UNIQUE response. DO NOT use any of these previous responses:
${previousResponses.length > 0 ? previousResponses.map((r: string) => `- "${r}"`).join('\n') : '(No previous responses yet)'}

Your response should follow this mindful, advisory style. Make it specific to their situation and provide genuine insight about their feeling/relationship/experience.

User's feeling: "${input}"
Category: ${category}

Respond ONLY with the translation, nothing else.`

      try {
        if (modelId === "openai") {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: enhancedPrompt }],
              temperature: 0.85,
              max_tokens: 100,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            responseText = data.choices[0]?.message?.content?.trim() || ""
          }
        } else if (modelId === "anthropic") {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
              "anthropic-version": "2023-06-01",
            },
            method: "POST",
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 100,
              messages: [{ role: "user", content: enhancedPrompt }],
            }),
          })

          if (response.ok) {
            const data = await response.json()
            responseText = data.content[0]?.text?.trim() || ""
          }
        } else if (modelId === "google") {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
              headers: { "Content-Type": "application/json" },
              method: "POST",
              body: JSON.stringify({
                contents: [{ parts: [{ text: enhancedPrompt }] }],
                generationConfig: { temperature: 0.85, maxOutputTokens: 100 },
              }),
            },
          )

          if (response.ok) {
            const data = await response.json()
            responseText = data.candidates[0]?.content?.parts[0]?.text?.trim() || ""
          }
        } else if (modelId === "groq") {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: enhancedPrompt }],
              temperature: 0.85,
              max_tokens: 100,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            responseText = data.choices[0]?.message?.content?.trim() || ""
          }
        }
      } catch (err) {
        console.error("[v0] Custom model error:", err)
      }
    }

    if (!responseText && categoryData?.data) {
      const genericVibe = categoryData.data.find((v) => v.keys.includes("generic"))
      if (genericVibe) {
        responseText = perspective === "me" ? genericVibe.me : genericVibe.you
      }
    }

    // Save to session history to prevent repetition
    if (responseText && typeof sessionStorage !== 'undefined') {
      const sessionKey = `vibr_history_${category}`
      const history = JSON.parse(sessionStorage.getItem(sessionKey) || '[]')
      if (!history.includes(responseText)) {
        history.push(responseText)
        // Keep only last 20 responses
        if (history.length > 20) history.shift()
        sessionStorage.setItem(sessionKey, JSON.stringify(history))
      }
    }

    return Response.json({ quote: responseText.trim() || "Keep the energy flowing" })
  } catch (error) {
    console.error("[v0] Translation error:", error)
    return Response.json({ error: "Failed to generate translation", quote: "Keep the energy flowing" }, { status: 500 })
  }
}
