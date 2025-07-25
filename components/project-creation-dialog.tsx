"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database } from "@/lib/supabase"

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProject: (name: string, description?: string) => Promise<Project | null>
}

export function ProjectCreationDialog({
  open,
  onOpenChange,
  onCreateProject,
}: ProjectCreationDialogProps) {
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
    
    setIsLoading(true)
    
    try {
      const project = await onCreateProject(name.trim(), description.trim() || undefined)
      
      if (project) {
        // Reset form
        setName("")
        setDescription("")
        onOpenChange(false)
      } else {
        setError("Failed to create project. Please try again.")
      }
    } catch (err) {
      setError("Failed to create project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project to organize your work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                aria-label="Project Name"
              />
              {nameError && (
                <p className="text-sm text-red-600">{nameError}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description (optional)"
                aria-label="Description"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}