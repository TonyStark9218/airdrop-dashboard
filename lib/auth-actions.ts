"use server"

import { cookies } from "next/headers"
import { connectToDatabase } from "./db"
import { SignJWT } from "jose"
import { User } from "./models/user"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_NAME = "auth_token"

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const secretKey = textEncoder.encode(JWT_SECRET)

export async function registerUser(username: string, password: string) {
  try {
    await connectToDatabase()

    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return { success: false, message: "Username already exists" }
    }

    // Create new user (password hashing is handled by the model pre-save hook)
    const user = new User({ username, password })
    await user.save()

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "An error occurred during registration" }
  }
}

export async function loginUser(username: string, password: string) {
  try {
    // Dummy user data for testing
    const dummyUser = { _id: "123456", username: "testuser", password: "testpass" }

    // Check if the provided username and password match the dummy user
    if (username !== dummyUser.username || password !== dummyUser.password) {
      return { success: false, message: "Invalid username or password" }
    }

    // Create JWT token using jose
    const token = await new SignJWT({
      userId: dummyUser._id,
      username: dummyUser.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey)

    cookies().set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
      secure: false, // Dev only
    })

    console.log("Login successful, token set")

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

export async function logoutUser() {
  cookies().delete(TOKEN_NAME)
  return { success: true }
}
