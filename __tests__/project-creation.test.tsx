import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProjectCreationDialog } from '@/components/project-creation-dialog'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} data-testid="button">
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid="input" />,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor} data-testid="label">{children}</label>,
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

describe('ProjectCreationDialog', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  }

  const mockOnCreateProject = jest.fn()
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
    
    // Setup default mock for onCreateProject
    mockOnCreateProject.mockResolvedValue({
      id: 'project-123',
      name: 'Test Project',
      description: 'Test Description',
      owner_id: 'user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: null
    })
  })

  it('should render project creation form when open', () => {
    render(
      <ProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onCreateProject={mockOnCreateProject}
      />
    )

    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Project' })).toBeInTheDocument()
  })

  it('should create project with valid data', async () => {
    render(
      <ProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onCreateProject={mockOnCreateProject}
      />
    )

    const nameInput = screen.getByLabelText('Project Name')
    const descriptionInput = screen.getByLabelText('Description')
    const createButton = screen.getByRole('button', { name: 'Create Project' })

    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnCreateProject).toHaveBeenCalledWith('Test Project', 'Test Description')
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('should show validation error for empty project name', async () => {
    render(
      <ProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onCreateProject={mockOnCreateProject}
      />
    )

    const createButton = screen.getByRole('button', { name: 'Create Project' })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument()
    })
  })

  it('should handle creation error gracefully', async () => {
    // Mock onCreateProject to return null (indicating failure)
    mockOnCreateProject.mockResolvedValue(null)

    render(
      <ProjectCreationDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onCreateProject={mockOnCreateProject}
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