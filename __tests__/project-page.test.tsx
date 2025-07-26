import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import ProjectPage from '@/app/project/[id]/page'
import { useProjects } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'

// Mock the hooks and router
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock('@/hooks/use-projects')
jest.mock('@/hooks/use-auth')

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const mockPush = jest.fn()
const mockUpdateLastAccessed = jest.fn()

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test project description',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  last_accessed_at: '2024-01-03T00:00:00Z',
  owner_id: 'test-user-id',
}

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
}

describe('ProjectPage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
    })

    mockUseProjects.mockReturnValue({
      projects: [mockProject],
      isLoading: false,
      error: null,
      createProject: jest.fn(),
      refreshProjects: jest.fn(),
      updateLastAccessed: mockUpdateLastAccessed,
    })

    mockUseParams.mockReturnValue({
      id: 'test-project-id',
    })

    jest.clearAllMocks()
  })

  it('renders project page with project information', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
      expect(screen.getByText('Test project description')).toBeInTheDocument()
      expect(screen.getByText('Project Workspace')).toBeInTheDocument()
      expect(screen.getByText('Project Information')).toBeInTheDocument()
    })
  })

  it('updates last accessed time when project is found', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(mockUpdateLastAccessed).toHaveBeenCalledWith('test-project-id')
    })
  })

  it('shows loading state initially', () => {
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: true,
      error: null,
      createProject: jest.fn(),
      refreshProjects: jest.fn(),
      updateLastAccessed: mockUpdateLastAccessed,
    })

    render(<ProjectPage />)

    expect(screen.getByText('Loading project...')).toBeInTheDocument()
  })

  it('shows project not found when project does not exist', async () => {
    mockUseProjects.mockReturnValue({
      projects: [],
      isLoading: false,
      error: null,
      createProject: jest.fn(),
      refreshProjects: jest.fn(),
      updateLastAccessed: mockUpdateLastAccessed,
    })

    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument()
      expect(screen.getByText('Back to Projects')).toBeInTheDocument()
    })
  })

  it('shows authentication required when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      login: jest.fn(),
      signup: jest.fn(),
      loginWithGoogle: jest.fn(),
      logout: jest.fn(),
    })

    render(<ProjectPage />)

    expect(screen.getByText('Authentication Required')).toBeInTheDocument()
    expect(screen.getByText('Please log in to view this project.')).toBeInTheDocument()
    expect(screen.getByText('Go to Login')).toBeInTheDocument()
  })

  it('navigates back to projects when back button is clicked', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      const backButton = screen.getByText('Back')
      backButton.click()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('displays project metadata correctly', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('test-project-id')).toBeInTheDocument()
      expect(screen.getByText('1/1/2024')).toBeInTheDocument() // Created date
      expect(screen.getByText('1/2/2024')).toBeInTheDocument() // Updated date
      expect(screen.getByText('1/3/2024')).toBeInTheDocument() // Last accessed date
    })
  })

  it('renders action buttons', async () => {
    render(<ProjectPage />)

    await waitFor(() => {
      expect(screen.getByText('Files')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Deploy')).toBeInTheDocument()
      expect(screen.getByText('Share')).toBeInTheDocument()
    })
  })
})