import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ChatRoom } from "@/lib/models/chatroom";
import { getSessionAppRouter } from "@/lib/auth-utils-app"; // Ganti getServerSession jadi getSessionAppRouter

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAppRouter(); // Ganti getServerSession

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get query parameters
    const url = new URL(req.url);
    const isPrivate = url.searchParams.get("private") === "true";

    // Find chat rooms
    const query: Record<string, unknown> = {}; // Ganti any jadi Record<string, unknown>

    if (isPrivate) {
      // For private chats, find rooms where the user is a member
      query.isPrivate = true;
      query.members = { $in: [session.userId] }; // Ganti session.user.id jadi session.userId
    } else {
      // For public chats
      query.isPrivate = false;
    }

    const chatRooms = await ChatRoom.find(query).sort({ updatedAt: -1 }).limit(20).lean();

    return NextResponse.json({ success: true, chatRooms });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat rooms", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAppRouter(); // Ganti getServerSession

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { name, description, topic, isPrivate = false, members = [] } = await req.json();

    // Validate required fields
    if (!name || !description || !topic) {
      return NextResponse.json({ error: "Name, description, and topic are required" }, { status: 400 });
    }

    // Create new chat room
    const chatRoom = new ChatRoom({
      name,
      description,
      topic,
      createdBy: session.userId, // Ganti session.user.id jadi session.userId
      isPrivate,
      members: isPrivate ? [session.userId, ...members] : [], // Ganti session.user.id jadi session.userId
    });

    await chatRoom.save();

    return NextResponse.json({
      success: true,
      message: "Chat room created successfully",
      chatRoom,
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json(
      { error: "Failed to create chat room", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}