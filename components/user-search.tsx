"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { searchUsers } from "@/lib/community-actions"
import type { UserSearchResult } from "@/lib/types"
import { Search, Users, X, Check, MessageSquare, UserPlus, Filter, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface UserSearchProps {
  currentUserId: string
}

type UserStatus = "online" | "away" | "offline"
type UserRole = "admin" | "moderator" | "member"

interface EnhancedUserResult extends UserSearchResult {
  status: UserStatus
  role: UserRole
  bio?: string
  joinedDate?: string
  connections?: number
  isFollowing?: boolean
  avatarUrl?: string
}

export default function UserSearch({ currentUserId }: UserSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<EnhancedUserResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const { toast } = useToast()

  // Mock popular users for suggestions
  const popularUsers: EnhancedUserResult[] = [
    {
      _id: "user1",
      username: "CryptoWhale",
      status: "online",
      role: "admin",
      bio: "Crypto investor since 2013. Bitcoin maximalist.",
      joinedDate: "2022-01-15",
      connections: 1243,
      isFollowing: true,
      avatarUrl: "/avatars/crypto-whale.jpg",
    },
    {
      _id: "user2",
      username: "EthereumQueen",
      status: "online",
      role: "moderator",
      bio: "ETH developer and DeFi enthusiast",
      joinedDate: "2022-03-22",
      connections: 876,
      isFollowing: false,
      avatarUrl: "/avatars/eth-queen.jpg",
    },
    {
      _id: "user3",
      username: "AirdropHunter",
      status: "away",
      role: "member",
      bio: "Finding the best airdrops since 2021",
      joinedDate: "2022-05-10",
      connections: 542,
      isFollowing: true,
      avatarUrl: "/avatars/airdrop-hunter.jpg",
    },
    {
      _id: "user4",
      username: "TokenTrader",
      status: "offline",
      role: "member",
      bio: "Full-time crypto trader and analyst",
      joinedDate: "2022-02-18",
      connections: 329,
      isFollowing: false,
      avatarUrl: "/avatars/token-trader.jpg",
    },
  ]

  useEffect(() => {
    // Show popular users when no search is performed
    if (!hasSearched) {
      setResults(popularUsers)
    }
  }, [hasSearched])

  const handleSearch = async () => {
    if (!query.trim() || query.length < 2) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await searchUsers(query)
      if (response.success) {
        // Filter out the current user from results
        const filteredResults = response.users
          .filter((user) => user._id !== currentUserId)
          .map((user) => ({
            ...user,
            status: ["online", "away", "offline"][Math.floor(Math.random() * 3)] as UserStatus,
            role: ["admin", "moderator", "member"][Math.floor(Math.random() * 3)] as UserRole,
            bio: `Crypto enthusiast and blockchain explorer`,
            joinedDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split("T")[0],
            connections: Math.floor(Math.random() * 1000),
            isFollowing: Math.random() > 0.5,
          }))
        setResults(filteredResults)
      } else {
        console.error("Search error:", response.message)
        toast({
          title: "Search Error",
          description: response.message || "Failed to search users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleConnect = (userId: string) => {
    // Toggle connection status
    setResults((prev) => prev.map((user) => (user._id === userId ? { ...user, isFollowing: !user.isFollowing } : user)))

    // Show toast
    const user = results.find((u) => u._id === userId)
    if (user) {
      toast({
        title: user.isFollowing ? "Disconnected" : "Connected",
        description: user.isFollowing
          ? `You are no longer following ${user.username}`
          : `You are now following ${user.username}`,
      })
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = () => {
    if (selectedUsers.length < 2) {
      toast({
        title: "Select more users",
        description: "Please select at least 2 users to create a group",
        variant: "destructive",
      })
      return
    }

    const selectedUsernames = results
      .filter((user) => selectedUsers.includes(user._id))
      .map((user) => user.username)
      .join(", ")

    toast({
      title: "Group created",
      description: `Created a group with ${selectedUsernames}`,
    })

    setSelectedUsers([])
  }

  const filteredResults = results.filter((user) => {
    if (activeTab === "all") return statusFilter === "all" || user.status === statusFilter
    if (activeTab === "following") return user.isFollowing && (statusFilter === "all" || user.status === statusFilter)
    if (activeTab === "suggested") return !user.isFollowing && (statusFilter === "all" || user.status === statusFilter)
    return true
  })

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
    }
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/20 text-red-300 border-red-600 text-xs">Admin</Badge>
      case "moderator":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-600 text-xs">Mod</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyDown}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading || query.length < 2}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 min-w-[100px]"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin mx-auto" />
            ) : (
              "Search"
            )}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 text-gray-400 hover:text-white"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3 w-48"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Status</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between border-gray-700 bg-gray-900">
                            <span className="flex items-center gap-2">
                              {statusFilter === "all" ? (
                                "All Statuses"
                              ) : (
                                <>
                                  <span
                                    className={`h-2 w-2 rounded-full ${getStatusColor(statusFilter as UserStatus)}`}
                                  />
                                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                </>
                              )}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full bg-gray-800 border-gray-700">
                          <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("online")}>
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                            Online
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("away")}>
                            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                            Away
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusFilter("offline")}>
                            <span className="h-2 w-2 rounded-full bg-gray-500 mr-2" />
                            Offline
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">{selectedUsers.length} selected</Badge>
            <span className="text-sm text-gray-300">{selectedUsers.length === 1 ? "User" : "Users"} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setSelectedUsers([])}
            >
              Clear
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateGroup}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
            All Users
          </TabsTrigger>
          <TabsTrigger value="following" className="data-[state=active]:bg-gray-700">
            Following
          </TabsTrigger>
          <TabsTrigger value="suggested" className="data-[state=active]:bg-gray-700">
            Suggested
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <UserList
            users={filteredResults}
            isLoading={isLoading}
            onConnect={handleConnect}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
          />
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <UserList
            users={filteredResults}
            isLoading={isLoading}
            onConnect={handleConnect}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            emptyMessage="You're not following anyone yet"
          />
        </TabsContent>

        <TabsContent value="suggested" className="mt-4">
          <UserList
            users={filteredResults}
            isLoading={isLoading}
            onConnect={handleConnect}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            emptyMessage="No suggested users found"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface UserListProps {
  users: EnhancedUserResult[]
  isLoading: boolean
  onConnect: (userId: string) => void
  selectedUsers: string[]
  onSelectUser: (userId: string) => void
  emptyMessage?: string
}

