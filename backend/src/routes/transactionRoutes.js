import { Router } from 'express'
import { authRequired, userOnly } from '../middleware/auth.js'
import { Transaction } from '../models/Transaction.js'

const router = Router()

function toClientShape(transaction) {
  return {
    id: transaction._id.toString(),
    date: transaction.date,
    amount: transaction.amount,
    category: transaction.category,
    type: transaction.type,
  }
}

router.get('/', authRequired, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1, createdAt: -1 })
    return res.status(200).json({ transactions: transactions.map(toClientShape) })
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch transactions', error: error.message })
  }
})

router.post('/', authRequired, userOnly, async (req, res) => {
  try {
    const { date, amount, category, type } = req.body

    if (!date || !amount || !category || !type) {
      return res.status(400).json({ message: 'date, amount, category, and type are required' })
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'type must be income or expense' })
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      date,
      amount: Number(amount),
      category: String(category).trim(),
      type,
    })

    return res.status(201).json({ transaction: toClientShape(transaction) })
  } catch (error) {
    return res.status(500).json({ message: 'Could not create transaction', error: error.message })
  }
})

router.delete('/:id', authRequired, userOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    return res.status(200).json({ message: 'Transaction deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete transaction', error: error.message })
  }
})

export default router
