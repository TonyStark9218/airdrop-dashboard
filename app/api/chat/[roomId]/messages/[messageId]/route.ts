import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { Message } from "@/lib/models/message"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MessageReaction } from "@/lib/types";
import mongoose from "mongoose"

// Update message (edit or delete)
export async function PATCH(req: NextRequest, { params }: { params: { roomId: string; messageId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { roomId, messageId } = params

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Find the message
    const message = await Message.findById(messageId)

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is the sender
    if (message.senderId.toString() !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own messages" }, { status: 403 })
    }

    const { content, isDeleted } = await req.json()

    // Update message
    if (isDeleted) {
      message.content = "This message was deleted"
      message.isDeleted = true
      message.attachments = []
    } else if (content) {
      message.content = content
      message.isEdited = true
    }

    await message.save()

    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Failed to update message", details: error.message }, { status: 500 })
  }
}

// Add reaction to message
export async function POST(req: NextRequest, { params }: { params: { roomId: string; messageId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { roomId, messageId } = params

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const { type } = await req.json()

    if (!type) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 })
    }

    // Find the message
    const message = await Message.findById(messageId)

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions
      ? message.reactions.findIndex(
          (r: MessageReaction) => r.userId === session.user.id && r.type === type
        )
      : -1;

    if (existingReactionIndex >= 0) {
      // Remove the reaction
      message.reactions.splice(existingReactionIndex, 1)
    } else {
      // Add the reaction
      message.reactions.push({
        userId: session.user.id,
        username: session.user.username,
        type,
        timestamp: new Date(),
      })
    }

    await message.save()

    return NextResponse.json({ success: true, reactions: message.reactions })
  } catch (error: any) {
    console.error("Error adding reaction:", error)
    return NextResponse.json({ error: "Failed to add reaction", details: error.message }, { status: 500 })
  }
}
