import Dashboard from './pages/Dashboard'
import AuthPage from './pages/AuthPage'
import { useAuth } from './context/AuthContext'

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-slate-600">
        Loading your account...
      </main>
    )
  }

  return isAuthenticated ? <Dashboard /> : <AuthPage />
}

export default App

