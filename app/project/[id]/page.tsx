'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'
import { Database } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Share } from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { projects, updateLastAccessed } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string

  useEffect(() => {
    if (!projectId || !projects.length) {
      setIsLoading(false)
      return
    }

    const foundProject = projects.find(p => p.id === projectId)
    
    if (foundProject) {
      setProject(foundProject)
      updateLastAccessed(projectId)
      setError(null)
    } else {
      setError('Project not found')
    }
    
    setIsLoading(false)
  }, [projectId, projects, updateLastAccessed])

  const handleBackToProjects = () => {
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to view this project.</p>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'The project you are looking for does not exist or you do not have access to it.'}
          </p>
          <Button onClick={handleBackToProjects}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToProjects}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Project Workspace</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to your project workspace. This is where you'll build and manage your project.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <div className="text-lg font-medium">Files</div>
                <div className="text-sm text-muted-foreground">Manage project files</div>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <div className="text-lg font-medium">Settings</div>
                <div className="text-sm text-muted-foreground">Configure project</div>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <div className="text-lg font-medium">Deploy</div>
                <div className="text-sm text-muted-foreground">Deploy your project</div>
              </Button>
            </div>
          </div>
          
          {/* Project Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Project Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Project ID</dt>
                  <dd className="text-sm font-mono">{project.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-sm">{new Date(project.created_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="text-sm">{new Date(project.updated_at).toLocaleDateString()}</dd>
                </div>
                {project.last_accessed_at && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Last Accessed</dt>
                    <dd className="text-sm">{new Date(project.last_accessed_at).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  View Project Files
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Project Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}