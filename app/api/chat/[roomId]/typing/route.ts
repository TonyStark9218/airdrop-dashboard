import { type NextRequest, NextResponse } from "next/server"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { connectToDatabase } from "@/lib/db"
import { ChatRoom } from "@/lib/models/chatroom"
import mongoose from "mongoose"

// Endpoint untuk menangani status pengetikan
export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { roomId } = params

    // Validate roomId
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 })
    }

    // Check if room exists
    const room = await ChatRoom.findById(roomId)

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 })
    }

    const { isTyping } = await req.json()

    // Emit typing event to all users in the room
    // Catatan: Ini memerlukan akses ke instance socket.io server
    // Dalam implementasi nyata, Anda mungkin perlu menggunakan Redis atau mekanisme lain
    // untuk berkomunikasi dengan server socket.io

    // Untuk sementara, kita hanya mengembalikan status sukses
    return NextResponse.json({
      success: true,
      typing: {
        userId: session.userId,
        username: session.username,
        roomId,
        isTyping,
      },
    })
  } catch (error: unknown) {
    console.error("Error updating typing status:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ error: "Failed to update typing status", details: errorMessage }, { status: 500 })
  }
}
