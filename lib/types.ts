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

