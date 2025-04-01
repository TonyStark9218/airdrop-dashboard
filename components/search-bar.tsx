"use client"

import type React from "react"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/explore?q=${encodeURIComponent(query)}`)
    }
  }

  const clearSearch = () => {
    setQuery("")
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <div className={`relative transition-all duration-300 ${isFocused ? "scale-105" : "scale-100"}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-md -z-10"></div>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${isFocused ? "text-blue-400" : "text-gray-400"}`}
          />
          <Input
            type="search"
            placeholder="Search for airdrops, projects, or users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-[#1a1f2e] border-gray-700 pl-10 pr-16 py-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className={`absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 h-8 transition-all duration-300 ${
              query.trim()
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gray-700 text-gray-400"
            }`}
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>
      </div>

      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] border border-gray-700 rounded-lg shadow-lg z-10 p-2">
          <div className="text-xs text-gray-400 px-2 py-1">Trending searches</div>
          <div className="space-y-1">
            {["Ethereum L2", "Solana Airdrops", "DeFi Tokens", "Gaming NFTs", "Retroactive"].map((item) => (
              <button
                key={item}
                type="button"
                className="flex items-center w-full px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 rounded-md"
                onClick={() => {
                  setQuery(item)
                  router.push(`/dashboard/explore?q=${encodeURIComponent(item)}`)
                }}
              >
                <Search className="h-3 w-3 mr-2 text-gray-500" />
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}

