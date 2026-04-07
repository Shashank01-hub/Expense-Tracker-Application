export default function SummaryCard({ title, value, tone }) {
  const toneStyles = {
    balance:
      'from-cyan-100 via-white to-sky-50 text-slate-900 dark:from-cyan-950 dark:via-slate-900 dark:to-slate-900 dark:text-cyan-100',
    income:
      'from-emerald-100 via-white to-emerald-50 text-slate-900 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 dark:text-emerald-100',
    expenses:
      'from-rose-100 via-white to-rose-50 text-slate-900 dark:from-rose-950 dark:via-slate-900 dark:to-slate-900 dark:text-rose-100',
  }

  return (
    <article
      className={`rounded-2xl border border-white/40 bg-linear-to-br p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 ${toneStyles[tone]}`}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{value}</h3>
    </article>
  )
}
