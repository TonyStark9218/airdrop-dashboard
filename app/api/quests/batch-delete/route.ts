import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { deleteMultipleQuests } from "@/lib/db-utils"

// POST /api/quests/batch-delete - Delete multiple quests
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.username !== "AimTzy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const result = await deleteMultipleQuests(ids)

    return NextResponse.json({
      message: `${result.deletedCount} quests deleted successfully`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error in POST /api/quests/batch-delete:", error)
    return NextResponse.json({ error: "Failed to delete quests" }, { status: 500 })
  }
}
