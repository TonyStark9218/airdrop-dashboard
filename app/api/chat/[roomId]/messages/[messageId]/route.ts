import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Message } from "@/lib/models/message";
import { getSessionAppRouter } from "@/lib/auth-utils-app"; // Ganti getServerSession jadi getSessionAppRouter
import { MessageReaction } from "@/lib/types";
import mongoose from "mongoose";

// Update message (edit or delete)
export async function PATCH(req: NextRequest, { params }: { params: { roomId: string; messageId: string } }) {
  try {
    const session = await getSessionAppRouter(); // Ganti getServerSession

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { roomId, messageId } = params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== session.userId) { // Ganti session.user.id jadi session.userId
      return NextResponse.json({ error: "You can only edit your own messages" }, { status: 403 });
    }

    const { content, isDeleted } = await req.json();

    // Update message
    if (isDeleted) {
      message.content = "This message was deleted";
      message.isDeleted = true;
      message.attachments = [];
    } else if (content) {
      message.content = content;
      message.isEdited = true;
    }

    await message.save();

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Add reaction to message
export async function POST(req: NextRequest, { params }: { params: { roomId: string; messageId: string } }) {
  try {
    const session = await getSessionAppRouter(); // Ganti getServerSession

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { roomId, messageId } = params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const { type } = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex = message.reactions
      ? message.reactions.findIndex(
          (r: MessageReaction) => r.userId === session.userId && r.type === type // Ganti session.user.id jadi session.userId
        )
      : -1;

    if (existingReactionIndex >= 0) {
      // Remove the reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Add the reaction
      message.reactions.push({
        userId: session.userId, // Ganti session.user.id jadi session.userId
        username: session.username, // Ganti session.user.username jadi session.username
        type,
        timestamp: new Date(),
      });
    }

    await message.save();

    return NextResponse.json({ success: true, reactions: message.reactions });
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: "Failed to add reaction", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}