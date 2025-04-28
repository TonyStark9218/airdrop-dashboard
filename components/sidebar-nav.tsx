"use client"
import { usePathname } from "next/navigation"
import type React from "react"

import {
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Search,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  X,
  Twitter,
  Github,
  Globe,
  Send,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Definisikan tipe untuk props
interface SidebarNavProps {
  username: string;
}

// Gunakan tipe pada komponen
export function SidebarNav({ username }: SidebarNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null)
  const { toggleSidebar } = useSidebar()

  const handleNavigation = (href: string) => {
    setLoadingRoute(href)
    router.push(href)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      toggleSidebar()
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
      disabled: true,
      disabledReason: "Under Maintenance",
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

  useEffect(() => {
    setLoadingRoute(null)
  }, [pathname])

  return (
    <Sidebar
      variant="floating"
      collapsible="offcanvas"
      className="bg-[#0a0e17] border-r border-gray-800 z-50"
      style={
        {
          "--sidebar-width": "250px",
          "--sidebar-width-mobile": "85vw",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="border-b border-gray-800 py-5 bg-[#0a0e17]">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Image src='/logo.png' alt="Logo" width={50} height={50} className="rounded-lg" />
            </div>
            <span className="text-2xl font-extrabold tracking-wide">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
                Orbit
              </span>
              <span className="text-3xl text-orange-500 ml-1 italic animate-pulse drop-shadow-[0_0_10px_rgba(255,125,0,0.8)]">
                X
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-[#0a0e17]">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="px-3 py-4">
            <h2 className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">MAIN</h2>
            <SidebarMenu>
              {routes.map((route) => {
                const isActive = pathname === route.href
                const isLoading = loadingRoute === route.href
                const isDisabled = route.disabled || false

                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isDisabled ? route.disabledReason : route.name}
                      className={cn(
                        "relative overflow-hidden transition-all py-3 px-4",
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white font-medium"
                          : isDisabled
                          ? "text-gray-600 cursor-not-allowed opacity-70"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                      )}
                    >
                      <button
                        onClick={() => {
                          if (isDisabled) {
                            toast({
                              title: "Under Maintenance",
                              description: "The Community section is currently under maintenance.",
                              variant: "destructive",
                            });
                            return;
                          }
                          handleNavigation(route.href);
                        }}
                        className="flex items-center gap-3 w-full text-left"
                        disabled={isDisabled || isLoading}
                      >
                        {isLoading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                        ) : (
                          <route.icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isActive ? "text-blue-400" : isDisabled ? "text-gray-500" : "text-gray-500"
                            )}
                          />
                        )}
                        <span className="text-base">{route.name}</span>
                        {isDisabled && (
                          <AlertCircle className="h-4 w-4 ml-auto text-yellow-400" />
                        )}
                        {isActive && !isDisabled && (
                          <ChevronRight className="h-4 w-4 ml-auto text-blue-400" />
                        )}
                        {isActive && !isDisabled && (
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full" />
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-800 p-4 bg-[#0a0e17]">
        <div className="flex flex-col gap-3">
          {/* Menampilkan username di footer */}
          <div className="text-center text-sm text-gray-400">
            Welcome, {username}
          </div>
          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 py-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Telegram</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Globe className="h-5 w-5" />
              <span className="sr-only">Website</span>
            </a>
          </div>
          {/* Copyright */}
          <div className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} AimTzy. All rights reserved.
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}