import mongoose, { Schema, type Document } from "mongoose"

export interface IMessage extends Document {
  roomId: string
  senderId: string
  senderUsername: string
  content: string
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

const MessageSchema = new Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderUsername: { type: String, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
)

// Add TTL index to automatically delete messages after 24 hours
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // 24 hours = 86400 seconds

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

