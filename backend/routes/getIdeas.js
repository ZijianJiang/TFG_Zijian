import express from "express"

const router = express.Router()

router.get("/", async (req,res) => {

  const ideas = await db.all(`SELECT * FROM ideas ORDER BY created_at DESC`)

  res.json(ideas)

})

export default router