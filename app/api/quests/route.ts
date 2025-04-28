import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import type { QuestCreateInput } from "@/lib/types"
import { createQuest, getAllQuests } from "@/lib/db-utils"

// GET /api/quests - Get all quests
export async function GET(request: NextRequest) {
  try {
    const quests = await getAllQuests()
    return NextResponse.json(quests)
  } catch (error) {
    console.error("Error in GET /api/quests:", error)
    return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 })
  }
}

// POST /api/quests - Create a new quest
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

    const data: QuestCreateInput = await request.json()

    // Validate required fields
    if (!data.name || !data.description || !data.startDate || !data.endDate || !data.status || !data.reward) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add creator information
    const questWithCreator = {
      ...data,
      createdBy: session.username,
    }

    const newQuest = await createQuest(questWithCreator)
    return NextResponse.json(newQuest, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/quests:", error)
    return NextResponse.json({ error: "Failed to create quest" }, { status: 500 })
  }
}
