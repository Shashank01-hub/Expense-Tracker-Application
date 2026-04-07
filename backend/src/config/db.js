import mongoose from 'mongoose'

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI
  const fallbackMongoUri = 'mongodb://127.0.0.1:27017/project01'
  const allowFallback = process.env.ALLOW_DB_FALLBACK === 'true'

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured')
  }

  try {
    await mongoose.connect(mongoUri)
  } catch (error) {
    if (!allowFallback || mongoUri === fallbackMongoUri) {
      throw error
    }

    await mongoose.connect(fallbackMongoUri)
  }
}
