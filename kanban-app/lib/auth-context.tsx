'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { insforge } from './insforge'

type AuthUser = {
  id: string
  email: string
  email_confirmed_at?: string
  [key: string]: unknown
}

type AuthSession = {
  access_token: string
  refresh_token: string
  user: AuthUser
  expires_at: number
  expires_in: number
  token_type: string
}

type AuthContextType = {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: currentUser } = await insforge.auth.getCurrentUser()
        if (currentUser?.user) {
          setUser(currentUser.user as AuthUser)
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await insforge.auth.signInWithPassword({
      email,
      password
    })
    if (!error) {
      const { data: currentUser } = await insforge.auth.getCurrentUser()
      if (currentUser?.user) {
        setUser(currentUser.user as AuthUser)
      }
    }
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await insforge.auth.signUp({
      email,
      password
    })
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    await insforge.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    await insforge.auth.signOut()
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
