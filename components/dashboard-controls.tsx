"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, ArrowDownAZ, Check, X, Calendar, Wallet } from "lucide-react"
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
import type { AirdropDocument } from "@/lib/models/airdrop"

interface DashboardControlsProps {
  airdrops: AirdropDocument[]
  onFiltersChange: (filteredAirdrops: AirdropDocument[]) => void
}

export function DashboardControls({ airdrops, onFiltersChange }: DashboardControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract unique chains and types
  const chainSet = new Set<string>()
  const typeSet = new Set<string>()

  airdrops.forEach((airdrop) => {
    chainSet.add(airdrop.chain || "ethereum")
    if (airdrop.type) typeSet.add(airdrop.type)
  })

  const chains = Array.from(chainSet).sort()
  const types = Array.from(typeSet).sort()

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

  // Apply filters and sorting
  useEffect(() => {
    let result = [...airdrops]

    // Apply search
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (airdrop) =>
          airdrop.name.toLowerCase().includes(query) ||
          (airdrop.description && airdrop.description.toLowerCase().includes(query)) ||
          (airdrop.chain && airdrop.chain.toLowerCase().includes(query)) ||
          (airdrop.type && airdrop.type.toLowerCase().includes(query)),
      )
    }

    // Apply status filter
    if (activeFilters.status) {
      if (activeFilters.status === "completed") {
        result = result.filter((airdrop) => airdrop.completed)
      } else if (activeFilters.status === "active") {
        result = result.filter((airdrop) => !airdrop.completed)
      }
    }

    // Apply chain filter
    if (activeFilters.chain) {
      result = result.filter(
        (airdrop) => (airdrop.chain || "ethereum").toLowerCase() === activeFilters.chain?.toLowerCase(),
      )
    }

    // Apply type filter
    if (activeFilters.type) {
      result = result.filter(
        (airdrop) => airdrop.type && airdrop.type.toLowerCase() === activeFilters.type?.toLowerCase(),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "value-high":
        // This is a placeholder - you might want to implement your own value logic
        result.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
        break
      case "value-low":
        // This is a placeholder - you might want to implement your own value logic
        result.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0))
        break
    }

    // Update URL
    const params = new URLSearchParams(searchParams.toString())

    if (search) params.set("search", search)
    else params.delete("search")

    if (activeFilters.status) params.set("status", activeFilters.status)
    else params.delete("status")

    if (activeFilters.chain) params.set("chain", activeFilters.chain)
    else params.delete("chain")

    if (activeFilters.type) params.set("type", activeFilters.type)
    else params.delete("type")

    if (sortBy && sortBy !== "newest") params.set("sort", sortBy)
    else params.delete("sort")

    const queryString = params.toString()
    router.replace(queryString ? `?${queryString}` : "/dashboard", { scroll: false })

    // Pass filtered airdrops to parent component
    onFiltersChange(result)
  }, [search, activeFilters, sortBy, airdrops, router, searchParams, onFiltersChange])

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
