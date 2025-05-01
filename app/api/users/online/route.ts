import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"
import { getSessionAppRouter } from "@/lib/auth-utils-app"
import type mongoose from "mongoose"

export const dynamic = 'force-dynamic';

// Define the structure for our response
interface UserResponse {
  _id: string
  username: string
  profilePicture?: string
  status: string
  role: string
}

// Define a more specific type for MongoDB document fields we need
interface MongoUserDocument {
  _id: mongoose.Types.ObjectId | string
  username: string
  profilePicture?: string
  status: "online" | "away" | "offline"
  role: "admin" | "moderator" | "member"
}

export async function GET() {
  try {
    const session = await getSessionAppRouter()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get online users (active in the last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const onlineUsers = await User.find({
      $or: [{ status: "online" }, { status: "away", lastActive: { $gte: fiveMinutesAgo } }],
      _id: { $ne: session.userId }, // Exclude current user
    })
      .select("_id username profilePicture status role")
      .limit(20)
      .lean()

    // Transform the MongoDB documents to our response format using type assertion
    const formattedUsers: UserResponse[] = (onlineUsers as unknown as MongoUserDocument[]).map((user) => ({
      _id: typeof user._id === "string" ? user._id : user._id.toString(),
      username: user.username,
      profilePicture: user.profilePicture,
      status: user.status,
      role: user.role,
    }))

    return NextResponse.json({
      success: true,
      onlineUsers: formattedUsers,
    })
  } catch (error: unknown) {
    console.error("Error fetching online users:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ error: "Failed to fetch online users", details: errorMessage }, { status: 500 })
  }
}
