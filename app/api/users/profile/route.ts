import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/user";
import { getSessionAppRouter } from "@/lib/auth-utils-app"; // Ganti getServerSession jadi getSessionAppRouter

// Get current user profile
export async function GET() {
  try {
    const session = await getSessionAppRouter(); // Ganti getServerSession

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.userId).select("-password").lean(); // Ganti session.user.id jadi session.userId

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionAppRouter(); // Ganti getServerSession

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const data = await req.json();
    const allowedFields = ["bio", "profilePicture", "settings"];

    // Filter out fields that are not allowed to be updated
    const updateData: Record<string, unknown> = {}; // Ganti any jadi Record<string, unknown>
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.userId, // Ganti session.user.id jadi session.userId
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}