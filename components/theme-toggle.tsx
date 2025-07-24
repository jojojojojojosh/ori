"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { isMobile } = useSidebar()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state during hydration
  if (!mounted) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Theme">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <span>System</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "system":
        return "System"
      default:
        return "System"
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  const currentTheme = theme || "system"

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={`Theme: ${getThemeLabel(currentTheme)}`}>
                  {getThemeIcon(currentTheme)}
                  <span>{getThemeLabel(currentTheme)}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "top" : "right"}
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => handleThemeChange("light")}
                  className={`cursor-pointer ${currentTheme === "light" ? "bg-accent text-accent-foreground" : ""}`}
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                  {currentTheme === "light" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleThemeChange("dark")}
                  className={`cursor-pointer ${currentTheme === "dark" ? "bg-accent text-accent-foreground" : ""}`}
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                  {currentTheme === "dark" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleThemeChange("system")}
                  className={`cursor-pointer ${currentTheme === "system" ? "bg-accent text-accent-foreground" : ""}`}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                  {currentTheme === "system" && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
