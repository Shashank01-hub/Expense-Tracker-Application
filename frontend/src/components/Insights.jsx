import { useDashboard } from '../context/DashboardContext'

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function Insights() {
  const { insights, totals } = useDashboard()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Insights</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-300">Highest Spending Category</p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {insights.highestSpendingCategory
              ? `${insights.highestSpendingCategory.name} (${formatMoney(insights.highestSpendingCategory.value)})`
              : 'No spending data'}
          </p>
        </article>

        <article className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-300">Expenses vs Income</p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {formatMoney(totals.expenses)} is {insights.expenseToIncomeRatio}% of income
          </p>
        </article>

        <article className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-300">Monthly Spending Change</p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {insights.previousMonth
              ? `${insights.monthlySpendingChange}% vs previous month`
              : 'Not enough month-over-month data'}
          </p>
        </article>
      </div>
    </section>
  )
}
