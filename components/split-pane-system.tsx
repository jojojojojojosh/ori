"use client"

import * as React from "react"
import { X, ChevronDown, GripVertical, SquareSplitHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type PaneId = string
type SplitDirection = "horizontal" | "vertical"
type ContentType = "dashboard" | "editor" | "preview" | "terminal" | "explorer" | "settings"

interface ContentTypeConfig {
  id: ContentType
  label: string
  component: React.ComponentType
}

interface Pane {
  id: PaneId
  contentType: ContentType
}

interface Split {
  id: PaneId
  direction: SplitDirection
  children: (Pane | Split)[]
  sizes: number[] // Percentage sizes for each child
}

type PaneNode = Pane | Split

interface SplitPaneSystemProps {
  className?: string
  contentTypes?: ContentTypeConfig[]
}

interface DragState {
  isDragging: boolean
  splitId: string
  handleIndex: number
  startX: number
  startY: number
  startSizes: number[]
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const isPane = (node: PaneNode): node is Pane => !("children" in node)
const isSplit = (node: PaneNode): node is Split => "children" in node

// Default content components
const DashboardContent = () => (
  <div className="flex flex-col gap-4 h-full">
    <h2 className="text-lg font-semibold">Dashboard</h2>
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Widget 1</span>
      </div>
      <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Widget 2</span>
      </div>
      <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Widget 3</span>
      </div>
    </div>
    <div className="flex-1 rounded-xl bg-muted/50 flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Main Content Area</span>
    </div>
  </div>
)

const EditorContent = () => (
  <div className="flex flex-col gap-4 h-full">
    <h2 className="text-lg font-semibold">Code Editor</h2>
    <div className="flex-1 rounded-xl bg-slate-900 text-green-400 p-4 font-mono text-sm">
      <div className="mb-2 text-gray-500">{"// main.tsx"}</div>
      <div>import React from &apos;react&apos;</div>
      <div>import ReactDOM from &apos;react-dom/client&apos;</div>
      <div className="mt-4">function App() {"{"}</div>
      <div className="ml-4">return (</div>
      <div className="ml-8">{'<div className="app">'}</div>
      <div className="ml-12">{"<h1>Hello World</h1>"}</div>
      <div className="ml-8">{"</div>"}</div>
      <div className="ml-4">)</div>
      <div>{"}"}</div>
    </div>
  </div>
)

const PreviewContent = () => (
  <div className="flex flex-col gap-4 h-full">
    <h2 className="text-lg font-semibold">Preview</h2>
    <div className="flex-1 rounded-xl border bg-white p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Hello World</h1>
        <p className="text-gray-600">This is a preview of your application</p>
      </div>
    </div>
  </div>
)

const TerminalContent = () => (
  <div className="flex flex-col gap-4 h-full">
    <h2 className="text-lg font-semibold">Terminal</h2>
    <div className="flex-1 rounded-xl bg-black text-green-400 p-4 font-mono text-sm">
      <div className="mb-2">$ npm run dev</div>
      <div className="text-gray-400">Starting development server...</div>
      <div className="text-gray-400">✓ Ready on http://localhost:3000</div>
      <div className="mt-4">
        $ <span className="animate-pulse">|</span>
      </div>
    </div>
  </div>
)

const ExplorerContent = () => (
  <div className="flex flex-col gap-4 h-full">
    <h2 className="text-lg font-semibold">File Explorer</h2>
    <div className="flex-1 rounded-xl bg-muted/50 p-4">
      <div className="space-y-2 font-mono text-sm">
        <div>📁 src/</div>
        <div className="ml-4">📄 main.tsx</div>
        <div className="ml-4">📄 App.tsx</div>
        <div className="ml-4">📁 components/</div>
        <div className="ml-8">📄 Button.tsx</div>
        <div className="ml-8">📄 Input.tsx</div>
        <div>📄 package.json</div>
        <div>📄 README.md</div>
      </div>
    </div>
  </div>
)

const SettingsContent = () => (
  <div className="flex flex-col gap-4 h-full">
    <h2 className="text-lg font-semibold">Settings</h2>
    <div className="flex-1 rounded-xl bg-muted/50 p-4">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Theme</label>
          <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
            <option>Light</option>
            <option>Dark</option>
            <option>Auto</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Font Size</label>
          <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
            <option>12px</option>
            <option>14px</option>
            <option>16px</option>
          </select>
        </div>
      </div>
    </div>
  </div>
)

const defaultContentTypes: ContentTypeConfig[] = [
  { id: "dashboard", label: "Dashboard", component: DashboardContent },
  { id: "editor", label: "Editor", component: EditorContent },
  { id: "preview", label: "Preview", component: PreviewContent },
  { id: "terminal", label: "Terminal", component: TerminalContent },
  { id: "explorer", label: "Explorer", component: ExplorerContent },
  { id: "settings", label: "Settings", component: SettingsContent },
]

export function SplitPaneSystem({ className, contentTypes = defaultContentTypes }: SplitPaneSystemProps) {
  const [root, setRoot] = React.useState<PaneNode>({
    id: generateId(),
    contentType: "dashboard",
  })

  const [dragState, setDragState] = React.useState<DragState | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const findNodeById = React.useCallback((node: PaneNode, id: PaneId): PaneNode | null => {
    if (node.id === id) return node
    if (isSplit(node)) {
      for (const child of node.children) {
        const found = findNodeById(child, id)
        if (found) return found
      }
    }
    return null
  }, [])

  const findParentOfNode = (node: PaneNode, targetId: PaneId): Split | null => {
    if (isSplit(node)) {
      if (node.children.some((child) => child.id === targetId)) {
        return node
      }
      for (const child of node.children) {
        const found = findParentOfNode(child, targetId)
        if (found) return found
      }
    }
    return null
  }

  const updateSplitSizes = (splitId: string, newSizes: number[]) => {
    setRoot((prevRoot) => {
      const cloneNode = (node: PaneNode): PaneNode => {
        if (isPane(node)) {
          return { ...node }
        }
        return {
          ...node,
          children: node.children.map(cloneNode),
          sizes: node.id === splitId ? [...newSizes] : [...node.sizes],
        }
      }

      return cloneNode(prevRoot)
    })
  }

  const handleMouseDown = (e: React.MouseEvent, splitId: string, handleIndex: number) => {
    e.preventDefault()
    const split = findNodeById(root, splitId) as Split
    if (!split) return

    setDragState({
      isDragging: true,
      splitId,
      handleIndex,
      startX: e.clientX,
      startY: e.clientY,
      startSizes: [...split.sizes],
    })

    // Add global cursor style
    document.body.style.cursor = split.direction === "horizontal" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
  }

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!dragState || !containerRef.current) return

      const split = findNodeById(root, dragState.splitId) as Split
      if (!split) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const isHorizontal = split.direction === "horizontal"

      const containerSize = isHorizontal ? containerRect.width : containerRect.height
      const currentPos = isHorizontal ? e.clientX : e.clientY
      const startPos = isHorizontal ? dragState.startX : dragState.startY
      const delta = currentPos - startPos
      const deltaPercent = (delta / containerSize) * 100

      const newSizes = [...dragState.startSizes]
      const leftIndex = dragState.handleIndex
      const rightIndex = dragState.handleIndex + 1

      // Calculate new sizes with constraints
      const minSize = 10 // Minimum 10% size
      const leftNewSize = Math.max(minSize, Math.min(90, newSizes[leftIndex] + deltaPercent))
      const rightNewSize = Math.max(minSize, Math.min(90, newSizes[rightIndex] - deltaPercent))

      // Only update if both panes meet minimum size requirements
      if (leftNewSize >= minSize && rightNewSize >= minSize) {
        newSizes[leftIndex] = leftNewSize
        newSizes[rightIndex] = rightNewSize
        updateSplitSizes(dragState.splitId, newSizes)
      }
    },
    [dragState, root, findNodeById],
  )

  const handleMouseUp = React.useCallback(() => {
    if (dragState) {
      setDragState(null)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [dragState])

  React.useEffect(() => {
    if (dragState?.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [dragState, handleMouseMove, handleMouseUp])

  const splitPane = (paneId: PaneId) => {
    setRoot((prevRoot) => {
      const cloneNode = (node: PaneNode): PaneNode => {
        if (isPane(node)) {
          return { ...node }
        }
        return {
          ...node,
          children: node.children.map(cloneNode),
          sizes: [...node.sizes],
        }
      }

      const newRoot = cloneNode(prevRoot)
      const targetNode = findNodeById(newRoot, paneId)

      if (!targetNode || !isPane(targetNode)) return prevRoot

      const parent = findParentOfNode(newRoot, paneId)
      const newPane: Pane = {
        id: generateId(),
        contentType: "dashboard",
      }

      const newSplit: Split = {
        id: generateId(),
        direction: "horizontal",
        children: [targetNode, newPane],
        sizes: [50, 50],
      }

      if (!parent) {
        // Root is being split
        return newSplit
      }

      // Replace the target pane with the new split
      const childIndex = parent.children.findIndex((child) => child.id === paneId)
      if (childIndex !== -1) {
        parent.children[childIndex] = newSplit
      }

      return newRoot
    })
  }

  const closePane = (paneId: PaneId) => {
    setRoot((prevRoot) => {
      const cloneNode = (node: PaneNode): PaneNode => {
        if (isPane(node)) {
          return { ...node }
        }
        return {
          ...node,
          children: node.children.map(cloneNode),
          sizes: [...node.sizes],
        }
      }

      const newRoot = cloneNode(prevRoot)
      const parent = findParentOfNode(newRoot, paneId)

      if (!parent) {
        // Cannot close the root pane if it is the only one
        if (isPane(newRoot)) return prevRoot
        return prevRoot
      }

      const childIndex = parent.children.findIndex((child) => child.id === paneId)
      if (childIndex === -1) return prevRoot

      // Remove the pane
      parent.children.splice(childIndex, 1)
      parent.sizes.splice(childIndex, 1)

      // Redistribute sizes
      if (parent.children.length > 0) {
        const totalSize = 100
        const sizePerChild = totalSize / parent.children.length
        parent.sizes = parent.children.map(() => sizePerChild)
      }

      // If parent has only one child left, replace parent with that child
      if (parent.children.length === 1) {
        const grandParent = findParentOfNode(newRoot, parent.id)
        if (grandParent) {
          const parentIndex = grandParent.children.findIndex((child) => child.id === parent.id)
          if (parentIndex !== -1) {
            grandParent.children[parentIndex] = parent.children[0]
          }
        } else {
          // Parent is root
          return parent.children[0]
        }
      }

      return newRoot
    })
  }

  const changePaneContent = (paneId: PaneId, contentType: ContentType) => {
    setRoot((prevRoot) => {
      const cloneNode = (node: PaneNode): PaneNode => {
        if (isPane(node)) {
          return { ...node }
        }
        return {
          ...node,
          children: node.children.map(cloneNode),
          sizes: [...node.sizes],
        }
      }

      const newRoot = cloneNode(prevRoot)
      const targetNode = findNodeById(newRoot, paneId)

      if (targetNode && isPane(targetNode)) {
        targetNode.contentType = contentType
      }

      return newRoot
    })
  }

  const renderNode = (node: PaneNode): React.ReactNode => {
    if (isPane(node)) {
      const contentConfig = contentTypes.find((ct) => ct.id === node.contentType)
      const ContentComponent = contentConfig?.component || (() => <div>Unknown content type</div>)

      return (
        <div key={node.id} className="relative flex flex-col flex-1 min-h-0 bg-background border rounded-lg">
          {/* Pane Header */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/50 rounded-t-lg">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  {contentConfig?.label || "Unknown"}
                  <ChevronDown className="m-2 h-2 w-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {contentTypes.map((ct) => (
                  <DropdownMenuItem
                    key={ct.id}
                    onClick={() => changePaneContent(node.id, ct.id)}
                    className={ct.id === node.contentType ? "bg-accent" : ""}
                  >
                    {ct.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => splitPane(node.id)}
                    >
                      <SquareSplitHorizontal className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Split</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Only show close button if there are multiple panes */}
              {(isSplit(root) || findParentOfNode(root, node.id)) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => closePane(node.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Pane Content */}
          <div className="flex-1 p-4 overflow-auto">
            <ContentComponent />
          </div>
        </div>
      )
    }

    return (
      <div
        key={node.id}
        className={cn("flex flex-1 min-h-0 gap-1", node.direction === "horizontal" ? "flex-row" : "flex-col")}
      >
        {node.children.map((child, index) => (
          <React.Fragment key={child.id}>
            <div
              className="flex min-h-0"
              style={{
                [node.direction === "horizontal" ? "width" : "height"]: `${node.sizes[index]}%`,
              }}
            >
              {renderNode(child)}
            </div>

            {/* Render resize handle between panes */}
            {index < node.children.length - 1 && (
              <div
                className={cn(
                  "group relative flex items-center justify-center -mx-1 -my-1",
                  node.direction === "horizontal"
                    ? "w-2 cursor-col-resize h-full"
                    : "h-2 cursor-row-resize w-full",
                )}
                onMouseDown={(e) => handleMouseDown(e, node.id, index)}
              >
                {/* Invisible interaction area that covers full height/width */}
                <div className="absolute z-10 inset-0" />

                {/* Visual handle with hover and drag states */}
                <div
                  className={cn(
                    "absolute flex items-center justify-center opacity-0 transition-all duration-300 ease-in-out",
                    node.direction === "horizontal" 
                      ? "w-1 h-16 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
                      : "h-1 w-16 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    dragState?.splitId === node.id && dragState?.handleIndex === index 
                      ? "opacity-100" 
                      : "group-hover:opacity-100",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full flex items-center justify-center transition-all duration-200 ease-in-out",
                      node.direction === "horizontal" 
                        ? "w-0.5 h-6" 
                        : "h-0.5 w-6",
                      dragState?.splitId === node.id && dragState?.handleIndex === index 
                        ? "bg-primary" 
                        : "bg-secondary group-hover:bg-accent",
                    )}
                  >
                    <GripVertical
                      className={cn(
                        "text-white/80 transition-all duration-200 ease-in-out",
                        node.direction === "horizontal" 
                          ? "h-3 w-1.5 rotate-0" 
                          : "h-1.5 w-3 rotate-90",
                        dragState?.splitId === node.id && dragState?.handleIndex === index 
                          ? "text-white" 
                          : "group-hover:text-white",
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn("flex flex-col h-full", className)}>
      {renderNode(root)}
    </div>
  )
}
