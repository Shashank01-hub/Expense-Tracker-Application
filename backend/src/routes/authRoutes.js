import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { authRequired } from '../middleware/auth.js'
import { User } from '../models/User.js'

const router = Router()

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, adminInviteCode } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })

    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const role =
      adminInviteCode && adminInviteCode === process.env.ADMIN_INVITE_CODE
        ? 'admin'
        : 'user'

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    })

    const token = createToken(user._id.toString())

    return res.status(201).json({ token, user: sanitizeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Could not register user', error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = createToken(user._id.toString())

    return res.status(200).json({ token, user: sanitizeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Could not login user', error: error.message })
  }
})

router.get('/me', authRequired, async (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) })
})

export default router
