import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { userId } = await req.json()

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Check if user exists
    const targetUser = await User.findById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already connected
    const currentUser = await User.findById(session.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "Current user not found" }, { status: 404 })
    }

    const isAlreadyConnected = currentUser.connections.includes(userId)

    if (isAlreadyConnected) {
      // Remove connection
      await User.findByIdAndUpdate(session.userId, {
        $pull: { connections: userId },
      })

      return NextResponse.json({
        success: true,
        connected: false,
        message: "Connection removed successfully",
      })
    } else {
      // Add connection
      await User.findByIdAndUpdate(session.userId, {
        $addToSet: { connections: userId },
      })

      return NextResponse.json({
        success: true,
        connected: true,
        message: "Connected successfully",
      })
    }
  } catch (error: unknown) {
    console.error("Error connecting to user:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ error: "Failed to connect to user", details: errorMessage }, { status: 500 })
  }
}
