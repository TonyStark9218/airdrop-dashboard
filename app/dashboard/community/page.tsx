import { getSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Users } from "lucide-react"

export default async function CommunityPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login?redirect=/dashboard/community")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <p className="text-gray-400 mt-2">Connect with other airdrop hunters and share opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/community/chat"
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-900/30 rounded-full p-3">
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Chat Rooms</h2>
              <p className="text-gray-400 mt-1">
                Join topic-based chat rooms to discuss airdrops, strategies, and opportunities
              </p>
              <button className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700">
                Browse Chat Rooms
              </button>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/community/users"
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="bg-purple-900/30 rounded-full p-3">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Find Users</h2>
              <p className="text-gray-400 mt-1">
                Search for other users, view profiles, and connect with airdrop hunters
              </p>
              <button className="mt-4 bg-purple-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-purple-700">
                Search Users
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

