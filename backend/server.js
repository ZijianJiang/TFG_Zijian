import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import generateScript from "./routes/generateScript.js"
import authRoute from "./routes/auth.js"
import { initDB } from "./database/db.js"

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendDir = path.resolve(__dirname, "../frontend")
const port = Number(process.env.PORT) || 3000
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL, process.env.PUBLIC_URL]
    .filter(Boolean)
    .map((value) => String(value).replace(/\/$/, ''))
)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.size === 0 || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  }
}))
app.use(express.json())

const db = await initDB()

app.use("/generate-script", generateScript(db))
app.use("/auth", authRoute(db))

// Serve the static frontend from the same origin in production deployments.
app.use(express.static(frontendDir))

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendDir, "pages", "home.html"))
})

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})