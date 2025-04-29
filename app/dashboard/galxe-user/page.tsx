import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { getAllQuests, getUserQuestCompletions } from "@/lib/db-utils"
import type { Quest, QuestCompletion } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { GalxeUserClient } from "./client"

async function fetchData(userId: string) {
  let quests: Quest[] = []
  let completions: QuestCompletion[] = []
  let initialError: string | undefined

  try {
    // First try to fetch quests
    try {
      quests = await getAllQuests()
      console.log("Server-side fetched quests:", quests.length)
    } catch (questError) {
      console.error("Error fetching quests server-side:", questError)
      initialError = "Failed to fetch quests. Please try refreshing."
    }

    // Then try to fetch completions
    try {
      completions = await getUserQuestCompletions(userId)
      console.log("Server-side fetched completions:", completions.length)
    } catch (completionError) {
      console.error("Error fetching completions server-side:", completionError)
      // Don't override quest error if it exists
      if (!initialError) {
        initialError = "Failed to fetch quest completions. Some features may be limited."
      }
    }
  } catch (error) {
    console.error("Exception in fetchData:", error)
    initialError = "An error occurred while fetching data. Please try refreshing."
  }

  return { quests, completions, initialError }
}

export default async function GalxeUserPage() {
  const session = await getSessionAppRouter()
  if (!session) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Not authenticated. Please log in.</AlertDescription>
      </Alert>
    )
  }

  // Fetch data server-side
  const { quests, completions, initialError } = await fetchData(session.userId)

  // Return the client component directly without Suspense to avoid loading state issues
  return (
    <GalxeUserClient
      session={session}
      initialQuests={quests}
      initialCompletions={completions}
      initialError={initialError}
    />
  )
}
