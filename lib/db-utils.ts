import { connectToDatabase } from "@/lib/db"
import QuestModel from "@/lib/models/quests"
import QuestCompletionModel from "@/lib/models/questsCompletion"
import type { QuestCreateInput, QuestUpdateInput, QuestCompletionInput } from "@/lib/types"

// Helper function to safely convert Mongoose document to plain object
function convertDocument<T>(doc: any): T & { id: string } {
  if (!doc) return null as any

  // Extract _id and convert to string
  const id = doc._id ? doc._id.toString() : ""

  // Create a new object without _id
  const { _id, ...rest } = doc

  // Return the new object with id
  return { id, ...rest } as T & { id: string }
}

// Quest operations
export async function getAllQuests() {
  try {
    await connectToDatabase()
    const quests = await QuestModel.find({}).sort({ createdAt: -1 }).lean()

    // Convert Mongoose documents to plain objects
    return Array.isArray(quests) ? quests.map((quest) => convertDocument(quest)) : []
  } catch (error) {
    console.error("Error fetching quests:", error)
    throw error
  }
}

export async function getQuestById(id: string) {
  try {
    await connectToDatabase()
    const quest = await QuestModel.findById(id).lean()

    if (!quest) return null

    // Convert Mongoose document to plain object
    return convertDocument(quest)
  } catch (error) {
    console.error("Error fetching quest by ID:", error)
    throw error
  }
}

export async function createQuest(questData: QuestCreateInput & { createdBy: string }) {
  try {
    await connectToDatabase()
    const newQuest = new QuestModel(questData)
    await newQuest.save()

    const savedQuest = newQuest.toObject()
    return convertDocument(savedQuest)
  } catch (error) {
    console.error("Error creating quest:", error)
    throw error
  }
}

export async function updateQuest(questData: QuestUpdateInput) {
  try {
    await connectToDatabase()
    const { id, ...updateData } = questData

    const updatedQuest = await QuestModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedQuest) {
      throw new Error("Quest not found")
    }

    return convertDocument(updatedQuest)
  } catch (error) {
    console.error("Error updating quest:", error)
    throw error
  }
}

export async function deleteQuest(id: string) {
  try {
    await connectToDatabase()
    const result = await QuestModel.findByIdAndDelete(id)

    if (!result) {
      throw new Error("Quest not found")
    }

    // Also delete all completions for this quest
    await QuestCompletionModel.deleteMany({ questId: id })

    return true
  } catch (error) {
    console.error("Error deleting quest:", error)
    throw error
  }
}

export async function deleteMultipleQuests(ids: string[]) {
  try {
    await connectToDatabase()
    const result = await QuestModel.deleteMany({ _id: { $in: ids } })

    // Also delete all completions for these quests
    await QuestCompletionModel.deleteMany({ questId: { $in: ids } })

    return { deletedCount: result.deletedCount }
  } catch (error) {
    console.error("Error deleting multiple quests:", error)
    throw error
  }
}

export async function updateQuestsStatus(ids: string[], status: "active" | "inactive") {
  try {
    await connectToDatabase()
    const result = await QuestModel.updateMany({ _id: { $in: ids } }, { $set: { status } })

    return { updatedCount: result.modifiedCount }
  } catch (error) {
    console.error("Error updating quests status:", error)
    throw error
  }
}

// Quest Completion operations
export async function getQuestCompletions(questId: string) {
  try {
    await connectToDatabase()
    const completions = await QuestCompletionModel.find({ questId }).lean()

    return Array.isArray(completions) ? completions.map((completion) => convertDocument(completion)) : []
  } catch (error) {
    console.error("Error fetching quest completions:", error)
    throw error
  }
}

export async function getUserQuestCompletions(userId: string) {
  try {
    await connectToDatabase()
    const completions = await QuestCompletionModel.find({ userId }).lean()

    return Array.isArray(completions) ? completions.map((completion) => convertDocument(completion)) : []
  } catch (error) {
    console.error("Error fetching user quest completions:", error)
    throw error
  }
}

export async function updateQuestCompletion(userId: string, username: string, data: QuestCompletionInput) {
  try {
    await connectToDatabase()
    const now = new Date().toISOString()

    // Check if completion already exists
    const existingCompletion = await QuestCompletionModel.findOne({
      questId: data.questId,
      userId,
    }).lean()

    if (existingCompletion) {
      // Update existing completion
      const updatedCompletion = await QuestCompletionModel.findByIdAndUpdate(
        existingCompletion._id,
        {
          $set: {
            completed: data.completed,
            completedAt: data.completed ? now : null,
          },
        },
        { new: true },
      ).lean()

      if (!updatedCompletion) {
        throw new Error("Failed to update quest completion")
      }

      return convertDocument(updatedCompletion)
    } else {
      // Create new completion
      const newCompletion = new QuestCompletionModel({
        questId: data.questId,
        userId,
        username,
        completed: data.completed,
        completedAt: data.completed ? now : null,
      })

      await newCompletion.save()
      const savedCompletion = newCompletion.toObject()

      return convertDocument(savedCompletion)
    }
  } catch (error) {
    console.error("Error updating quest completion:", error)
    throw error
  }
}

// Update quest statistics (participants and completion rate)
export async function updateQuestStatistics(questId: string) {
  try {
    await connectToDatabase()

    // Get all completions for this quest
    const completions = await QuestCompletionModel.find({ questId }).lean()

    const participants = completions.length
    const completedCount = completions.filter((c: any) => c.completed).length
    const completionRate = participants > 0 ? Math.round((completedCount / participants) * 100) : 0

    // Update quest statistics
    await QuestModel.findByIdAndUpdate(questId, {
      $set: {
        participants,
        completionRate,
      },
    })

    return { participants, completionRate }
  } catch (error) {
    console.error("Error updating quest statistics:", error)
    throw error
  }
}
