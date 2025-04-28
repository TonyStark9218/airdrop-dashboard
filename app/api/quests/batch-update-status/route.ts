import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { updateQuestsStatus } from "@/lib/db-utils"

// POST /api/quests/batch-update-status - Update status of multiple quests
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

    const { ids, status } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status || !["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const result = await updateQuestsStatus(ids, status as "active" | "inactive")

    return NextResponse.json({
      message: `${result.updatedCount} quests updated successfully`,
      updatedCount: result.updatedCount,
    })
  } catch (error) {
    console.error("Error in POST /api/quests/batch-update-status:", error)
    return NextResponse.json({ error: "Failed to update quests" }, { status: 500 })
  }
}
