"use server"

import { connectToDatabase } from "./db"
import { ChatRoom } from "./models/chatroom"
import { Message } from "./models/message"
import { User } from "./models/user"
import { revalidatePath } from "next/cache"
import type { ChatRoomData, MessageData, UserSearchResult } from "./types"

// Get all chat rooms
export async function getChatRooms(): Promise<ChatRoomData[]> {
  try {
    await connectToDatabase()
    const chatRooms = await ChatRoom.find().sort({ updatedAt: -1 }).lean()

    // Convert MongoDB documents to plain objects with string IDs
    return chatRooms.map((room) => ({
      _id: String(room._id),
      name: room.name,
      description: room.description,
      topic: room.topic,
      createdAt: room.createdAt instanceof Date ? room.createdAt : new Date(room.createdAt),
      updatedAt: room.updatedAt instanceof Date ? room.updatedAt : new Date(room.updatedAt),
    }))
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    return []
  }
}

// Get messages for a specific chat room
export async function getChatMessages(roomId: string): Promise<MessageData[]> {
  try {
    await connectToDatabase()
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(100).lean()

    // Convert MongoDB documents to plain objects with string IDs
    return messages.map((message) => ({
      _id: String(message._id),
      roomId: String(message.roomId),
      senderId: message.senderId,
      senderUsername: message.senderUsername,
      content: message.content,
      createdAt: message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt),
      updatedAt: message.updatedAt instanceof Date ? message.updatedAt : new Date(message.updatedAt),
    }))
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return []
  }
}

// Send a message to a chat room
export async function sendMessage(roomId: string, senderId: string, senderUsername: string, content: string) {
  try {
    await connectToDatabase()

    const message = new Message({
      roomId,
      senderId,
      senderUsername,
      content,
    })

    await message.save()

    // Update the chat room's updatedAt timestamp
    await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() })

    revalidatePath(`/dashboard/community/chat/${roomId}`)
    return { success: true }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, message: "Failed to send message" }
  }
}

// Update typing status
export async function updateTypingStatus(roomId: string, userId: string, username: string, isTyping: boolean) {
  try {
    await connectToDatabase()

    // Make a POST request to the API endpoint to update typing status
    const response = await fetch(`/api/chat/${roomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, username, isTyping }),
    })

    if (!response.ok) {
      throw new Error("Failed to update typing status")
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating typing status:", error)
    return { success: false }
  }
}

// Search for users
export async function searchUsers(query: string) {
  try {
    await connectToDatabase()

    if (!query || query.length < 2) {
      return { success: true, users: [] }
    }

    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .select("_id username")
      .limit(10)
      .lean()

    // Convert MongoDB documents to plain objects with string IDs
    const formattedUsers: UserSearchResult[] = users.map((user) => ({
      _id: String(user._id),
      username: user.username,
    }))

    return { success: true, users: formattedUsers }
  } catch (error) {
    console.error("Error searching users:", error)
    return { success: false, message: "Failed to search users", users: [] }
  }
}

// Initialize default chat rooms if none exist
export async function initializeChatRooms() {
  try {
    await connectToDatabase()

    const count = await ChatRoom.countDocuments()

    if (count === 0) {
      const defaultRooms = [
        {
          name: "Ethereum Airdrops",
          description: "Discuss upcoming and active Ethereum ecosystem airdrops",
          topic: "ethereum",
        },
        {
          name: "Solana Opportunities",
          description: "Share and discover Solana airdrops and opportunities",
          topic: "solana",
        },
        {
          name: "Testnet Strategies",
          description: "Strategies for maximizing testnet participation rewards",
          topic: "testnet",
        },
        {
          name: "Daily Tasks",
          description: "Daily tasks and quests for various crypto projects",
          topic: "daily",
        },
      ]

      await ChatRoom.insertMany(defaultRooms)
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing chat rooms:", error)
    return { success: false }
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: { username?: string; password?: string }) {
  try {
    await connectToDatabase()

    // Check if username is taken (if changing username)
    if (data.username) {
      const existingUser = await User.findOne({
        username: data.username,
        _id: { $ne: userId }, // Exclude current user
      })

      if (existingUser) {
        return {
          success: false,
          message: "Username is already taken",
        }
      }
    }

    // Update user
    const updateData: Record<string, string> = {}
    if (data.username) updateData.username = data.username
    if (data.password) updateData.password = data.password

    await User.findByIdAndUpdate(userId, updateData)

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return {
      success: false,
      message: "Failed to update profile",
    }
  }
}

