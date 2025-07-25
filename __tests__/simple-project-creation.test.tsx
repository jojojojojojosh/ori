import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SimpleProjectCreationDialog } from '@/components/simple-project-creation-dialog'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

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
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
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

describe('SimpleProjectCreationDialog', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg'
  }

  const mockOnProjectCreated = jest.fn()
  const mockOnOpenChange = jest.fn()

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

  it('should render project creation form when open', () => {
    render(
      <SimpleProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onProjectCreated={mockOnProjectCreated}
      />
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <SimpleProjectCreationDialog 
        open={false} 
        onOpenChange={mockOnOpenChange} 
        onProjectCreated={mockOnProjectCreated}
      />
    )

    expect(screen.queryByTestId('project-creation-dialog')).not.toBeInTheDocument()
  })

  it('should create project with valid data', async () => {
    const mockProject = {
      id: 'project-123',
      name: 'Test Project',
      description: 'Test Description',
      owner_id: 'user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: null
    }

    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProject, error: null })
        })
      })
    } as any)

    render(
      <SimpleProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onProjectCreated={mockOnProjectCreated}
      />
    )

    const nameInput = screen.getByLabelText('Project Name')
    const descriptionInput = screen.getByLabelText('Description')
    const createButton = screen.getByRole('button', { name: 'Create Project' })

    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockOnProjectCreated).toHaveBeenCalledWith(mockProject)
    })
  })

  it('should show validation error for empty project name', async () => {
    render(
      <SimpleProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onProjectCreated={mockOnProjectCreated}
      />
    )

    const createButton = screen.getByRole('button', { name: 'Create Project' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument()
    })
  })

  it('should handle creation error gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database error' } 
          })
        })
      })
    } as any)

    render(
      <SimpleProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onProjectCreated={mockOnProjectCreated}
      />
    )

    const nameInput = screen.getByLabelText('Project Name')
    const createButton = screen.getByRole('button', { name: 'Create Project' })

    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create project. Please try again.')).toBeInTheDocument()
    })
  })
})