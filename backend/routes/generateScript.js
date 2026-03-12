import express from "express"
import { generateContent } from "../services/openaiService.js"
import { buildPrompt } from "../prompts/scriptPrompt.js"

export default function generateScript(db){

  const router = express.Router()

  router.post("/", async (req, res) => {

    try {

      const prompt = buildPrompt(req.body)

      const result = await generateContent(prompt)

      await db.run(
        `INSERT INTO ideas (niche,audience,platform,goal,style,script)
         VALUES (?,?,?,?,?,?)`,
        [
          req.body.niche,
          req.body.audience,
          req.body.platform,
          req.body.goal,
          req.body.style,
          result
        ]
      )

      res.json({
        script: result
      })

    } catch (error) {
      console.error("ERROR:", error)
      res.status(500).json({
        error: error.message
      })
    }
  })

  return router
}