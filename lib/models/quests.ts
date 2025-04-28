import mongoose, { Schema, type Document } from "mongoose"
import type { Quest } from "@/lib/types"

// Define the Mongoose schema for Quest
const QuestSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    reward: { type: String, required: true },
    rewardAmount: { type: Number, required: true },
    rewardType: { type: String, enum: ["XP", "TOKEN", "NFT", "BADGE"], required: true },
    link: { type: String, required: true },
    createdBy: { type: String, required: true },
    participants: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

// Create and export the Quest model
// We need to check if the model already exists to prevent overwriting it
// This is important in Next.js development with hot reloading
export default mongoose.models.Quest || mongoose.model<Quest & Document>("Quest", QuestSchema)
