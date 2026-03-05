"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { api } from "@/lib/api"
import { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const token = api.getToken()
      if (!token) {
        setLoading(false)
        return
      }
      const me = await api.get<User>("/api/auth/me")
      setUser(me)
    } catch {
      api.setToken(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (username: string, password: string) => {
    const res = await api.post<{ access_token: string }>("/api/auth/login", {
      username,
      password,
    })
    api.setToken(res.access_token)
    await fetchUser()
  }

  const logout = () => {
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
