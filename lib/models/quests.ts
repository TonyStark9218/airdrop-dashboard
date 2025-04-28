import mongoose, { Schema, type Document, Types } from "mongoose";
import type { Quest } from "@/lib/types";

// Define the interface for Quest Document
export interface QuestDocument extends Omit<Document, "id">, Omit<Quest, "id"> {
  _id: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}

// Define the Mongoose schema for Quest
const QuestSchema = new Schema<QuestDocument>(
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

// Create and export the Quest model
export default mongoose.models.Quest || mongoose.model<QuestDocument>("Quest", QuestSchema);

// Define the type for lean documents (plain objects)
export type QuestLeanDocument = {
  _id: Types.ObjectId | string;
  __v?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  reward: string;
  rewardAmount: number;
  rewardType: "XP" | "TOKEN" | "NFT" | "BADGE";
  link: string;
  createdBy: string;
  participants: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
};