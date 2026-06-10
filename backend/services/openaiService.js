import dotenv from "dotenv"
dotenv.config()

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const isDevMode = process.env.DEV_MODE === "true"

function contentToText(content) {
  if (content == null) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => contentToText(part))
      .filter(Boolean)
      .join('')
  }
  if (typeof content === 'object') {
    if (typeof content.text === 'string') return content.text
    if (typeof content.content === 'string') return content.content
    if (typeof content.value === 'string') return content.value
    const seen = new Set()
    const walk = (value) => {
      if (value == null) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'number' || typeof value === 'boolean') return ''
      if (Array.isArray(value)) {
        return value.map(walk).filter(Boolean).join('')
      }
      if (typeof value === 'object') {
        if (seen.has(value)) return ''
        seen.add(value)
        return Object.values(value).map(walk).filter(Boolean).join('')
      }
      return ''
    }
    const nested = walk(content)
    if (nested) return nested
  }
  return ''
}

export async function generateContent(prompt) {

  // 👉 MODO GRATIS (DEV)
  if (isDevMode) {
    return `
HOOK: Stop scrolling right now

SCRIPT:
Here are 3 mistakes you're making...

VISUALS:
Fast cuts, subtitles

CTA:
Follow for more

TITLE:
3 mistakes you must fix

HASHTAGS:
#viral #tiktok #growth
    `
  }

  // 👉 MODO REAL (PROD)
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY en el entorno")
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })

  return contentToText(response.choices?.[0]?.message?.content)
}

// Stream content token-by-token. onToken is called with string chunks.
export async function streamContent(prompt, onToken) {
  // DEV mode: simulate streaming by emitting chunks with small delays
  if (isDevMode) {
    const text = await generateContent(prompt)
    // Split into word-like tokens (keep trailing spaces) for more realistic streaming
    const parts = text.match(/\S+\s*/g) || [text]

    // helper to pick random int in range
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    let i = 0
    while (i < parts.length) {
      // group 1-3 words to approximate token grouping
      const groupSize = randInt(1, 3)
      const slice = parts.slice(i, i + groupSize).join('')
      i += groupSize
      onToken(slice)

      // base delay: 20-120ms
      let delay = randInt(20, 120)
      // longer pause after sentence-ending punctuation
      if (/[\.\?!]["']?\s*$/.test(slice)) delay += 220
      // moderate pause after comma
      else if (/,\s*$/.test(slice)) delay += 80

      await new Promise(r => setTimeout(r, delay))
    }
    return
  }

  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  })

  try {
    for await (const part of stream) {
      // structure varies by SDK; try common locations
      const delta = part.choices && part.choices[0] && (part.choices[0].delta || part.choices[0].message)
      if (!delta) continue
      const chunk = contentToText(delta.content ?? delta)
      if (chunk) onToken(chunk)
    }
  } catch (e) {
    // if streaming fails, fallback to full response
    const full = await generateContent(prompt)
    onToken(full)
  }
}