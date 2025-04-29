import { Suspense } from "react"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { getAllQuests, getUserQuestCompletions } from "@/lib/quest-service"
import type { Quest, QuestCompletion, Session } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { GalxeUserClient } from "./client"
import { PageLoader } from "@/components/loading-spinner"

async function fetchData(session: Session) {
  let quests: Quest[] = []
  let completions: QuestCompletion[] = []
  let initialError: string | undefined

  try {
    // First try to fetch quests
    const questsResponse = await getAllQuests()
    if (!questsResponse.success || !questsResponse.data) {
      initialError = questsResponse.error || "Failed to fetch quests"
      console.error("Error fetching quests:", initialError)
    } else {
      quests = questsResponse.data
    }

    // Then try to fetch completions
    try {
      const completionsResponse = await getUserQuestCompletions(session.userId)
      if (!completionsResponse.success) {
        console.error("Error fetching completions:", completionsResponse.error)
        // Don't override quest error if it exists
        if (!initialError) {
          initialError = completionsResponse.error || "Failed to fetch quest completions"
        }
      } else {
        completions = completionsResponse.data || []
      }
    } catch (completionError) {
      console.error("Exception fetching completions:", completionError)
      // Don't override quest error if it exists
      if (!initialError) {
        initialError = "An error occurred while fetching completion data"
      }
    }
  } catch (error) {
    console.error("Exception in fetchData:", error)
    initialError = "An error occurred while fetching data"
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

  const { quests, completions, initialError } = await fetchData(session)

  return (
    <Suspense
      fallback={
        <div className="container min-h-screen py-8 flex flex-col items-center justify-center">
          <PageLoader />
          <p className="text-gray-400 text-center mt-2">Loading quests...</p>
        </div>
      }
    >
      <GalxeUserClient
        session={session}
        initialQuests={quests}
        initialCompletions={completions}
        initialError={initialError}
      />
    </Suspense>
  )
}
