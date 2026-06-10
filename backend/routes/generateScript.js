import express from "express"
import { generateContent } from "../services/openaiService.js"
import { streamContent } from "../services/openaiService.js"
import { buildPrompt } from "../prompts/scriptPrompt.js"

export default function generateScript(db){

  const router = express.Router()

  router.post("/", async (req, res) => {

    try {

      const prompt = buildPrompt(req.body)

      const result = await generateContent(prompt)

      // Try to associate with user if Authorization header present
      let userId = null
      try {
        const auth = req.headers.authorization
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.split(' ')[1]
          // lazy require jwt to avoid adding at top; package.json has dependency
          const jwt = await import('jsonwebtoken')
          const secret = process.env.JWT_SECRET || 'devsecret'
          const payload = jwt.verify(token, secret)
          if (payload && payload.id) userId = payload.id
        }
      } catch (e) {
        // invalid token — ignore and continue without user
        userId = null
      }

      await db.run(
        `INSERT INTO ideas (niche,audience,platform,goal,style,script,user_id)
         VALUES (?,?,?,?,?,?,?)`,
        [
          req.body.niche,
          req.body.audience,
          req.body.platform,
          req.body.goal,
          req.body.style,
          result,
          userId
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

  // Streaming endpoint: returns a text/event-stream-like streaming response
  router.post('/stream', async (req, res) => {
    try {
      // set headers for streaming plaintext (we'll use chunked responses)
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('X-Accel-Buffering', 'no')

      const prompt = buildPrompt(req.body)

      // write initial newline to open the stream in some clients
      res.write('\n')

      await streamContent(prompt, (chunk) => {
        // write chunks as they arrive
        try { res.write(chunk) } catch (e) { /* ignore write errors */ }
      })

      // end of stream
      res.end()

    } catch (error) {
      console.error('STREAM ERROR', error)
      try { res.status(500).json({ error: error.message }) } catch (e) { }
    }
  })

  // Save a provided script directly (requires auth)
  router.post('/save', async (req, res) => {
    try {
      const script = req.body.script
      if (!script) return res.status(400).json({ error: 'script required' })

      let userId = null
      try {
        const auth = req.headers.authorization
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.split(' ')[1]
          const jwt = await import('jsonwebtoken')
          const secret = process.env.JWT_SECRET || 'devsecret'
          const payload = jwt.verify(token, secret)
          if (payload && payload.id) userId = payload.id
        }
      } catch (e) {
        userId = null
      }

      await db.run(
        `INSERT INTO ideas (niche,audience,platform,goal,style,script,user_id)
         VALUES (?,?,?,?,?,?,?)`,
        [null, null, null, null, null, script, userId]
      )

      res.json({ ok: true })
    } catch (e) {
      console.error('SAVE ERROR', e)
      res.status(500).json({ error: 'internal' })
    }
  })

  return router
}