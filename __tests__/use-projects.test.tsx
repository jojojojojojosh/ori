import { renderHook, act, waitFor } from '@testing-library/react'
import { useProjects } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            order: jest.fn()
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn()
        }))
      }))
    }))
  }
}))

// Mock useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn()
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('useProjects', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn()
    })
  })

  it('should initialize with empty projects when no user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn()
    })

    const { result } = renderHook(() => useProjects())

    expect(result.current.projects).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should fetch projects for authenticated user', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Project 1',
        description: 'Description 1',
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_accessed_at: null
      },
      {
        id: 'project-2',
        name: 'Project 2',
        description: 'Description 2',
        owner_id: 'user-123',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        last_accessed_at: '2024-01-03T00:00:00Z'
      }
    ]

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockProjects, error: null })
          })
        })
      })
    } as any)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.projects).toEqual(mockProjects)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should create a new project', async () => {
    const newProject = {
      id: 'project-new',
      name: 'New Project',
      description: 'New Description',
      owner_id: 'user-123',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
      last_accessed_at: null
    }

    // Mock initial fetch
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
    } as any)

    // Mock create project
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: newProject, error: null })
        })
      })
    } as any)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let createdProject: any
    await act(async () => {
      createdProject = await result.current.createProject('New Project', 'New Description')
    })

    expect(createdProject).toEqual(newProject)
    expect(result.current.projects).toContain(newProject)
  })

  it('should handle project creation error', async () => {
    // Mock initial fetch
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      })
    } as any)

    // Mock create project error
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
        })
      })
    } as any)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let createdProject: any
    await act(async () => {
      createdProject = await result.current.createProject('New Project')
    })

    expect(createdProject).toBe(null)
    expect(result.current.error).toBe('Failed to create project')
  })

  it('should update last accessed time', async () => {
    const mockProjects = [
      {
        id: 'project-1',
        name: 'Project 1',
        description: 'Description 1',
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        last_accessed_at: null
      }
    ]

    // Mock initial fetch
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockProjects, error: null })
          })
        })
      })
    } as any)

    // Mock update
    mockSupabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })
    } as any)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.projects).toEqual(mockProjects)
    })

    await act(async () => {
      await result.current.updateLastAccessed('project-1')
    })

    expect(result.current.projects[0].last_accessed_at).toBeTruthy()
  })
})