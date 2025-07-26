import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import StartNewPage from '@/app/start-new/page'
import { useProjects } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock hooks
jest.mock('@/hooks/use-projects', () => ({
  useProjects: jest.fn()
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn()
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  ),
}))

jest.mock('@/components/project-creation-dialog', () => ({
  ProjectCreationDialog: ({ open, onOpenChange, onCreateProject }: any) => (
    open ? (
      <div data-testid="project-creation-dialog">
        <h2>Create New Project</h2>
        <button 
          onClick={() => {
            const mockProject = { id: 'test-project-id', name: 'Test Project' }
            onCreateProject('Test Project', 'Test Description').then(() => {
              onOpenChange(false)
            })
          }}
          data-testid="create-project-submit"
        >
          Create Project
        </button>
        <button onClick={() => onOpenChange(false)} data-testid="dialog-close">
          Close
        </button>
      </div>
    ) : null
  )
}))

const mockPush = jest.fn()
const mockCreateProject = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('StartNewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn()
    } as any)
    
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn()
    } as any)
    
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: false,
      error: null,
      createProject: mockCreateProject,
      refreshProjects: jest.fn(),
      updateLastAccessed: jest.fn()
    } as any)
  })

  it('should render welcome message and guidance', () => {
    render(<StartNewPage />)
    
    expect(screen.getByText('Welcome to Ori')).toBeInTheDocument()
    expect(screen.getByText(/You don't have any projects yet/)).toBeInTheDocument()
    expect(screen.getByText(/Get started by creating your first project to begin your journey with Ori/)).toBeInTheDocument()
    expect(screen.getByText(/Start building something amazing today/)).toBeInTheDocument()
  })

  it('should render create new project button', () => {
    render(<StartNewPage />)
    
    const createButton = screen.getByRole('button', { name: /create new project/i })
    expect(createButton).toBeInTheDocument()
  })

  it('should show project creation dialog when create button is clicked', () => {
    render(<StartNewPage />)
    
    const createButton = screen.getByRole('button', { name: /create new project/i })
    fireEvent.click(createButton)
    
    expect(screen.getByTestId('project-creation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })

  it('should create project and navigate to project page when dialog is submitted', async () => {
    const mockProject = {
      id: 'test-project-id',
      name: 'Test Project',
      description: 'Test Description',
      owner_id: 'user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_accessed_at: null
    }
    
    mockCreateProject.mockResolvedValue(mockProject)
    
    render(<StartNewPage />)
    
    // Open dialog
    const createButton = screen.getByRole('button', { name: /create new project/i })
    fireEvent.click(createButton)
    
    // Submit project creation
    const submitButton = screen.getByTestId('create-project-submit')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith('Test Project', 'Test Description')
      expect(mockPush).toHaveBeenCalledWith('/project/test-project-id')
    })
  })

  it('should close dialog when close button is clicked', () => {
    render(<StartNewPage />)
    
    // Open dialog
    const createButton = screen.getByRole('button', { name: /create new project/i })
    fireEvent.click(createButton)
    
    expect(screen.getByTestId('project-creation-dialog')).toBeInTheDocument()
    
    // Close dialog
    const closeButton = screen.getByTestId('dialog-close')
    fireEvent.click(closeButton)
    
    expect(screen.queryByTestId('project-creation-dialog')).not.toBeInTheDocument()
  })

  it('should redirect to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn()
    } as any)

    render(<StartNewPage />)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should show loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn()
    } as any)

    render(<StartNewPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Welcome to Ori')).not.toBeInTheDocument()
  })

  it('should render start new page when user is authenticated', () => {
    render(<StartNewPage />)

    expect(screen.getByText('Welcome to Ori')).toBeInTheDocument()
    expect(screen.getByText(/You don't have any projects yet/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create new project/i })).toBeInTheDocument()
  })

  it('should have proper styling and layout', () => {
    render(<StartNewPage />)
    
    const container = screen.getByTestId('start-new-container')
    expect(container).toHaveClass('min-h-screen')
    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('items-center')
    expect(container).toHaveClass('justify-center')
    expect(container).toHaveClass('bg-gradient-to-br')
  })
})