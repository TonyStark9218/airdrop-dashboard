import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import type { QuestCompletionInput } from "@/lib/types"
import { getUserQuestCompletions, updateQuestCompletion, updateQuestStatistics } from "@/lib/db-utils"

// GET /api/users/[userId]/quest-completions - Get all quest completions for a user
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.userId

    // Users can only access their own completions unless they're admin
    if (session.userId !== userId && session.username !== "AimTzy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const completions = await getUserQuestCompletions(userId)

    // Log the completions for debugging
    console.log(`Fetched ${completions.length} completions for user ${userId}`)

    return NextResponse.json(completions)
  } catch (error) {
    console.error("Error in GET /api/users/[userId]/quest-completions:", error)
    return NextResponse.json({ error: "Failed to fetch completions" }, { status: 500 })
  }
}

// POST /api/users/[userId]/quest-completions - Update quest completion status
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.userId

    // Users can only update their own completions
    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data: QuestCompletionInput = await request.json()

    if (!data.questId) {
      return NextResponse.json({ error: "Missing questId" }, { status: 400 })
    }

    // Update the completion status
    const updatedCompletion = await updateQuestCompletion(userId, session.username, data)

    // Update quest statistics (participants and completion rate)
    await updateQuestStatistics(data.questId)

    return NextResponse.json(updatedCompletion)
  } catch (error) {
    console.error("Error in POST /api/users/[userId]/quest-completions:", error)
    return NextResponse.json({ error: "Failed to update completion" }, { status: 500 })
  }
}
