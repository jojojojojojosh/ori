"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, FolderIcon } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { ProjectCreationDialog } from "@/components/project-creation-dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export function ProjectSwitcher() {
  const { isMobile } = useSidebar()
  const { projects, createProject, updateLastAccessed, isLoading } = useProjects()
  const [activeProject, setActiveProject] = React.useState(projects[0])
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  React.useEffect(() => {
    if (projects.length > 0 && !activeProject) {
      setActiveProject(projects[0])
    }
  }, [projects, activeProject])

  const handleProjectSelect = async (project: any) => {
    setActiveProject(project)
    await updateLastAccessed(project.id)
  }

  const handleCreateProject = async (name: string, description?: string) => {
    const newProject = await createProject(name, description)
    if (newProject) {
      setActiveProject(newProject)
      setShowCreateDialog(false)
    }
    return newProject
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <FolderIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (projects.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => setShowCreateDialog(true)}
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Create Project</span>
              <span className="truncate text-xs">Get started</span>
            </div>
          </SidebarMenuButton>
          <ProjectCreationDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateProject={handleCreateProject}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeProject) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FolderIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeProject.name}</span>
                <span className="truncate text-xs">{activeProject.description || 'No description'}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Projects
            </DropdownMenuLabel>
            {projects.map((project, index) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <FolderIcon className="size-4 shrink-0" />
                </div>
                {project.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 p-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add project</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ProjectCreationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateProject={handleCreateProject}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
