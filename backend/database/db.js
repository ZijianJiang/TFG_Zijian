import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initDB() {
  const dbFilePath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : process.env.NODE_ENV === 'production'
      ? path.join('/tmp', 'content.db')
      : path.join(__dirname, "content.db")

  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      niche TEXT,
      audience TEXT,
      platform TEXT,
      goal TEXT,
      style TEXT,
      script TEXT,
      insights TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Ensure users table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // If the ideas table was created earlier without user_id, try to add the column (safe-guard)
  try {
    await db.exec(`ALTER TABLE ideas ADD COLUMN user_id INTEGER;`)
  } catch (e) {
    // ignore if column already exists or ALTER fails
  }

  return db
}