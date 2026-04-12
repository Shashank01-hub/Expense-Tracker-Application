import bcrypt from 'bcryptjs'
import { Transaction } from './models/Transaction.js'
import { User } from './models/User.js'

const demoAdmin = {
  name: 'Demo Admin',
  email: 'admin@example.com',
  password: 'Admin@12345',
  role: 'admin',
}

const demoTransactions = [
  {
    date: '2026-01-04',
    amount: 85000,
    category: 'Salary',
    type: 'income',
  },
  {
    date: '2026-01-06',
    amount: 2200,
    category: 'Groceries',
    type: 'expense',
  },
  {
    date: '2026-01-11',
    amount: 4500,
    category: 'Rent',
    type: 'expense',
  },
  {
    date: '2026-02-01',
    amount: 85000,
    category: 'Salary',
    type: 'income',
  },
  {
    date: '2026-02-13',
    amount: 5000,
    category: 'Investments',
    type: 'income',
  },
  {
    date: '2026-03-08',
    amount: 3900,
    category: 'Shopping',
    type: 'expense',
  },
]

export async function seedDatabase() {
  let admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })

  if (!admin) {
    admin = await User.findOne({ email: demoAdmin.email })
  }

  if (!admin) {
    const hashedPassword = await bcrypt.hash(demoAdmin.password, 10)
    admin = await User.create({
      ...demoAdmin,
      email: demoAdmin.email.toLowerCase(),
      password: hashedPassword,
    })
  }

  const existingTransactions = await Transaction.countDocuments({ userId: admin._id })

  if (existingTransactions === 0) {
    await Transaction.insertMany(
      demoTransactions.map((transaction) => ({
        ...transaction,
        userId: admin._id,
      })),
    )

    console.log(`Seeded ${demoTransactions.length} transactions for ${admin.email}`)
  }
}