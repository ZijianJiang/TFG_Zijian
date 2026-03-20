import dotenv from "dotenv"
dotenv.config()

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateContent(prompt) {

  // 👉 MODO GRATIS (DEV)
  if (process.env.MODE === "dev") {
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
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })

  return response.choices[0].message.content
}