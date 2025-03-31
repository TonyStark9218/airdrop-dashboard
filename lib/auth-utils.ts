import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import type { Session } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_NAME = "auth_token"

// Convert string to Uint8Array for jose
const textEncoder = new TextEncoder()
const secretKey = textEncoder.encode(JWT_SECRET)

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(TOKEN_NAME)?.value

  console.log("Getting session, token exists:", !!token)

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secretKey)
    console.log("Token verified, session:", payload)
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

