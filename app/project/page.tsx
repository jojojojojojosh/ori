import { AppSidebar } from "@/components/app-sidebar"
import { SplitPaneSystem } from "@/components/split-pane-system"
import { ProtectedRoute } from "@/components/protected-route"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-2 shrink-0 items-center gap-2 transition-[height,width] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-2"></header>
          <div className="flex-1 p-2 pt-0">
            <SplitPaneSystem className="h-full" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
