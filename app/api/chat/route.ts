import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ChatRoom } from "@/lib/models/chatroom"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get query parameters
    const url = new URL(req.url)
    const isPrivate = url.searchParams.get("private") === "true"

    // Find chat rooms
    let query = {}

    if (isPrivate) {
      // For private chats, find rooms where the user is a member
      query = {
        isPrivate: true,
        members: { $in: [session.user.id] },
      }
    } else {
      // For public chats
      query = { isPrivate: false }
    }

    const chatRooms = await ChatRoom.find(query).sort({ updatedAt: -1 }).limit(20).lean()

    return NextResponse.json({ success: true, chatRooms })
  } catch (error: any) {
    console.error("Error fetching chat rooms:", error)
    return NextResponse.json({ error: "Failed to fetch chat rooms", details: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { name, description, topic, isPrivate = false, members = [] } = await req.json()

    // Validate required fields
    if (!name || !description || !topic) {
      return NextResponse.json({ error: "Name, description, and topic are required" }, { status: 400 })
    }

    // Create new chat room
    const chatRoom = new ChatRoom({
      name,
      description,
      topic,
      createdBy: session.user.id,
      isPrivate,
      members: isPrivate ? [session.user.id, ...members] : [],
    })

    await chatRoom.save()

    return NextResponse.json({
      success: true,
      message: "Chat room created successfully",
      chatRoom,
    })
  } catch (error: any) {
    console.error("Error creating chat room:", error)
    return NextResponse.json({ error: "Failed to create chat room", details: error.message }, { status: 500 })
  }
}
