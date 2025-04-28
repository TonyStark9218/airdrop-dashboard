import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import type { QuestUpdateInput } from "@/lib/types"
import { getQuestById, updateQuest, deleteQuest } from "@/lib/db-utils"

// GET /api/quests/[id] - Get a specific quest
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const quest = await getQuestById(id)

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    return NextResponse.json(quest)
  } catch (error) {
    console.error("Error in GET /api/quests/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch quest" }, { status: 500 })
  }
}

// PUT /api/quests/[id] - Update a quest
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.username !== "AimTzy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = params.id
    const quest = await getQuestById(id)

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    const data: QuestUpdateInput = await request.json()

    // Update the quest
    const updatedQuest = await updateQuest({
      ...data,
      id,
    })

    return NextResponse.json(updatedQuest)
  } catch (error) {
    console.error("Error in PUT /api/quests/[id]:", error)
    return NextResponse.json({ error: "Failed to update quest" }, { status: 500 })
  }
}

// DELETE /api/quests/[id] - Delete a quest
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.username !== "AimTzy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = params.id
    const quest = await getQuestById(id)

    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 })
    }

    await deleteQuest(id)

    return NextResponse.json({ message: "Quest deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/quests/[id]:", error)
    return NextResponse.json({ error: "Failed to delete quest" }, { status: 500 })
  }
}
