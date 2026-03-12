import dotenv from "dotenv"
dotenv.config()

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateContent(prompt) {

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