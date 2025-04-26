"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, ArrowDownAZ, Check, X, Calendar, Wallet } from "lucide-react"
import { getAirdrops } from "@/lib/airdrop-actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export async function DashboardControls({ userId }: { userId: string }) {
  const airdrops = await getAirdrops(userId)

  // Get unique chains and types for filters
  const chains = Array.from(new Set(airdrops.map((airdrop) => airdrop.chain || "ethereum"))).sort()
  const types = Array.from(new Set(airdrops.map((airdrop) => airdrop.type))).sort()

  return <ClientDashboardControls chains={chains} types={types} />
}

function ClientDashboardControls({
  chains,
  types,
}: {
  chains: string[]
  types: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [activeFilters, setActiveFilters] = useState<{
    status?: string
    chain?: string
    type?: string
  }>({
    status: searchParams.get("status") || undefined,
    chain: searchParams.get("chain") || undefined,
    type: searchParams.get("type") || undefined,
  })

  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (activeFilters.status) params.set("status", activeFilters.status)
    if (activeFilters.chain) params.set("chain", activeFilters.chain)
    if (activeFilters.type) params.set("type", activeFilters.type)
    if (sortBy) params.set("sort", sortBy)

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : "/dashboard")
  }, [search, activeFilters, sortBy, router])

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The URL update is handled by the useEffect
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({})
    setSortBy("newest")
    setSearch("")
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-xl font-medium text-white">Your Airdrops</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search airdrops..."
            className="pl-10 bg-[#0f1623] border-gray-700 text-white w-full sm:w-[200px] focus:w-full sm:focus:w-[300px] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white relative"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-600 text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] bg-[#1a1f2e] border-gray-700 text-white p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Filters</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-300">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeFilters.status === "completed" ? "default" : "outline"}
                      size="sm"
                      className={`text-xs h-7 ${
                        activeFilters.status === "completed"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-transparent border-gray-700 text-gray-300"
                      }`}
                      onClick={() =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          status: prev.status === "completed" ? undefined : "completed",
                        }))
                      }
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </Button>
                    <Button
                      variant={activeFilters.status === "active" ? "default" : "outline"}
                      size="sm"
                      className={`text-xs h-7 ${
                        activeFilters.status === "active"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-transparent border-gray-700 text-gray-300"
                      }`}
                      onClick={() =>
                        setActiveFilters((prev) => ({
                          ...prev,
                          status: prev.status === "active" ? undefined : "active",
                        }))
                      }
                    >
                      <X className="h-3 w-3 mr-1" />
                      Active
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-300">Chain</h4>
                  <div className="flex flex-wrap gap-2">
                    {chains.map((chain) => (
                      <Button
                        key={chain}
                        variant={activeFilters.chain === chain ? "default" : "outline"}
                        size="sm"
                        className={`text-xs h-7 capitalize ${
                          activeFilters.chain === chain
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-transparent border-gray-700 text-gray-300"
                        }`}
                        onClick={() =>
                          setActiveFilters((prev) => ({
                            ...prev,
                            chain: prev.chain === chain ? undefined : chain,
                          }))
                        }
                      >
                        {chain}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-300">Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {types.map((type) => (
                      <Button
                        key={type}
                        variant={activeFilters.type === type ? "default" : "outline"}
                        size="sm"
                        className={`text-xs h-7 capitalize ${
                          activeFilters.type === type
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-transparent border-gray-700 text-gray-300"
                        }`}
                        onClick={() =>
                          setActiveFilters((prev) => ({
                            ...prev,
                            type: prev.type === type ? undefined : type,
                          }))
                        }
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowDownAZ className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1a1f2e] border-gray-700 text-white">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={sortBy === "newest" ? "bg-gray-800" : ""}
                  onClick={() => setSortBy("newest")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Newest First</span>
                  {sortBy === "newest" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy === "oldest" ? "bg-gray-800" : ""}
                  onClick={() => setSortBy("oldest")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Oldest First</span>
                  {sortBy === "oldest" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy === "name-asc" ? "bg-gray-800" : ""}
                  onClick={() => setSortBy("name-asc")}
                >
                  <ArrowDownAZ className="h-4 w-4 mr-2" />
                  <span>Name (A-Z)</span>
                  {sortBy === "name-asc" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy === "name-desc" ? "bg-gray-800" : ""}
                  onClick={() => setSortBy("name-desc")}
                >
                  <ArrowDownAZ className="h-4 w-4 mr-2 rotate-180" />
                  <span>Name (Z-A)</span>
                  {sortBy === "name-desc" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy === "value-high" ? "bg-gray-800" : ""}
                  onClick={() => setSortBy("value-high")}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>Value (High-Low)</span>
                  {sortBy === "value-high" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortBy === "value-low" ? "bg-gray-800" : ""}
                  onClick={() => setSortBy("value-low")}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>Value (Low-High)</span>
                  {sortBy === "value-low" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
