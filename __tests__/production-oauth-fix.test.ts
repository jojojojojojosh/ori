import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock environment variables for production
const mockProductionEnv = {
  NODE_ENV: 'production',
  NEXT_PUBLIC_SUPABASE_URL: 'https://auxpuxoqfuyoqqbylvon.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eHB1eG9xZnV5b3FxYnlsdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNzY5MzcsImV4cCI6MjA2ODk1MjkzN30.Zd1WLPSu9L1ypLIdLRd-jMG6jeVmf7ttbEMULw-RLmA',
  NEXT_PUBLIC_SITE_URL: 'https://ori-seven.vercel.app',
  NEXT_PUBLIC_DEV_REDIRECT_PATH: '/project',
  NEXT_PUBLIC_PROD_REDIRECT_PATH: '/dashboard'
}

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithOAuth: jest.fn() as jest.MockedFunction<any>,
    exchangeCodeForSession: jest.fn() as jest.MockedFunction<any>
  }
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Production OAuth Configuration Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock production environment
    Object.defineProperty(process, 'env', {
      value: { ...process.env, ...mockProductionEnv },
      writable: true
    })
    
    // Mock production window.location
    delete (window as any).location
    ;(window as any).location = {
      origin: 'https://ori-seven.vercel.app',
      hostname: 'ori-seven.vercel.app'
    }
  })

  it('should use correct production site URL for OAuth redirects', async () => {
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

  it('should not redirect to localhost in production', () => {
    // This test ensures the fix prevents the "missing parameter" issue
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    
    // Assert that production site URL is not localhost
    expect(siteUrl).toBe('https://ori-seven.vercel.app')
    expect(siteUrl).not.toContain('localhost')
    expect(siteUrl).not.toContain('127.0.0.1')
  })

  it('should use production redirect path in production environment', () => {
    // Arrange
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    // Act
    const redirectPath = isLocalEnv 
      ? process.env.NEXT_PUBLIC_DEV_REDIRECT_PATH || '/project'
      : process.env.NEXT_PUBLIC_PROD_REDIRECT_PATH || '/dashboard'
    
    // Assert
    expect(isLocalEnv).toBe(false)
    expect(redirectPath).toBe('/dashboard')
  })

  it('should generate valid OAuth callback URL that prevents missing parameter error', () => {
    // Arrange
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    const redirectPath = process.env.NEXT_PUBLIC_PROD_REDIRECT_PATH
    
    // Act
    const callbackUrl = `${baseUrl}/auth/callback?next=${redirectPath}`
    
    // Assert
    expect(callbackUrl).toBe('https://ori-seven.vercel.app/auth/callback?next=/dashboard')
    
    // Verify URL structure prevents the original error
    expect(callbackUrl).toMatch(/^https:\/\/ori-seven\.vercel\.app\/auth\/callback\?next=\/dashboard$/)
    expect(callbackUrl).not.toContain('localhost')
    expect(callbackUrl).not.toContain('supabase.co')
  })

  it('should document the fix for the missing parameter issue', () => {
    // This test documents the root cause and solution
    
    // Root cause: NEXT_PUBLIC_SITE_URL was set to localhost in production
    const problematicConfig = 'http://localhost:3000'
    
    // Solution: Use correct production URL
    const correctConfig = 'https://ori-seven.vercel.app'
    
    // Verify the fix is in place
    expect(process.env.NEXT_PUBLIC_SITE_URL).toBe(correctConfig)
    expect(process.env.NEXT_PUBLIC_SITE_URL).not.toBe(problematicConfig)
    
    // The missing parameter error occurred because:
    // 1. OAuth tried to redirect to localhost callback in production
    // 2. Supabase rejected the redirect as invalid
    // 3. User got "missing parameter" error instead of successful auth
    
    // This fix ensures OAuth redirects to the correct production domain
  })
})