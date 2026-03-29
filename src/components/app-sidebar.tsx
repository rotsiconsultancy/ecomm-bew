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
  LogOut,
  ChevronRight,
  AwardIcon,
  ShoppingBag,
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
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const items = [
  { title: "Dashboard",  url: "/admin/dashboard",            icon: LayoutDashboard },
  { title: "Products",   url: "/admin/product-management",   icon: Package },
  { title: "Orders",     url: "/admin/order-management",     icon: ShoppingCart },
  { title: "Quotes",     url: "/admin/quote-management",     icon: MessageSquare },
  { title: "Carts",      url: "/admin/cart-management",      icon: Warehouse },
  { title: "Users",      url: "/admin/user-management",      icon: Users },
  { title: "Content",    url: "/admin/content-management",   icon: FileText },
  { title: "Social Media", url: "/admin/social-media",    icon: MessageSquare },
  { title: "Points",    url: "/admin/points",   icon: AwardIcon },
  { title: "Checkout",  url: "/admin/checkout", icon: ShoppingBag },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface AppSidebarProps {
  userName: string
  userEmail: string
  userRole: string
}

export function AppSidebar({ userName, userEmail, userRole }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useSidebar()
  const supabase = createClient()

  const initials = getInitials(userName)
  const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Sidebar className="bg-sidebar border-r-0 shadow-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-9 h-9 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Bewama logo" width={36} height={36} className="object-contain" />
          </div>
          {state !== "collapsed" && (
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">BEWAMA</h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold mt-0.5">Admin Panel</p>
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
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">
              {initials}
            </div>
            {state !== "collapsed" && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{roleLabel}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-slate-400 hover:text-red-400 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}