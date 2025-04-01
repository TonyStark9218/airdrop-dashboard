import mongoose, { Schema, type Document, type Types } from "mongoose"

export interface IAirdrop extends Document {
  _id: Types.ObjectId
  userId: string
  name: string
  type: "testnet" | "daily" | "quest" | "node" | "retro"
  chain?: string
  twitterLink: string
  discordLink: string
  airdropLink?: string
  faucetLink?: string
  description?: string
  airdropImageUrl?: string
  guideImageUrl?: string
  completed?: boolean
  completedAt?: Date // Add this field to track when an airdrop was completed
  createdAt: Date
  updatedAt: Date
}

// This interface represents the plain object returned from lean()
export interface AirdropDocument {
  _id: Types.ObjectId
  userId: string
  name: string
  type: "testnet" | "daily" | "quest" | "node" | "retro"
  chain?: string
  twitterLink: string
  discordLink: string
  airdropLink?: string
  faucetLink?: string
  description?: string
  airdropImageUrl?: string
  guideImageUrl?: string
  completed?: boolean
  completedAt?: Date // Add this field to track when an airdrop was completed
  createdAt: Date
  updatedAt: Date
  __v: number
}

const AirdropSchema = new Schema<IAirdrop>(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["testnet", "daily", "quest", "node", "retro"],
      required: true,
    },
    chain: {
      type: String,
      default: "ethereum",
    },
    twitterLink: {
      type: String,
      required: true,
    },
    discordLink: {
      type: String,
      required: true,
    },
    airdropLink: {
      type: String,
    },
    faucetLink: {
      type: String,
    },
    description: {
      type: String,
    },
    airdropImageUrl: {
      type: String,
    },
    guideImageUrl: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Check if model exists before creating a new one (for Next.js hot reloading)
export const Airdrop = mongoose.models.Airdrop || mongoose.model<IAirdrop>("Airdrop", AirdropSchema)

