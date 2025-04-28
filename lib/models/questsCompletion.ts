import mongoose, { Schema, type Document, Types } from "mongoose";
import type { QuestCompletion } from "@/lib/types";

// Define the interface for QuestCompletion Document
export interface QuestCompletionDocument extends Omit<Document, "id">, Omit<QuestCompletion, "id"> {
  _id: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}

// Define the Mongoose schema for QuestCompletion
const QuestCompletionSchema = new Schema<QuestCompletionDocument>(
  {
    questId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        return ret;
      },
    },
  }
);

// Create a compound index to ensure a user can only have one completion record per quest
QuestCompletionSchema.index({ questId: 1, userId: 1 }, { unique: true });

// Create and export the QuestCompletion model
export default mongoose.models.QuestCompletion ||
  mongoose.model<QuestCompletionDocument>("QuestCompletion", QuestCompletionSchema);

// Define the type for lean documents (plain objects)
export type QuestCompletionLeanDocument = {
  _id: Types.ObjectId | string;
  __v?: number;
  questId: string;
  userId: string;
  username: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};