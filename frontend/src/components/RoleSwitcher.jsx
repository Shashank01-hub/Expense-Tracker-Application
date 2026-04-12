import { useDashboard } from '../context/DashboardContext'
import { useAuth } from '../context/AuthContext'

export default function RoleSwitcher() {
  const { user, role, isDarkMode, setIsDarkMode } = useDashboard()
  const { logout } = useAuth()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <p className="font-semibold">{user?.name}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">{role}</p>
      </div>

      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Logout
      </button>
    </div>
  )
}
