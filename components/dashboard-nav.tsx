"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bell, Settings, User, ChevronDown, Menu, X, BarChart3, LogOut, UserCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { logoutUser } from "@/lib/auth-actions"
import { useToast } from "@/hooks/use-toast"

interface DashboardNavProps {
  username: string
}

export function DashboardNav({ username }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = username === "AimTzy"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Reset loading state when pathname changes
  useEffect(() => {
    setLoadingRoute(null)
  }, [pathname])

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

  const handleNavigation = (href: string) => {
    if (href === "#") return // Don't navigate for disabled items
    setLoadingRoute(href)
    router.push(href)
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false)
    }
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      title: "GALXE",
      href: isAdmin ? "/dashboard/galxe-admin" : "/dashboard/galxe-user",
      active: pathname.includes("/dashboard/galxe"),
    },
    {
      title: "Leaderboard",
      href: "#",
      disabled: true,
      comingSoon: true,
      active: false,
    },
    {
      title: "Market",
      href: "#",
      disabled: true,
      comingSoon: true,
      active: false,
    },
    {
      title: "Transfer",
      href: "#",
      disabled: true,
      comingSoon: true,
      active: false,
    },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "hidden md:flex items-center justify-between sticky top-0 z-30 px-6 py-4 transition-all duration-300",
          isScrolled ? "bg-[#1a1f2e]/80 backdrop-blur-md border-b border-gray-700/50 shadow-lg" : "bg-transparent",
        )}
      >
        <div className="flex items-center space-x-6">
          <div className="mr-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src='/logo.png' alt="Logo" width={50} height={50} className="rounded-lg" />
              <span className="text-2xl font-extrabold tracking-wide">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
                Orbit
              </span>
              <span className="text-3xl text-orange-500 ml-1 italic animate-pulse drop-shadow-[0_0_10px_rgba(255,125,0,0.8)]">
                X
              </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                disabled={item.disabled || loadingRoute === item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  item.active
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                  item.disabled && "opacity-70 cursor-not-allowed",
                )}
              >
                {loadingRoute === item.href ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {item.title}
                {item.comingSoon && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          <Link href='/dashboard/settings'>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
          </Link>

          <div className="flex items-center ml-2 pl-4 border-l border-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-gray-800/50">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-white">{username}</span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a1f2e] border-gray-700 text-white">
                <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-not-allowed opacity-70">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
                    Soon
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-not-allowed opacity-70">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Leaderboard</span>
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
                    Soon
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-pointer"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 sticky top-0 z-30 transition-all duration-300",
            isScrolled ? "bg-[#1a1f2e]/80 backdrop-blur-md border-b border-gray-700/50 shadow-md" : "bg-transparent",
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
              <Image src='/logo.png' alt="Logo" width={50} height={50} className="rounded-lg" />
              <span className="text-2xl font-extrabold tracking-wide">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
                Orbit
              </span>
              <span className="text-3xl text-orange-500 ml-1 italic animate-pulse drop-shadow-[0_0_10px_rgba(255,125,0,0.8)]">
                X
              </span>
              </span>
            </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a1f2e] border-gray-700 text-white">
                <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-not-allowed opacity-70">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
                    Soon
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-not-allowed opacity-70">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Leaderboard</span>
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
                    Soon
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-pointer"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#1a1f2e] border-b border-gray-700 overflow-hidden"
            >
              <div className="px-4 py-2 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    disabled={item.disabled || loadingRoute === item.href}
                    className={cn(
                      "flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      item.active
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                      item.disabled && "opacity-70 cursor-not-allowed",
                    )}
                  >
                    {loadingRoute === item.href ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {item.title}
                    {item.comingSoon && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full">
                        Soon
                      </span>
                    )}
                  </button>
                ))}

                <div className="pt-2 mt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{username}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <Bell className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
