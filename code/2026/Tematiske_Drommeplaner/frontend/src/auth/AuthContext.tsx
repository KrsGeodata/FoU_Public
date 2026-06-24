import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, me } from '../api/authApi'

interface AuthContextValue {
  username: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    me()
      .then(user => setUsername(user.username))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      username,
      isAuthenticated: !!username,
      loading,
      login: async (user: string, password: string) => {
        const loggedIn = await apiLogin(user, password)
        setUsername(loggedIn.username)
      },
      logout: async () => {
        await apiLogout()
        setUsername(null)
      },
    }),
    [username, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
