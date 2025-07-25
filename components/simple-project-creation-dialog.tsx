"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { Database } from "@/lib/supabase"

type Project = Database['public']['Tables']['projects']['Row']

interface SimpleProjectCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: (project: Project) => void
}

export function SimpleProjectCreationDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: SimpleProjectCreationDialogProps) {
  const { user } = useAuth()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [nameError, setNameError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setError("")
    setNameError("")
    
    // Validate
    if (!name.trim()) {
      setNameError("Project name is required")
      return
    }
    
    if (!user) {
      setError("User not authenticated")
      return
    }
    
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          owner_id: user.id,
        })
        .select()
        .single()
      
      if (error) {
        setError("Failed to create project. Please try again.")
        return
      }
      
      if (data) {
        onProjectCreated(data)
        onOpenChange(false)
        // Reset form
        setName("")
        setDescription("")
      }
    } catch (err) {
      setError("Failed to create project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div data-testid="project-creation-dialog">
      <h2>Create New Project</h2>
      <p>Create a new project to organize your work.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Project Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            aria-label="Project Name"
          />
          {nameError && (
            <p style={{ color: 'red' }}>{nameError}</p>
          )}
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description (optional)"
            aria-label="Description"
          />
        </div>
        {error && (
          <p style={{ color: 'red' }}>{error}</p>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  )
}