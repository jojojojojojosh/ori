'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle, Sparkles } from 'lucide-react'
import { ProjectCreationDialog } from '@/components/project-creation-dialog'
import { useProjects } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'
import { Database } from '@/lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']

export default function StartNewPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { createProject } = useProjects()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (!isLoading && !user) {
    return null
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleCreateProject = () => {
    setIsDialogOpen(true)
  }

  const handleProjectCreated = async (name: string, description?: string): Promise<Project | null> => {
    const project = await createProject(name, description)
    if (project) {
      router.push(`/project/${project.id}`)
    }
    return project
  }

  return (
    <div 
      data-testid="start-new-container"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20"
    >
      <div className="max-w-lg mx-auto text-center space-y-8 p-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome to Ori
          </h1>
          
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              You don't have any projects yet.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Get started by creating your first project to begin your journey with Ori.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleCreateProject}
            size="lg"
            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create New Project
          </Button>
          
          <p className="text-xs text-muted-foreground/60">
            Start building something amazing today
          </p>
        </div>
      </div>
      
      <ProjectCreationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateProject={handleProjectCreated}
      />
    </div>
  )
}