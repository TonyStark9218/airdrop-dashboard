"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  LogOut,
  Search,
  TrendingUp,
  Coins,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { logoutUser } from "@/lib/auth-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface SidebarNavProps {
  username: string
}

export function SidebarNav({ username }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutUser()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Community",
      href: "/dashboard/community",
      icon: MessageSquare,
    },
    {
      name: "News",
      href: "/dashboard/news",
      icon: Newspaper,
    },
    {
      name: "Explore",
      href: "/dashboard/explore",
      icon: Search,
    },
    {
      name: "Trending",
      href: "/dashboard/trending",
      icon: TrendingUp,
    },
  ]

  return (
    <Sidebar variant="floating" collapsible="icon" className="bg-[#0a0e17] border-r border-gray-800">
      <SidebarHeader className="border-b border-gray-800 py-5 bg-[#0a0e17]">
        <div className="flex items-center px-2">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CryptoTracker
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#0a0e17]">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">MAIN</h2>
            <SidebarMenu>
              {routes.map((route) => {
                const isActive = pathname === route.href
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={route.name}
                      className={cn(
                        "relative overflow-hidden transition-all",
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white font-medium"
                          : "text-gray-400 hover:text-gray-600",
                      )}
                    >
                      <Link href={route.href} className="flex items-center gap-2">
                        <route.icon
                          className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-400" : "text-gray-500")}
                        />
                        <span>{route.name}</span>
                        {isActive && <ChevronRight className="h-4 w-4 ml-auto text-blue-400" />}
                        {isActive && (
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-800 p-4 bg-[#0a0e17]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center border border-gray-700">
              <span className="text-white font-medium">{username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{username}</span>
              <span className="text-xs text-gray-400">User</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-gray-400 hover:text-white hover:bg-gray-800 relative"
              onClick={() =>
                toast({
                  title: "Coming Soon",
                  description: "Settings feature is not available yet",
                })
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <Badge className="ml-2 bg-yellow-600 text-[10px] py-0 px-1.5 absolute right-2">Coming Soon</Badge>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

