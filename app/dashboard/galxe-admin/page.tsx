"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { AnimatedElement } from "@/components/animated-element"
import { AnimatedButton } from "@/components/animated-button"
import { PageLoader } from "@/components/loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllQuests, deleteQuest, deleteMultipleQuests, updateQuestsStatus } from "@/lib/quest-service"
import type { Quest } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, parseISO } from "date-fns"

type SortField = "name" | "startDate" | "endDate" | "status" | "reward" | "participants" | "completionRate"
type SortDirection = "asc" | "desc"

export default function GalxeAdminPage() {
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedQuests, setSelectedQuests] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("startDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const itemsPerPage = 5

  // Fetch quests on component mount
  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await getAllQuests()

      if (response.success && response.data) {
        setQuests(response.data)
      } else {
        setError(response.error || "Failed to fetch quests")
      }
    } catch (err) {
      setError("An error occurred while fetching quests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchQuests()
    setIsRefreshing(false)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleSelectQuest = (id: string) => {
    setSelectedQuests((prev) => (prev.includes(id) ? prev.filter((questId) => questId !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedQuests.length === filteredQuests.length) {
      setSelectedQuests([])
    } else {
      setSelectedQuests(filteredQuests.map((quest) => quest.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedQuests.length) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await deleteMultipleQuests(selectedQuests)

      if (response.success) {
        setQuests((prev) => prev.filter((quest) => !selectedQuests.includes(quest.id)))
        setSelectedQuests([])
        setSuccess(`Successfully deleted ${selectedQuests.length} quests`)
      } else {
        setError(response.error || "Failed to delete quests")
      }
    } catch (err) {
      setError("An error occurred while deleting quests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteQuest = async (id: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await deleteQuest(id)

      if (response.success) {
        setQuests((prev) => prev.filter((quest) => quest.id !== id))
        setSuccess("Quest deleted successfully")
      } else {
        setError(response.error || "Failed to delete quest")
      }
    } catch (err) {
      setError("An error occurred while deleting the quest")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: "active" | "inactive") => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await updateQuestsStatus([id], newStatus)

      if (response.success) {
        setQuests((prev) => prev.map((quest) => (quest.id === id ? { ...quest, status: newStatus } : quest)))
        setSuccess(`Quest status updated to ${newStatus}`)
      } else {
        setError(response.error || "Failed to update quest status")
      }
    } catch (err) {
      setError("An error occurred while updating quest status")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter quests based on search term and status filter
  const filteredQuests = quests.filter(
    (quest) =>
      (quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || quest.status === statusFilter),
  )

  // Sort quests based on sort field and direction
  const sortedQuests = [...filteredQuests].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "startDate":
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        break
      case "endDate":
        comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        break
      case "status":
        comparison = a.status.localeCompare(b.status)
        break
      case "reward":
        comparison = a.rewardAmount - b.rewardAmount
        break
      case "participants":
        comparison = (a.participants || 0) - (b.participants || 0)
        break
      case "completionRate":
        comparison = (a.completionRate || 0) - (b.completionRate || 0)
        break
      default:
        comparison = 0
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  // Pagination
  const totalPages = Math.ceil(sortedQuests.length / itemsPerPage)
  const paginatedQuests = sortedQuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading && !isRefreshing) {
    return <PageLoader />
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-8">
        <AnimatedElement animation="fadeUp" delay={0.1}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">GALXE Admin</h1>
              <p className="text-gray-400 mt-1">Manage quests and track user participation</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/galxe-admin/add-quest">
                <AnimatedButton variant="gradient" className="group">
                  <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                </AnimatedButton>
              </Link>
              <AnimatedButton variant="outline" onClick={handleRefresh} className="relative" disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </AnimatedButton>
            </div>
          </div>
        </AnimatedElement>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 text-green-400 border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <AnimatedElement animation="fadeUp" delay={0.2}>
          <Card className="bg-[#151a23] border-gray-800 shadow-lg shadow-white/50 overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2 space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-xl text-white">Quest Management</CardTitle>
                <CardDescription>View and manage all created quests</CardDescription>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search quests..."
                    className="pl-10 bg-[#0f1218] border-gray-800 text-white w-full md:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-gray-800 text-gray-400">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1a1f2e] border-gray-800 text-gray-300">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className={statusFilter === "all" ? "bg-blue-600/20 text-white" : "hover:bg-gray-800"}
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={statusFilter === "active" ? "bg-blue-600/20 text-white" : "hover:bg-gray-800"}
                      onClick={() => setStatusFilter("active")}
                    >
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={statusFilter === "inactive" ? "bg-blue-600/20 text-white" : "hover:bg-gray-800"}
                      onClick={() => setStatusFilter("inactive")}
                    >
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="p-4 w-4">
                      <Checkbox
                        checked={selectedQuests.length === filteredQuests.length && filteredQuests.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("name")}>
                      Name
                      {sortField === "name" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("startDate")}>
                      Start Date
                      {sortField === "startDate" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("endDate")}>
                      End Date
                      {sortField === "endDate" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("status")}>
                      Status
                      {sortField === "status" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("reward")}>
                      Reward
                      {sortField === "reward" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("participants")}>
                      Participants
                      {sortField === "participants" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort("completionRate")}>
                      Completion Rate
                      {sortField === "completionRate" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="inline-block w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="inline-block w-4 h-4 ml-1" />
                        ))}
                    </th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuests.map((quest) => (
                    <tr
                      key={quest.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="w-4 p-4">
                        <Checkbox
                          checked={selectedQuests.includes(quest.id)}
                          onCheckedChange={() => toggleSelectQuest(quest.id)}
                        />
                      </td>
                      <th
                        scope="row"
                        className="flex items-center px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        <div className="text-base font-semibold">{quest.name}</div>
                      </th>
                      <td className="px-4 py-2">{format(parseISO(quest.startDate), "MMM dd, yyyy")}</td>
                      <td className="px-4 py-2">{format(parseISO(quest.endDate), "MMM dd, yyyy")}</td>
                      <td className="px-4 py-2">
                        <Badge variant={quest.status === "active" ? "default" : "secondary"}>{quest.status}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        {quest.rewardAmount} {quest.rewardType}
                      </td>
                      <td className="px-4 py-2">{quest.participants}</td>
                      <td className="px-4 py-2">{quest.completionRate}%</td>
                      <td className="px-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1f2e] border-gray-800 text-gray-300">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/galxe-admin/edit-quest/${quest.id}`)}
                              className="hover:bg-gray-800"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteQuest(quest.id)} className="hover:bg-gray-800">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(quest.id, quest.status === "active" ? "inactive" : "active")
                              }
                              className="hover:bg-gray-800"
                            >
                              {quest.status === "active" ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </AnimatedElement>

        <AnimatedElement animation="fadeUp" delay={0.3}>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-gray-800 text-gray-400"
            >
              Previous
            </Button>
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-gray-800 text-gray-400"
            >
              Next
            </Button>
          </div>
        </AnimatedElement>

        {selectedQuests.length > 0 && (
          <AnimatedElement animation="fadeUp" delay={0.4}>
            <div className="flex items-center justify-between p-4 bg-[#151a23] border-gray-800 rounded-md">
              <span className="text-gray-400">{selectedQuests.length} quest(s) selected</span>
              <Button variant="destructive" onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-500">
                Delete Selected
              </Button>
            </div>
          </AnimatedElement>
        )}
      </div>
    </div>
  )
}
