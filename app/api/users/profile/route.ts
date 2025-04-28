import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById(session.user.id).select("-password").lean()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile", details: error.message }, { status: 500 })
  }
}

// Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await req.json()
    const allowedFields = ["bio", "profilePicture", "settings"]

    // Filter out fields that are not allowed to be updated
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 })
  }
}
