import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import generateScript from "./routes/generateScript.js"
import authRoute from "./routes/auth.js"
import { initDB } from "./database/db.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const db = await initDB()

app.use("/generate-script", generateScript(db))
app.use("/auth", authRoute(db))

app.listen(3000, () => {
  console.log("Server running on port 3000")
})