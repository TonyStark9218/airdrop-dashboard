import mongoose, { Schema, type Document } from "mongoose"
import type { QuestCompletion } from "@/lib/types"

// Define the Mongoose schema for QuestCompletion
const QuestCompletionSchema = new Schema(
  {
    questId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: String, default: null },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
)

// Create a compound index to ensure a user can only have one completion record per quest
QuestCompletionSchema.index({ questId: 1, userId: 1 }, { unique: true })

// Create and export the QuestCompletion model
// We need to check if the model already exists to prevent overwriting it
export default mongoose.models.QuestCompletion ||
  mongoose.model<QuestCompletion & Document>("QuestCompletion", QuestCompletionSchema)
