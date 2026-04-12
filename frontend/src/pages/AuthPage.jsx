import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const initialRegisterState = {
  name: '',
  email: '',
  password: '',
  adminInviteCode: '',
}

const initialLoginState = {
  email: '',
  password: '',
}

export default function AuthPage() {
  const { register, login } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registerForm, setRegisterForm] = useState(initialRegisterState)
  const [loginForm, setLoginForm] = useState(initialLoginState)

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register({
        ...registerForm,
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
      })
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isRegisterMode = mode === 'register'

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">Project01</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {isRegisterMode ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isRegisterMode
            ? 'Register as a user. Admin role requires a valid admin invite code.'
            : 'Login to access your finance dashboard.'}
        </p>

        <div className="mt-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              !isRegisterMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isRegisterMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Register
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {isRegisterMode ? (
          <form className="mt-4 space-y-3" onSubmit={handleRegisterSubmit}>
            <input
              type="text"
              value={registerForm.name}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="Full name"
              required
            />
            <input
              type="email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="Password (min 6 chars)"
              minLength={6}
              required
            />
            <input
              type="text"
              value={registerForm.adminInviteCode}
              onChange={(event) =>
                setRegisterForm((prev) => ({ ...prev, adminInviteCode: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="Admin invite code (optional)"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </form>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={handleLoginSubmit}>
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="Password"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
