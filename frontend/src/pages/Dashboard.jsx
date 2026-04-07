import { useMemo, useState } from 'react'
import AdminPanel from '../components/AdminPanel'
import AddTransactionModal from '../components/AddTransactionModal'
import Charts from '../components/Charts'
import Insights from '../components/Insights'
import RoleSwitcher from '../components/RoleSwitcher'
import SummaryCard from '../components/SummaryCard'
import TransactionTable from '../components/TransactionTable'
import { useDashboard } from '../context/DashboardContext'

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Dashboard() {
  const { role, totals, addTransaction, loadingTransactions, requestError } = useDashboard()
  const isAdmin = role === 'admin'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Keep card config memoized to avoid recreating on every render.
  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Balance',
        value: formatMoney(totals.balance),
        tone: 'balance',
      },
      {
        title: 'Total Income',
        value: formatMoney(totals.income),
        tone: 'income',
      },
      {
        title: 'Total Expenses',
        value: formatMoney(totals.expenses),
        tone: 'expenses',
      },
    ],
    [totals],
  )

  const handleAddTransaction = async (payload) => {
    setSubmitError('')

    try {
      await addTransaction(payload)
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-300">
            Finance Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Money at a glance
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Monitor cash flow, track spending, and review transaction insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RoleSwitcher />
          {!isAdmin ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Add Transaction
            </button>
          ) : null}
        </div>
      </header>

      {isAdmin ? (
        <section className="mt-6">
          <AdminPanel />
        </section>
      ) : (
        <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((item) => (
              <SummaryCard
                key={item.title}
                title={item.title}
                value={item.value}
                tone={item.tone}
              />
            ))}
          </section>

          <section className="mt-6 space-y-6">
            {requestError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {requestError}
              </div>
            ) : null}
            {submitError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}
            {loadingTransactions ? (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Loading transactions...
              </div>
            ) : null}
            <Charts />
            <Insights />
            <TransactionTable />
          </section>

          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddTransaction}
          />
        </>
      )}
    </main>
  )
}
