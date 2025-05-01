import { getSessionAppRouter } from "@/lib/auth-utils-app"
import { getChatMessages, getChatRooms } from "@/lib/community-actions"
import { redirect } from "next/navigation"
import ChatRoom from "@/components/chat-room"
import { SocketStatus } from "@/components/socket-status"

interface ChatRoomPageProps {
  params: {
    roomId: string
  }
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login?redirect=/dashboard/community/chat")
  }

  // Get the current chat room
  const chatRooms = await getChatRooms()
  const currentRoom = chatRooms.find((r) => r._id === params.roomId)

  if (!currentRoom) {
    redirect("/dashboard/community/chat")
  }

  // Get initial messages
  const initialMessages = await getChatMessages(params.roomId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{currentRoom.name}</h1>
          <p className="text-gray-400">{currentRoom.description}</p>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400">Socket Status:</span>
          <SocketStatus userId={session.userId} username={session.username} />
        </div>
      </div>

      <ChatRoom
        roomId={params.roomId}
        userId={session.userId}
        username={session.username}
        initialMessages={initialMessages}
      />
    </div>
  )
}
