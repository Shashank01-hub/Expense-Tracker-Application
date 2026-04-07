import { useDashboard } from '../context/DashboardContext'
import { useState } from 'react'

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function TransactionTable() {
  const [actionError, setActionError] = useState('')
  const {
    role,
    filters,
    updateFilters,
    filteredTransactions,
    deleteTransaction,
    transactions,
  } = useDashboard()

  const handleDelete = async (id) => {
    setActionError('')

    try {
      await deleteTransaction(id)
    } catch (error) {
      setActionError(error.message)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transactions</h2>

        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder="Search category"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <select
            value={filters.type}
            onChange={(event) => updateFilters({ type: event.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(event) => updateFilters({ sortBy: event.target.value })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          <button
            type="button"
            onClick={() =>
              updateFilters({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>
      </div>

      {actionError ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      {!transactions.length ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
          No transactions found. Add a transaction to get started.
        </div>
      ) : !filteredTransactions.length ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
          No results match your current search and filters.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300">
                <th className="px-2 py-3 font-medium">Date</th>
                <th className="px-2 py-3 font-medium">Amount</th>
                <th className="px-2 py-3 font-medium">Category</th>
                <th className="px-2 py-3 font-medium">Type</th>
                {role === 'user' ? <th className="px-2 py-3 font-medium">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 text-slate-700 dark:border-slate-800 dark:text-slate-100"
                >
                  <td className="px-2 py-3">{item.date}</td>
                  <td className="px-2 py-3 font-semibold">{formatMoney(item.amount)}</td>
                  <td className="px-2 py-3">{item.category}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/70 dark:text-rose-200'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {role === 'user' ? (
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        Delete
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
