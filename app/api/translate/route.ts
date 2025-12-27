export async function POST(request: Request) {
  try {
    const { input, category, perspective, modelId, apiKey } = await request.json()

    if (!input || !category || !perspective) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const { vibeDB } = await import("@/lib/vibe-db")
    const categoryData = vibeDB[category as keyof typeof vibeDB]

    let responseText = ""

    if (categoryData?.data) {
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
      const enhancedPrompt = `You are Vibr, a creative vibe translator. Generate a short, witty, one-liner response that translates the user's vibe/feeling into context-specific slang or metaphor for the ${category} category.

IMPORTANT: Your response MUST be directly related to what the user said. Use specific references from their input, not generic phrases.

The response should be:
- 1-2 sentences max
- Creative and funny, matching the ${category} culture/vibe
- In "${perspective === "me" ? "first person (I/me)" : "second person (you)"}}"
- Include specific metaphors or references related to "${category}"
- Directly address the feeling/situation: "${input}"

User's feeling: "${input}"
Respond ONLY with the translation, nothing else. Make it relevant to their specific vibe.`

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

    return Response.json({ quote: responseText.trim() || "Keep the energy flowing" })
  } catch (error) {
    console.error("[v0] Translation error:", error)
    return Response.json({ error: "Failed to generate translation", quote: "Keep the energy flowing" }, { status: 500 })
  }
}
