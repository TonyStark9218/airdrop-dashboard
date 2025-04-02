import { getSession } from "@/lib/auth-utils"
import { getChatRooms, initializeChatRooms } from "@/lib/community-actions"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

export default async function ChatPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login?redirect=/dashboard/community/chat")
  }

  // Initialize default chat rooms if none exist
  await initializeChatRooms()

  // Get all chat rooms
  const chatRooms = await getChatRooms()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Chat Rooms</h1>
        <p className="text-gray-400">Join conversations with other community members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chatRooms.map((room) => (
          <Link
            key={room._id}
            href={`/dashboard/community/chat/${room._id}`}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-900/30 rounded-full p-3">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{room.name}</h3>
                <p className="text-gray-400 mt-1">{room.description}</p>
                <div className="mt-2 inline-block bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-300">
                  #{room.topic}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

