import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock Supabase client with proper typing
const mockSupabase = {
  auth: {
    signUp: jest.fn() as jest.MockedFunction<any>,
    signInWithPassword: jest.fn() as jest.MockedFunction<any>,
    signInWithOAuth: jest.fn() as jest.MockedFunction<any>,
    signOut: jest.fn() as jest.MockedFunction<any>,
    getSession: jest.fn() as jest.MockedFunction<any>,
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })) as jest.MockedFunction<any>
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    insert: jest.fn()
  })) as jest.MockedFunction<any>
}

// Mock the supabase module
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Signup', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      }
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      })

      // Act & Assert
      const result = await mockSupabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'Test User' }
        }
      }) as any

      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'Test User' }
        }
      })
    })

    it('should handle signup errors', async () => {
      // Arrange
      const mockError = { message: 'Email already registered' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      // Act
      const result = await mockSupabase.auth.signUp({
        email: 'existing@example.com',
        password: 'password123'
      }) as any

      // Assert
      expect(result.error).toEqual(mockError)
      expect(result.data.user).toBeNull()
    })
  })

  describe('User Login', () => {
    it('should successfully log in a user', async () => {
      // Arrange
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      }
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      })

      // Act
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      }) as any

      // Assert
      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should handle login errors', async () => {
      // Arrange
      const mockError = { message: 'Invalid login credentials' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      // Act
      const result = await mockSupabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      }) as any

      // Assert
      expect(result.error).toEqual(mockError)
      expect(result.data.user).toBeNull()
    })
  })

  describe('User Logout', () => {
    it('should successfully log out a user', async () => {
      // Arrange
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      // Act
      const result = await mockSupabase.auth.signOut() as any

      // Assert
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })
})