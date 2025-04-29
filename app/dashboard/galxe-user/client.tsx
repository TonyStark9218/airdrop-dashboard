// app/dashboard/galxe-user/client.tsx
"use client"

import { useState, useEffect } from "react"
import { updateQuestCompletion } from "@/lib/quest-service"
import type { Quest, QuestCompletion, Session } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { AnimatedElement } from "@/components/animated-element"
import { PageLoader } from "@/components/loading-spinner"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ExternalLink,
  Search,
  Info,
  CheckCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  Award,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function GalxeUserClient({
  session,
  initialQuests,
  initialCompletions,
  initialError,
}: {
  session: Session
  initialQuests: Quest[]
  initialCompletions: QuestCompletion[]
  initialError?: string
}) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [completions, setCompletions] = useState<QuestCompletion[]>(initialCompletions)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [expandedQuests, setExpandedQuests] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all")
  const [isLoading, setIsLoading] = useState(true) // Mulai dengan loading true
  const [error, setError] = useState<string | null>(initialError || null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0) // Progress bar state

  // Simulasi loading dengan progress bar
  useEffect(() => {
    // If we already have data from server-side props, simulate loading
    if (initialQuests.length > 0 || initialCompletions.length > 0) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsLoading(false)
            return 100
          }
          return prev + 10
        })
      }, 200)

      return () => clearInterval(interval)
    } else {
      // If no initial data, we need to handle the error more gracefully
      setIsLoading(false)
      if (initialError) {
        setError(`Error loading quests: ${initialError}`)
      }
    }
  }, [initialQuests, initialCompletions, initialError])

  // Bersihin error kalo nggak ada error baru
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 5000) // Hilangin error setelah 5 detik
    return () => clearTimeout(timer)
  }, [error])

  const toggleQuestExpansion = (id: string) => {
    setExpandedQuests((prev) => (prev.includes(id) ? prev.filter((questId) => questId !== id) : [...prev, id]))
  }

  const toggleQuestCompletion = async (questId: string, currentStatus: boolean) => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await updateQuestCompletion(session.userId, {
        questId,
        completed: !currentStatus,
      })

      if (response.success && response.data) {
        setCompletions((prev) => {
          const existingIndex = prev.findIndex((c) => c.questId === questId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = response.data!
            return updated
          } else {
            return [...prev, response.data!]
          }
        })
        setSuccess(`Quest marked as ${!currentStatus ? "completed" : "pending"}`)
      } else {
        setError(response.error || "Failed to update quest status")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestCompletionStatus = (questId: string): boolean => {
    const completion = completions.find((c) => c.questId === questId)
    return completion?.completed || false
  }

  const filteredQuests = quests.filter((quest) => {
    if (quest.status !== "active") return false

    const matchesSearch =
      quest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchTerm.toLowerCase())

    const isCompleted = getQuestCompletionStatus(quest.id)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && isCompleted) ||
      (statusFilter === "pending" && !isCompleted)

    return matchesSearch && matchesStatus
  })

  const totalQuests = quests.filter((q) => q.status === "active").length
  const completedQuests = completions.filter((c) => c.completed).length
  const completionPercentage = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0

  const retryLoading = async () => {
    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)

    try {
      // Simulate progress while fetching
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 5, 90))
      }, 200)

      // Fetch quests directly from client side as a fallback
      const response = await fetch("/api/quests")
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data && Array.isArray(data)) {
        // Update quests state with the fetched data
        setQuests(data)

        // Also try to fetch completions
        const completionsResponse = await fetch(`/api/users/${session.userId}/quest-completions`)
        if (completionsResponse.ok) {
          const completionsData = await completionsResponse.json()
          if (completionsData && Array.isArray(completionsData)) {
            setCompletions(completionsData)
          }
        }

        setSuccess("Data loaded successfully!")
      } else {
        throw new Error("Invalid data format received from API")
      }

      clearInterval(progressInterval)
      setLoadingProgress(100)
      setTimeout(() => setIsLoading(false), 500)
    } catch (err) {
      setError(`Failed to load data: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container min-h-screen py-8 flex flex-col items-center justify-center">
        <PageLoader />
        <div className="w-full max-w-md mt-4">
          <Progress
            value={loadingProgress}
            className="h-2 bg-gray-800"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
          />
          <p className="text-gray-400 text-center mt-2">Loading quests... {loadingProgress}%</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container min-h-screen py-8">
      <div className="space-y-8">
        <AnimatedElement animation="fadeUp" delay={0.1}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">GALXE Quests</h1>
              <p className="text-gray-400 mt-1">Complete quests to earn rewards</p>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search quests..."
                className="pl-10 bg-[#0f1218] border-gray-800 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </AnimatedElement>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{error}</span>
              <button
                onClick={retryLoading}
                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm self-start mt-2"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 text-green-400 border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <AnimatedElement animation="fadeUp" delay={0.2}>
              <Card className="bg-[#151a23] border-gray-800 shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <CardTitle className="text-xl text-white">Available Quests</CardTitle>
                      <CardDescription>Complete these quests to earn rewards</CardDescription>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Badge
                        variant={statusFilter === "all" ? "default" : "outline"}
                        className={statusFilter === "all" ? "bg-blue-600" : "border-gray-800 hover:border-gray-700"}
                        onClick={() => setStatusFilter("all")}
                      >
                        All
                      </Badge>
                      <Badge
                        variant={statusFilter === "completed" ? "default" : "outline"}
                        className={
                          statusFilter === "completed" ? "bg-green-600" : "border-gray-800 hover:border-gray-700"
                        }
                        onClick={() => setStatusFilter("completed")}
                      >
                        Completed
                      </Badge>
                      <Badge
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        className={
                          statusFilter === "pending" ? "bg-yellow-600" : "border-gray-800 hover:border-gray-700"
                        }
                        onClick={() => setStatusFilter("pending")}
                      >
                        Pending
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredQuests.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No quests found matching your search</div>
                    ) : (
                      filteredQuests.map((quest, index) => {
                        const isCompleted = getQuestCompletionStatus(quest.id)

                        return (
                          <AnimatedElement key={quest.id} animation="fadeUp" delay={0.3 + index * 0.1}>
                            <div
                              className="border border-gray-800 rounded-lg overflow-hidden bg-[#1a1f2e]/30 hover:bg-[#1a1f2e]/70 hover:shadow-xl transition-all duration-300"
                              onClick={() => toggleQuestExpansion(quest.id)}
                            >
                              <div className="flex justify-between items-center p-4 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {expandedQuests.includes(quest.id) ? (
                                    <ChevronDown className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                  )}
                                  <h3 className="text-white font-medium">{quest.name}</h3>
                                  <Award className="h-4 w-4 text-yellow-400 ml-2" />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`quest-${quest.id}`}
                                    checked={isCompleted}
                                    onCheckedChange={() => toggleQuestCompletion(quest.id, isCompleted)}
                                    className={`transition-all duration-300 ${isCompleted ? "text-blue-500 scale-110" : "text-gray-500"}`}
                                    aria-label={`Mark ${quest.name} as ${isCompleted ? "incomplete" : "complete"}`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className={isCompleted ? "text-green-400" : "text-gray-400"}>
                                    {isCompleted ? "Completed" : "Pending"}
                                  </span>
                                </div>
                              </div>

                              <AnimatePresence>
                                {expandedQuests.includes(quest.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 pt-0 border-t border-gray-800">
                                      <p className="text-sm text-gray-400 mb-4">{quest.description}</p>
                                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center">
                                          <CheckCircle className="h-3 w-3 mr-1 text-blue-400" />
                                          Reward: {quest.reward}
                                        </div>
                                        <div className="flex items-center">
                                          <Clock className="h-3 w-3 mr-1 text-yellow-400" />
                                          Deadline: {format(parseISO(quest.endDate), "MMM dd, yyyy")}
                                        </div>
                                        <Link
                                          href={quest.link}
                                          target="_blank"
                                          className="ml-auto text-blue-400 hover:text-blue-300 flex items-center"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View on Galxe
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        </Link>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </AnimatedElement>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>

            <AnimatedElement animation="fadeUp" delay={0.3}>
              <Card className="bg-[#151a23] border-gray-800 shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">How It Works</h3>
                      <ul className="space-y-3 text-base text-gray-300">
                        <li className="flex items-start gap-2 group">
                          <ChevronRight className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span>Click on any quest to view more details about the requirements.</span>
                        </li>
                        <li className="flex items-start gap-2 group">
                          <ChevronRight className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span>Complete the tasks described in each quest to earn rewards.</span>
                        </li>
                        <li className="flex items-start gap-2 group">
                          <ChevronRight className="h-4 w-4 text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span>Mark quests as completed after you&apos;ve finished them.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedElement>
          </div>

          <AnimatedElement animation="fadeUp" delay={0.4}>
            <div className="space-y-6">
              <Card className="bg-[#151a23] border-gray-800 shadow-lg shadow-white/50 hover:shadow-blue-500/20 transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <CardTitle className="text-lg text-white">Quest Progress</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Completion</span>
                    <span className="text-sm font-medium text-white">{completionPercentage}%</span>
                  </div>
                  <Progress
                    value={completionPercentage}
                    className="h-2 bg-gray-800"
                    indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                  <div className="mt-4 text-sm text-gray-400">
                    {completedQuests} of {totalQuests} quests completed
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#151a23] border-gray-800 shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <CardTitle className="text-lg text-white">Rewards Earned</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completions.filter((c) => c.completed).length === 0 ? (
                      <p className="text-gray-400">No rewards earned yet. Complete quests to earn rewards!</p>
                    ) : (
                      completions
                        .filter((c) => c.completed)
                        .map((completion) => {
                          const quest = quests.find((q) => q.id === completion.questId)
                          if (!quest) return null

                          return (
                            <div
                              key={completion.id}
                              className="flex justify-between items-center border-b border-gray-800 pb-2"
                            >
                              <div className="text-sm text-white">{quest.name}</div>
                              <div className="text-sm text-yellow-400">{quest.reward}</div>
                            </div>
                          )
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </div>
  )
}
