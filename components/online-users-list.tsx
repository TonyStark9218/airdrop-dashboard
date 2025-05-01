"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSocket } from "@/hooks/use-socket"
import type { UserStatus } from "@/lib/types"

interface OnlineUser {
  _id: string
  username: string
  profilePicture?: string
  status: UserStatus
  role: "admin" | "moderator" | "member"
}

export interface OnlineUsersListProps {
  userId: string
  username: string
  className?: string
}

export function OnlineUsersList({ userId, username, className }: OnlineUsersListProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { socket, isConnected } = useSocket(userId, username)

  // Fetch online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch("/api/users/online")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.onlineUsers) {
            setOnlineUsers(data.onlineUsers)
          }
        }
      } catch (error) {
        console.error("Error fetching online users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isConnected) {
      fetchOnlineUsers()
    }

    // Refresh online users every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000)
    return () => clearInterval(interval)
  }, [isConnected])

  // Listen for user status changes
  useEffect(() => {
    if (!socket) return

    const handleStatusChange = (data: { userId: string; status: UserStatus }) => {
      setOnlineUsers((prev) => prev.map((user) => (user._id === data.userId ? { ...user, status: data.status } : user)))
    }

    const handleUserConnected = (data: { userId: string; username: string }) => {
      // Check if user already exists in the list
      const userExists = onlineUsers.some((user) => user._id === data.userId)

      if (!userExists) {
        setOnlineUsers((prev) => [
          ...prev,
          {
            _id: data.userId,
            username: data.username,
            status: "online",
            role: "member", // Default role
          },
        ])
      }
    }

    const handleUserDisconnected = (data: { userId: string }) => {
      setOnlineUsers((prev) => prev.map((user) => (user._id === data.userId ? { ...user, status: "offline" } : user)))
    }

    socket.on("user-status-change", handleStatusChange)
    socket.on("user-connected", handleUserConnected)
    socket.on("user-disconnected", handleUserDisconnected)

    return () => {
      if (socket) {
        socket.off("user-status-change", handleStatusChange)
        socket.off("user-connected", handleUserConnected)
        socket.off("user-disconnected", handleUserDisconnected)
      }
    }
  }, [socket, onlineUsers])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="ml-2 bg-red-500/20 text-red-300 border-red-600 text-xs">Admin</Badge>
      case "moderator":
        return <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-600 text-xs">Mod</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-3 p-3 ${className}`}>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Members</h3>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Members ({onlineUsers.length})</h3>
        <Badge variant="outline" className="text-xs bg-green-900/30 text-green-300 border-green-800">
          {onlineUsers.filter((user) => user.status === "online").length} online
        </Badge>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {onlineUsers.map((user) => (
          <div key={user._id} className="flex items-center justify-between group hover:bg-gray-800/50 p-1 rounded-md">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-700 text-gray-300">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-gray-800 ${getStatusColor(
                    user.status,
                  )}`}
                />
              </div>
              <div className="flex items-center">
                <span className="text-sm text-white">{user.username}</span>
                {getRoleBadge(user.role)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
