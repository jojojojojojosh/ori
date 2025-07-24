"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

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

  // Simulate checking for existing session on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation
    if (email === "demo@example.com" && password === "password123") {
      const userData = {
        id: "1",
        name: "Demo User",
        email: email,
        avatar: "/placeholder.svg?height=32&width=32",
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      router.push("/project")
    } else {
      throw new Error("Invalid email or password")
    }

    setIsLoading(false)
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user creation
    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      avatar: "/placeholder.svg?height=32&width=32",
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    router.push("/project")

    setIsLoading(false)
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)

    // Simulate Google OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userData = {
      id: Math.random().toString(36).substr(2, 9),
      name: "Google User",
      email: "google.user@gmail.com",
      avatar: "/placeholder.svg?height=32&width=32",
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    router.push("/project")

    setIsLoading(false)
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
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
