import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { authRequired } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { sendVerificationCodeEmail } from '../utils/email.js'

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
    isEmailVerified: user.isEmailVerified,
  }
}

function createVerificationCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0')
}

async function storeVerificationCode(user, code) {
  const hashedCode = await bcrypt.hash(code, 10)
  user.emailVerificationCodeHash = hashedCode
  user.emailVerificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()
}

async function issueVerificationCode(user) {
  const code = createVerificationCode()
  await storeVerificationCode(user, code)
  await sendVerificationCodeEmail({
    to: user.email,
    name: user.name,
    code,
  })
}

function matchesAdminInviteCode(adminInviteCode) {
  const providedCode = String(adminInviteCode || '').trim()
  const expectedCode = String(process.env.ADMIN_INVITE_CODE || '').trim()

  return Boolean(providedCode && expectedCode && providedCode === expectedCode)
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
    const role = matchesAdminInviteCode(adminInviteCode) ? 'admin' : 'user'

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isEmailVerified: false,
    })

    await issueVerificationCode(user)

    return res.status(201).json({
      message: 'Verification code sent to your email',
      requiresVerification: true,
      email: user.email,
    })
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

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      })
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

router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isEmailVerified) {
      const token = createToken(user._id.toString())
      return res.status(200).json({ token, user: sanitizeUser(user), message: 'Email already verified' })
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationCodeExpiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' })
    }

    if (user.emailVerificationCodeExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' })
    }

    const validCode = await bcrypt.compare(String(otp).trim(), user.emailVerificationCodeHash)

    if (!validCode) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    user.isEmailVerified = true
    user.emailVerificationCodeHash = null
    user.emailVerificationCodeExpiresAt = null
    await user.save()

    const token = createToken(user._id.toString())

    return res.status(200).json({ token, user: sanitizeUser(user), message: 'Email verified successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Could not verify email', error: error.message })
  }
})

router.post('/resend-verification-code', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' })
    }

    await issueVerificationCode(user)

    return res.status(200).json({ message: 'Verification code resent to your email' })
  } catch (error) {
    return res.status(500).json({ message: 'Could not resend verification code', error: error.message })
  }
})

export default router
