import bcrypt from 'bcryptjs'
import { Router } from 'express'
import { adminOnly, authRequired } from '../middleware/auth.js'
import { Transaction } from '../models/Transaction.js'
import { User } from '../models/User.js'

const router = Router()

router.get('/users', authRequired, adminOnly, async (_, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).lean()

    const activity = await Transaction.aggregate([
      {
        $group: {
          _id: '$userId',
          transactionCount: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          lastActivity: { $max: '$createdAt' },
        },
      },
    ])

    const activityMap = new Map(
      activity.map((item) => [item._id.toString(), item]),
    )

    return res.status(200).json({
      users: users.map((user) => {
        const userActivity = activityMap.get(user._id.toString())

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          transactionCount: userActivity?.transactionCount || 0,
          totalIncome: userActivity?.totalIncome || 0,
          totalExpense: userActivity?.totalExpense || 0,
          lastActivity: userActivity?.lastActivity || null,
        }
      }),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch users', error: error.message })
  }
})

router.get('/activity', authRequired, adminOnly, async (_, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalTransactions = await Transaction.countDocuments()
    const activeUsers = await Transaction.distinct('userId')

    const recentTransactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'name email')
      .lean()

    return res.status(200).json({
      summary: {
        totalUsers,
        totalTransactions,
        activeUsers: activeUsers.length,
      },
      recentTransactions: recentTransactions.map((item) => ({
        id: item._id.toString(),
        userId: item.userId?._id?.toString() || '',
        userName: item.userId?.name || 'Unknown',
        userEmail: item.userId?.email || 'Unknown',
        date: item.date,
        amount: item.amount,
        category: item.category,
        type: item.type,
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch activity', error: error.message })
  }
})

router.post('/users', authRequired, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' })
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be user or admin' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })

    if (existing) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    })

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Could not create user', error: error.message })
  }
})

router.delete('/users/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const targetUserId = req.params.id

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ message: 'Admin cannot remove their own account' })
    }

    const user = await User.findByIdAndDelete(targetUserId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await Transaction.deleteMany({ userId: targetUserId })

    return res.status(200).json({ message: 'User removed' })
  } catch (error) {
    return res.status(500).json({ message: 'Could not remove user', error: error.message })
  }
})

export default router