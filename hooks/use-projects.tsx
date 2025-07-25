"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Database } from "@/lib/supabase"

type Project = Database['public']['Tables']['projects']['Row']

interface UseProjectsReturn {
  projects: Project[]
  isLoading: boolean
  error: string | null
  createProject: (name: string, description?: string) => Promise<Project | null>
  refreshProjects: () => Promise<void>
  updateLastAccessed: (projectId: string) => Promise<void>
}

export function useProjects(): UseProjectsReturn {
  const { user } = useAuth()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchProjects = React.useCallback(async () => {
    if (!user) {
      setProjects([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('last_accessed_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to fetch projects')
        return
      }

      setProjects(data || [])
    } catch (err) {
      setError('Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const createProject = React.useCallback(async (name: string, description?: string): Promise<Project | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setError(null)

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          owner_id: user.id,
        })
        .select()
        .single()

      if (error) {
        setError('Failed to create project')
        return null
      }

      if (data) {
        setProjects(prev => [data, ...prev])
        return data
      }

      return null
    } catch (err) {
      setError('Failed to create project')
      return null
    }
  }, [user])

  const updateLastAccessed = React.useCallback(async (projectId: string): Promise<void> => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', projectId)
        .eq('owner_id', user.id)

      if (!error) {
        // Update local state
        setProjects(prev => 
          prev.map(project => 
            project.id === projectId 
              ? { ...project, last_accessed_at: new Date().toISOString() }
              : project
          ).sort((a, b) => {
            // Sort by last_accessed_at desc, then created_at desc
            if (a.last_accessed_at && b.last_accessed_at) {
              return new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime()
            }
            if (a.last_accessed_at && !b.last_accessed_at) return -1
            if (!a.last_accessed_at && b.last_accessed_at) return 1
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
        )
      }
    } catch (err) {
      // Silent fail for last accessed update
      console.warn('Failed to update last accessed time:', err)
    }
  }, [user])

  const refreshProjects = React.useCallback(async () => {
    await fetchProjects()
  }, [fetchProjects])

  // Fetch projects when user changes
  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    createProject,
    refreshProjects,
    updateLastAccessed,
  }
}