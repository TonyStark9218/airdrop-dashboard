"use client"

import { useState } from "react"
import { searchUsers } from "@/lib/community-actions"
import type { UserSearchResult } from "@/lib/types"
import { Search, UserIcon } from "lucide-react"

interface UserSearchProps {
  currentUserId: string
}

export default function UserSearch({ currentUserId }: UserSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || query.length < 2) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await searchUsers(query)
      if (response.success) {
        // Filter out the current user from results
        const filteredResults = response.users.filter((user) => user._id !== currentUserId)
        setResults(filteredResults)
      } else {
        console.error("Search error:", response.message)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || query.length < 2}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            {results.length > 0 ? `Found ${results.length} user${results.length === 1 ? "" : "s"}` : "No users found"}
          </h3>

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((user) => (
                <div key={user._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-700 rounded-full p-2">
                      <UserIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{user.username}</h4>
                      <p className="text-sm text-gray-400">User ID: {user._id.substring(0, 8)}...</p>
                    </div>
                  </div>

                  <button
                    className="bg-blue-600 text-white text-sm rounded-lg px-3 py-1 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => alert("Connect feature coming soon!")}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

