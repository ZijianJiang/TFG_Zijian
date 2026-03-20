import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export default function authRoute(db){
  const router = express.Router()

  router.post('/register', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'username and password required' })

    try {
      const existing = await db.get('SELECT id FROM users WHERE username = ?', [username])
      if (existing) return res.status(409).json({ error: 'username exists' })

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)

      const result = await db.run('INSERT INTO users (username, password_hash) VALUES (?,?)', [username, hash])
      const userId = result.lastID || result.stmt && result.stmt.lastID

      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' })

      res.json({ token, username })
    } catch (error) {
      console.error('REGISTER ERROR', error)
      res.status(500).json({ error: 'internal error' })
    }
  })

  router.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'username and password required' })

    try {
      const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
      if (!user) return res.status(401).json({ error: 'invalid credentials' })

      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) return res.status(401).json({ error: 'invalid credentials' })

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
      res.json({ token, username: user.username })
    } catch (error) {
      console.error('LOGIN ERROR', error)
      res.status(500).json({ error: 'internal error' })
    }
  })

  // optional endpoint to verify token and return user info
  router.get('/me', async (req, res) => {
    const auth = req.headers.authorization
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'no token' })
    const token = auth.split(' ')[1]
    try {
      const data = jwt.verify(token, JWT_SECRET)
      res.json({ id: data.id, username: data.username })
    } catch (e) {
      res.status(401).json({ error: 'invalid token' })
    }
  })

  return router
}