function UserList({
  users,
  isLoading,
  onConnect,
  selectedUsers,
  onSelectUser,
  emptyMessage = "No users found",
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
        <Users className="h-12 w-12 mx-auto text-gray-500 mb-3" />
        <h3 className="text-lg font-medium text-white mb-1">{emptyMessage}</h3>
        <p className="text-gray-400">Try adjusting your search or filters</p>
      </div>
    )
  }

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
    }
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/20 text-red-300 border-red-600 text-xs">Admin</Badge>
      case "moderator":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-600 text-xs">Mod</Badge>
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <div
          key={user._id}
          className={`bg-gray-800 rounded-lg p-4 flex items-center justify-between border ${
            selectedUsers.includes(user._id) ? "border-blue-500" : "border-gray-700"
          } transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-700 text-gray-300">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">{user.username}</h4>
                {getRoleBadge(user.role)}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{user.connections} connections</span>
                <span>•</span>
                <span>Joined {new Date(user.joinedDate || "").toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-md ${
                selectedUsers.includes(user._id) ? "bg-blue-600/30 text-blue-300" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => onSelectUser(user._id)}
            >
              {selectedUsers.includes(user._id) ? <Check className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </Button>

            <Button
              variant={user.isFollowing ? "outline" : "default"}
              size="sm"
              className={user.isFollowing ? "border-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}
              onClick={() => onConnect(user._id)}
            >
              {user.isFollowing ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
