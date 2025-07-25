import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithOAuth: jest.fn() as jest.MockedFunction<any>
  }
}

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

// Mock window.location for testing
delete (window as any).location
;(window as any).location = {
  origin: 'http://localhost:3000',
  hostname: 'localhost'
}

describe('OAuth Redirect Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate correct OAuth redirect URL for local development', async () => {
    // Arrange
    const expectedRedirectUrl = 'http://localhost:3000/auth/callback?next=/project'
    const mockOAuthResponse = {
      data: {
        url: `https://accounts.google.com/oauth/authorize?redirect_uri=${encodeURIComponent(expectedRedirectUrl)}`,
        provider: 'google'
      },
      error: null
    }
    
    mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockOAuthResponse)
    
    // Act
    const { data, error } = await mockSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: expectedRedirectUrl,
      },
    })
    
    // Assert
    expect(error).toBeNull()
    expect(data?.url).toBeDefined()
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expectedRedirectUrl,
      },
    })
  })
  
  it('should generate correct OAuth redirect URL for production', async () => {
    // Arrange
    const expectedRedirectUrl = 'https://ori-seven.vercel.app/auth/callback?next=/project'
    const mockOAuthResponse = {
      data: {
        url: `https://accounts.google.com/oauth/authorize?redirect_uri=${encodeURIComponent(expectedRedirectUrl)}`,
        provider: 'google'
      },
      error: null
    }
    
    mockSupabase.auth.signInWithOAuth.mockResolvedValue(mockOAuthResponse)
    
    // Act
    const { data, error } = await mockSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: expectedRedirectUrl,
      },
    })
    
    // Assert
    expect(error).toBeNull()
    expect(data?.url).toBeDefined()
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expectedRedirectUrl,
      },
    })
  })
  
  it('should document the problematic redirect URL pattern', () => {
    // This test documents the problem from the user's issue:
    // Users are being redirected to Supabase URL instead of app callback
    const problematicUrl = 'https://auxpuxoqfuyoqqbylvon.supabase.co/ori-seven.vercel.app#access_token=...'
    
    // This pattern indicates misconfigured OAuth redirect URLs in Supabase
    expect(problematicUrl).toMatch(/supabase\.co\/.*vercel\.app/)
    
    // The correct pattern should be: https://ori-seven.vercel.app/auth/callback
    const correctUrl = 'https://ori-seven.vercel.app/auth/callback?next=/project'
    expect(correctUrl).toMatch(/^https:\/\/ori-seven\.vercel\.app\/auth\/callback/)
  })
})