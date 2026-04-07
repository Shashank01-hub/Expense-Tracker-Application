import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../config/api'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'project01-auth'

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed')
  }

  return payload
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(AUTH_STORAGE_KEY)))

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      return
    }

    let cancelled = false

    apiRequest('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const register = async (payload) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    setToken(data.token)
    setUser(data.user)
  }

  const login = async (payload) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setLoading(false)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      register,
      login,
      logout,
    }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
