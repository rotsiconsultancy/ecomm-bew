import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Search, Bell, HelpCircle } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Modern Header */}
        <header className="h-16 bg-white dark:bg-background/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger className="text-secondary" />

            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                placeholder="Search components, orders, quotes..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-background"></span>
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-secondary dark:text-slate-200 leading-tight">Admin Dashboard</span>
              <span className="text-[10px] text-slate-400 font-medium">v1.2.0</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
