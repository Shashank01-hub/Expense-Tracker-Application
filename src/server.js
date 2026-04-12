import dns from 'node:dns'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { connectDatabase } from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'

dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5000
const isProduction = process.env.NODE_ENV === 'production'
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production')
}

if (isProduction) {
  app.set('trust proxy', 1)
}

app.use(
  cors({
    origin: frontendOrigin.split(',').map((origin) => origin.trim()),
  }),
)
app.use(helmet())
app.use(express.json())

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 50 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, try again later' },
})

app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRateLimiter, authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/admin', adminRoutes)

app.use('/api', (_, res) => {
  res.status(404).json({ message: 'API route not found' })
})

app.use((error, _, res, __) => {
  const response = { message: 'Unexpected server error' }

  if (!isProduction) {
    response.error = error.message
  }

  res.status(500).json(response)
})

async function startServer() {
  try {
    await connectDatabase()

    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
}

startServer()
