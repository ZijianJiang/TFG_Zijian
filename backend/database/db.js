import sqlite3 from "sqlite3"
import { open } from "sqlite"

export async function initDB() {

  const db = await open({
    filename: "./database/content.db",
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return db
}