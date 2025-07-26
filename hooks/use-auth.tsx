"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  // Helper function to get environment-specific redirect path
  const getRedirectPath = () => {
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    
    if (isLocalDev) {
      return process.env.NEXT_PUBLIC_DEV_REDIRECT_PATH || '/project'
    } else {
      return process.env.NEXT_PUBLIC_PROD_REDIRECT_PATH || '/dashboard'
    }
  }

  // Helper function to get base URL for OAuth redirects
  const getBaseUrl = () => {
    const isLocalDev = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    
    if (isLocalDev) {
      return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
    } else {
      return process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    }
  }

  // Check for existing session on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.full_name || supabaseUser.email?.split('@')[0] || 'User',
          email: profile.email,
          avatar: profile.avatar_url
        })
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          avatar_url: supabaseUser.user_metadata?.avatar_url
        }

        const { error } = await supabase
          .from('profiles')
          .insert(newProfile)

        if (!error) {
          setUser({
            id: newProfile.id,
            name: newProfile.full_name,
            email: newProfile.email,
            avatar: newProfile.avatar_url
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Fallback to basic user info
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email!,
        avatar: supabaseUser.user_metadata?.avatar_url
      })
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        await fetchUserProfile(data.user)
        router.push(getRedirectPath())
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // If email confirmation is required, user will be null until confirmed
        if (data.session) {
          await fetchUserProfile(data.user)
          router.push(getRedirectPath())
        } else {
          // Email confirmation required
          router.push("/login?message=Check your email to confirm your account")
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)

    try {
      const baseUrl = getBaseUrl()
      const redirectPath = getRedirectPath()
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${baseUrl}/auth/callback?next=${redirectPath}`,
          // Use PKCE flow for better security
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }

      // OAuth redirect will handle the rest
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Google login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error('Error logging out:', error)
      // Force logout even if there's an error
      setUser(null)
      router.push("/login")
    }
  }

  const value = {
    user,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
