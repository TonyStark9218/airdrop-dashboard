export interface Airdrop {
  _id: string
  userId: string
  name: string
  type: "testnet" | "daily" | "quest" | "node" | "retro"
  twitterLink: string
  discordLink: string
  airdropLink?: string
  description?: string
  airdropImageUrl?: string
  guideImageUrl?: string
  createdAt: string
}

export interface User {
  _id: string
  username: string
  password: string
}

export interface Session {
  userId: string
  username: string
}

export interface ChatRoomData {
  _id: string
  name: string
  description: string
  topic: string
  createdAt: Date
  updatedAt: Date
}

export interface MessageData {
  _id: string
  roomId: string
  senderId: string
  senderUsername: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSearchResult {
  _id: string
  username: string
}

