import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/user"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const { username, password } = await req.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Create new user with default values for new fields
    const newUser = new User({
      username,
      password,
      profilePicture: "",
      bio: "",
      role: "member",
      status: "offline",
      lastActive: new Date(),
      connections: [],
      joinedDate: new Date(),
      settings: {
        theme: "dark",
        notifications: true,
        language: "id",
      },
    })

    await newUser.save()

    // Return success without password
    const userResponse = newUser.toObject()
    delete userResponse.password

    return NextResponse.json({ success: true, user: userResponse }, { status: 201 })
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
