import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../config/api'
import { useAuth } from '../context/AuthContext'

function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value) {
  if (!value) {
    return 'No activity'
  }

  return new Date(value).toLocaleString('en-IN')
}

const initialUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
}

export default function AdminPanel() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState([])
  const [activity, setActivity] = useState([])
  const [summary, setSummary] = useState({ totalUsers: 0, totalTransactions: 0, activeUsers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialUserForm)
  const [isSaving, setIsSaving] = useState(false)

  const userMap = useMemo(() => {
    return new Map(users.map((item) => [item.id, item]))
  }, [users])

  const loadAdminData = useCallback(async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const [usersResponse, activityResponse] = await Promise.all([
        fetch(apiUrl('/api/admin/users'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(apiUrl('/api/admin/activity'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      const usersPayload = await usersResponse.json().catch(() => ({}))
      const activityPayload = await activityResponse.json().catch(() => ({}))

      if (!usersResponse.ok) {
        throw new Error(usersPayload.message || 'Could not fetch users')
      }

      if (!activityResponse.ok) {
        throw new Error(activityPayload.message || 'Could not fetch activity')
      }

      setUsers(usersPayload.users || [])
      setSummary(activityPayload.summary || { totalUsers: 0, totalTransactions: 0, activeUsers: 0 })
      setActivity(activityPayload.recentTransactions || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  const createUser = async (event) => {
    event.preventDefault()

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(apiUrl('/api/admin/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message || 'Could not create user')
      }

      setForm(initialUserForm)
      await loadAdminData()
    } catch (createError) {
      setError(createError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const removeUser = async (userId) => {
    setError('')

    try {
      const response = await fetch(apiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message || 'Could not remove user')
      }

      await loadAdminData()
    } catch (removeError) {
      setError(removeError.message)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin Control Center</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          Admin accounts can monitor user activity and manage user accounts. Transaction updates are disabled for admins.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">Total Users</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{summary.totalUsers}</h3>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">Total Transactions</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{summary.totalTransactions}</h3>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">Active Users</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{summary.activeUsers}</h3>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add User</h3>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createUser}>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Password"
            minLength={6}
            required
          />
          <select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-cyan-200 focus:ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Users</h3>

        {loading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No users found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  <th className="px-2 py-3">Name</th>
                  <th className="px-2 py-3">Email</th>
                  <th className="px-2 py-3">Role</th>
                  <th className="px-2 py-3">Transactions</th>
                  <th className="px-2 py-3">Last Activity</th>
                  <th className="px-2 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-3 text-slate-800 dark:text-slate-100">{item.name}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{item.email}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{item.role}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{item.transactionCount}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{formatDateTime(item.lastActivity)}</td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() => removeUser(item.id)}
                        disabled={item.id === user?.id}
                        className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent User Activity</h3>

        {loading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Loading activity...</p>
        ) : activity.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No user activity found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  <th className="px-2 py-3">User</th>
                  <th className="px-2 py-3">Category</th>
                  <th className="px-2 py-3">Type</th>
                  <th className="px-2 py-3">Amount</th>
                  <th className="px-2 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-3 text-slate-800 dark:text-slate-100">
                      {userMap.get(item.userId)?.name || item.userName}
                    </td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{item.category}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{item.type}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{formatMoney(item.amount)}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
