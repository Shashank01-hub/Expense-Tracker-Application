import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../config/api'
import { useAuth } from './AuthContext'

const DashboardContext = createContext(null)

const THEME_STORAGE_KEY = 'finance-dashboard-theme'

const defaultFilters = {
  search: '',
  type: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
}

function formatMonth(dateValue) {
  const date = new Date(dateValue)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function DashboardProvider({ children }) {
  const { token, user, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [requestError, setRequestError] = useState('')

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
  })

  const [filters, setFilters] = useState(defaultFilters)

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const fetchTransactions = useCallback(async () => {
    if (!token) {
      setTransactions([])
      return
    }

    setLoadingTransactions(true)
    setRequestError('')

    try {
      const response = await fetch(apiUrl('/api/transactions'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message || 'Could not fetch transactions')
      }

      setTransactions(payload.transactions || [])
    } catch (error) {
      setRequestError(error.message)
      setTransactions([])
    } finally {
      setLoadingTransactions(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated) {
      setTransactions([])
      setRequestError('')
      setLoadingTransactions(false)
      return
    }

    fetchTransactions()
  }, [fetchTransactions, isAuthenticated])

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)

    const expenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }, [transactions])

  const trendData = useMemo(() => {
    const sortedByDate = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    )

    let runningBalance = 0

    return sortedByDate.map((item) => {
      // Build cumulative balance per date for the trend chart.
      runningBalance += item.type === 'income' ? item.amount : -item.amount
      return {
        date: item.date,
        balance: runningBalance,
      }
    })
  }, [transactions])

  const categoryData = useMemo(() => {
    const categoryTotals = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount
        return acc
      }, {})

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const searched = transactions.filter((item) => {
      const matchesSearch = item.category
        .toLowerCase()
        .includes(filters.search.toLowerCase())
      const matchesType = filters.type === 'all' || item.type === filters.type
      return matchesSearch && matchesType
    })

    return searched.sort((a, b) => {
      if (filters.sortBy === 'date') {
        const compareValue = new Date(a.date) - new Date(b.date)
        return filters.sortOrder === 'asc' ? compareValue : -compareValue
      }

      const compareValue = a.amount - b.amount
      return filters.sortOrder === 'asc' ? compareValue : -compareValue
    })
  }, [transactions, filters])

  const insights = useMemo(() => {
    const highestSpendingCategory = categoryData[0] || null
    const expenseToIncomeRatio = totals.income
      ? ((totals.expenses / totals.income) * 100).toFixed(1)
      : '0.0'

    const monthlyExpenses = transactions
      .filter((item) => item.type === 'expense')
      .reduce((acc, item) => {
        const month = formatMonth(item.date)
        acc[month] = (acc[month] || 0) + item.amount
        return acc
      }, {})

    const months = Object.keys(monthlyExpenses).sort()
    const latestMonth = months[months.length - 1]
    const previousMonth = months[months.length - 2]

    const latestValue = latestMonth ? monthlyExpenses[latestMonth] : 0
    const previousValue = previousMonth ? monthlyExpenses[previousMonth] : 0

    const monthlySpendingChange = previousValue
      ? (((latestValue - previousValue) / previousValue) * 100).toFixed(1)
      : '0.0'

    return {
      highestSpendingCategory,
      expenseToIncomeRatio,
      monthlySpendingChange,
      latestMonth,
      previousMonth,
    }
  }, [transactions, categoryData, totals])

  const addTransaction = async (payload) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(apiUrl('/api/transactions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Could not add transaction')
    }

    setTransactions((prev) => [data.transaction, ...prev])
  }

  const deleteTransaction = async (id) => {
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(apiUrl(`/api/transactions/${id}`), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Could not delete transaction')
    }

    setTransactions((prev) => prev.filter((item) => item.id !== id))
  }

  const updateFilters = (partialFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...partialFilters,
    }))
  }

  const value = {
    role: user?.role || 'user',
    user,
    isDarkMode,
    setIsDarkMode,
    transactions,
    loadingTransactions,
    requestError,
    totals,
    trendData,
    categoryData,
    insights,
    filters,
    filteredTransactions,
    updateFilters,
    refreshTransactions: fetchTransactions,
    addTransaction,
    deleteTransaction,
  }

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)

  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }

  return context
}
