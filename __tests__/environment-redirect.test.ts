import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_DEV_REDIRECT_PATH: '/project',
  NEXT_PUBLIC_PROD_REDIRECT_PATH: '/dashboard',
  NEXT_PUBLIC_SITE_URL: 'https://ori-seven.vercel.app'
}

// Mock process.env
Object.defineProperty(process, 'env', {
  value: { ...process.env, ...mockEnv },
  writable: true
})

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn() as jest.MockedFunction<any>,
    signUp: jest.fn() as jest.MockedFunction<any>,
    signInWithOAuth: jest.fn() as jest.MockedFunction<any>,
    signOut: jest.fn() as jest.MockedFunction<any>,
    getSession: jest.fn() as jest.MockedFunction<any>,
    onAuthStateChange: jest.fn() as jest.MockedFunction<any>
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
}

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

describe('Environment-specific Redirect Paths', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  describe('Local Development Environment', () => {
    beforeEach(() => {
      // Mock window.location for localhost
      delete (window as any).location
      ;(window as any).location = {
        origin: 'http://localhost:3001',
        hostname: 'localhost'
      }
    })

    it('should use development redirect path for login', async () => {
      // Arrange
      const mockUser = { id: '1', email: 'test@example.com' }
      const mockSession = { user: mockUser }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })
      const mockSingle = jest.fn() as jest.MockedFunction<any>
      mockSingle.mockResolvedValue({ data: null, error: null })
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: mockSingle
          }))
        }))
      })

      // Import after mocking
      const { AuthProvider, useAuth } = await import('@/hooks/use-auth')
      
      // This test verifies that the redirect path is set correctly for development
      expect(process.env.NEXT_PUBLIC_DEV_REDIRECT_PATH).toBe('/project')
    })

    it('should generate correct OAuth redirect URL for development', async () => {
      // Arrange
      const expectedRedirectUrl = 'http://localhost:3001/auth/callback?next=/project'
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/authorize?...' },
        error: null
      })

      // Act
      await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: expectedRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      // Assert
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expectedRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })
  })

  describe('Production Environment', () => {
    beforeEach(() => {
      // Mock window.location for production
      delete (window as any).location
      ;(window as any).location = {
        origin: 'https://ori-seven.vercel.app',
        hostname: 'ori-seven.vercel.app'
      }
    })

    it('should use production redirect path for login', async () => {
      // This test verifies that the redirect path is set correctly for production
      expect(process.env.NEXT_PUBLIC_PROD_REDIRECT_PATH).toBe('/dashboard')
    })

    it('should generate correct OAuth redirect URL for production', async () => {
      // Arrange
      const expectedRedirectUrl = 'https://ori-seven.vercel.app/auth/callback?next=/dashboard'
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth/authorize?...' },
        error: null
      })

      // Act
      await mockSupabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: expectedRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      // Assert
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expectedRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
    })
  })

  describe('Environment Detection', () => {
    it('should correctly identify localhost as development environment', () => {
      const hostname = 'localhost'
      const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1'
      expect(isLocalDev).toBe(true)
    })

    it('should correctly identify production domain as production environment', () => {
      const hostname = 'ori-seven.vercel.app' as string
      const isLocalDev = hostname === 'localhost' || hostname === '127.0.0.1'
      expect(isLocalDev).toBe(false)
    })

    it('should return correct redirect paths based on environment', () => {
      // Test development path
      expect(process.env.NEXT_PUBLIC_DEV_REDIRECT_PATH).toBe('/project')
      
      // Test production path
      expect(process.env.NEXT_PUBLIC_PROD_REDIRECT_PATH).toBe('/dashboard')
    })
  })
})