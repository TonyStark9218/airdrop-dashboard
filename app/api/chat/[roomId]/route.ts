import { getChatMessages } from "@/lib/community-actions"
import { type NextRequest, NextResponse } from "next/server"

// In-memory store for typing status (in production, use Redis or similar)
const typingStatus: Record<string, { userId: string; username: string; timestamp: number }[]> = {}

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const lastMessageId = searchParams.get("lastMessageId") || ""
    const roomId = params.roomId

    // Get all messages for the room
    const allMessages = await getChatMessages(roomId)

    // Get typing users for this room
    const typingUsers = typingStatus[roomId] || []

    // Clean up stale typing status (older than 5 seconds)
    const now = Date.now()
    const activeTypingUsers = typingUsers.filter((user) => now - user.timestamp < 5000)
    typingStatus[roomId] = activeTypingUsers

    // If no lastMessageId provided, return all messages
    if (!lastMessageId) {
      return NextResponse.json({
        messages: allMessages,
        typingUsers: activeTypingUsers,
      })
    }

    // Find the index of the last message
    const lastMessageIndex = allMessages.findIndex((msg) => msg._id === lastMessageId)

    // If message not found, return all messages
    if (lastMessageIndex === -1) {
      return NextResponse.json({
        messages: allMessages,
        typingUsers: activeTypingUsers,
      })
    }

    // Return only new messages
    const newMessages = allMessages.slice(lastMessageIndex + 1)
    return NextResponse.json({
      messages: newMessages,
      typingUsers: activeTypingUsers,
    })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const roomId = params.roomId
    const { userId, username, isTyping } = await request.json()

    if (!typingStatus[roomId]) {
      typingStatus[roomId] = []
    }

    // Remove existing status for this user
    typingStatus[roomId] = typingStatus[roomId].filter((user) => user.userId !== userId)

    // Add new status if typing
    if (isTyping) {
      typingStatus[roomId].push({
        userId,
        username,
        timestamp: Date.now(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating typing status:", error)
    return NextResponse.json({ error: "Failed to update typing status" }, { status: 500 })
  }
}

