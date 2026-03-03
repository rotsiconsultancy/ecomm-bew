"use client"

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Warehouse,
  Factory,
  LogOut,
  ChevronRight
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/admin/product-management",
    icon: Package,
  },
  {
    title: "Inventory",
    url: "/admin/inventory", // Mapping to inventory
    icon: Warehouse,
  },
  {
    title: "Orders",
    url: "/admin/order-management",
    icon: ShoppingCart,
  },
  {
    title: "Quotes",
    url: "/admin/quote-management",
    icon: MessageSquare,
  },
  {
    title: "Users",
    url: "/admin/user-management",
    icon: Users,
  },
  {
    title: "Content",
    url: "/admin/content-management",
    icon: FileText,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar className="bg-sidebar border-r-0 shadow-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <Factory className="w-5 h-5 text-white" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">BEWAMA</h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">Industrial Solutions</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "h-11 px-4 rounded-xl transition-all font-medium",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-slate-400")} />
                        <span>{item.title}</span>
                        {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 px-4 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <Link href="/admin/settings">
                <Settings className="w-5 h-5 mr-3 text-slate-400" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-inner">
              JD
            </div>
            {state !== "collapsed" && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">John Doe</p>
                <p className="text-[10px] text-slate-400 truncate tracking-tight">Super Admin</p>
              </div>
            )}
            <button className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
