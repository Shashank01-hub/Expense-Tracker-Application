import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const initialRegisterState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',   // ✅ added
  adminInviteCode: '',
}

const initialVerifyState = {
  otp: '',
}

const initialLoginState = {
  email: '',
  password: '',
}

export default function AuthPage() {
  const { register, login, verifyEmail, resendVerificationCode } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registerForm, setRegisterForm] = useState(initialRegisterState)
  const [loginForm, setLoginForm] = useState(initialLoginState)
  const [verifyForm, setVerifyForm] = useState(initialVerifyState)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (registerForm.password !== registerForm.confirmPassword) {
  setError("Passwords do not match")
  return
}
    setIsSubmitting(true)

    try {
      const data = await register({
        ...registerForm,
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
      })

      setVerificationEmail(data.email || registerForm.email.trim())
      setVerifyForm(initialVerifyState)
      setMode('verify')
      setMessage(data.message || 'Verification code sent to your email')
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      await login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })
    } catch (submissionError) {
      if (submissionError.status === 403 && submissionError.data?.requiresVerification) {
        setVerificationEmail(submissionError.data.email || loginForm.email.trim())
        setVerifyForm(initialVerifyState)
        setMode('verify')
        setMessage('Your email is not verified yet. Enter the code we sent you.')
        setError('')
      } else {
        setError(submissionError.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifySubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      await verifyEmail({
        email: verificationEmail,
        otp: verifyForm.otp.trim(),
      })
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const data = await resendVerificationCode({ email: verificationEmail })
      setMessage(data.message || 'Verification code resent')
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isRegisterMode = mode === 'register'
  const isVerifyMode = mode === 'verify'
  const isLoginMode = mode === 'login'

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">Project01</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {isVerifyMode ? 'Verify your email' : isRegisterMode ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isVerifyMode
            ? 'Enter the OTP sent to your email to activate your account.'
            : isRegisterMode
            ? 'Register as a user. Admin role requires a valid admin invite code.'
            : 'Login to access your finance dashboard.'}
        </p>

        <div className="mt-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
              setMessage('')
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isLoginMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
              setMessage('')
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isRegisterMode || isVerifyMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
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

        {message ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {isVerifyMode ? (
          <form className="mt-4 space-y-3" onSubmit={handleVerifySubmit}>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Verify {verificationEmail || 'your email'}</p>
              <p className="mt-1">Enter the 6-digit code sent to your inbox.</p>
            </div>
            <input
              type="text"
              value={verifyForm.otp}
              onChange={(event) => setVerifyForm((prev) => ({ ...prev, otp: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="6-digit verification code"
              inputMode="numeric"
              maxLength={6}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting || !verificationEmail}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Resend code
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register')
                setMessage('')
                setError('')
              }}
              className="w-full text-sm font-medium text-cyan-700"
            >
              Use a different email
            </button>
          </form>
        ) : isRegisterMode ? (
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
              type={showPassword ? "text" : "password"}
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring"
              placeholder="New Password (min 6 chars)"
              minLength={6}
              required
            />
           <input
  type={showPassword ? "text" : "password"}
  value={registerForm.confirmPassword}
  onChange={(event) =>
    setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
  }
  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-cyan-200 transition focus:ring mt-1"
  placeholder="Confirm Password"
  required
/>
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="text-sm text-cyan-600"
>
  {showPassword ? "Hide Password" : "Show Password"}
</button>
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
