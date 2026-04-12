import { useState } from 'react'

const initialFormState = {
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  category: '',
  type: 'expense',
}

export default function AddTransactionModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(initialFormState)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) {
    return null
  }

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.category.trim() || !form.amount || Number(form.amount) <= 0) {
      return
    }

    setIsSaving(true)

    try {
      await onSubmit({
        ...form,
        category: form.category.trim(),
        amount: Number(form.amount),
      })

      setForm(initialFormState)
      onClose()
    } catch {
      // Error handling is shown by the parent dashboard.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Transaction</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Add a new income or expense item.</p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm text-slate-600 dark:text-slate-200">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateForm('date', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </label>

          <label className="block text-sm text-slate-600 dark:text-slate-200">
            Amount
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(event) => updateForm('amount', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Enter amount"
              required
            />
          </label>

          <label className="block text-sm text-slate-600 dark:text-slate-200">
            Category
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Food, Salary"
              required
            />
          </label>

          <label className="block text-sm text-slate-600 dark:text-slate-200">
            Type
            <select
              value={form.type}
              onChange={(event) => updateForm('type', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
