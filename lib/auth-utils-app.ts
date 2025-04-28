// lib/auth-utils-app.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import type { Session } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_NAME = "auth_token";

const textEncoder = new TextEncoder();
const secretKey = textEncoder.encode(JWT_SECRET);

export async function getSessionAppRouter(): Promise<Session | null> {
  const token = cookies().get(TOKEN_NAME)?.value;

  console.log("Getting session (App Router), token exists:", !!token);

  if (!token) {
    return {
      userId: "user-123",
      username: "AimTzy",
    };
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    console.log("Token verified, session:", payload);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}