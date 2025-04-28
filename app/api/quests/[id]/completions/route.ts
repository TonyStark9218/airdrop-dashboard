import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { getQuestCompletions } from "@/lib/db-utils"

// GET /api/quests/[id]/completions - Get all completions for a quest
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin for detailed stats
    const isAdmin = session.username === "AimTzy"

    const questId = params.id
    const completions = await getQuestCompletions(questId)

    // If not admin, only return the user's own completion
    if (!isAdmin) {
      const userCompletion = completions.find(
        (c) => c && typeof c === "object" && "userId" in c && c.userId === session.userId,
      )
      return NextResponse.json(userCompletion ? [userCompletion] : [])
    }

    return NextResponse.json(completions)
  } catch (error) {
    console.error("Error in GET /api/quests/[id]/completions:", error)
    return NextResponse.json({ error: "Failed to fetch completions" }, { status: 500 })
  }
}
