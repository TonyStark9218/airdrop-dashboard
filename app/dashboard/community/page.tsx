import { getSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { MessageSquare, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function CommunityPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Community</h1>
        <p className="text-gray-400 max-w-2xl text-center">
          Connect with other crypto enthusiasts, share airdrops, and discuss strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6 flex flex-col items-center text-center relative">
          <Badge className="absolute top-4 right-4 bg-yellow-600">Coming Soon</Badge>
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Chat Rooms</h2>
          <p className="text-gray-400 mb-6">
            Join topic-based chat rooms to discuss specific airdrops, blockchains, or strategies with the community.
          </p>
          <Button asChild className="opacity-70 cursor-not-allowed">
            <span>Join Chat Rooms</span>
          </Button>
        </div>

        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6 flex flex-col items-center text-center relative">
          <Badge className="absolute top-4 right-4 bg-yellow-600">Coming Soon</Badge>
          <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Find Users</h2>
          <p className="text-gray-400 mb-6">
            Connect with other users who are tracking similar airdrops or have expertise in specific blockchains.
          </p>
          <Button asChild className="opacity-70 cursor-not-allowed">
            <span>Find Users</span>
          </Button>
        </div>
      </div>

      <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-medium text-white mb-4">Coming Soon</h2>
        <p className="text-gray-400">We&apos;re working on more community features, including:</p>
        <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
          <li>Direct messaging between users</li>
          <li>Community-curated airdrop lists</li>
          <li>Reputation system for trusted airdrop sharing</li>
          <li>Notification system for new airdrops shared by users you follow</li>
        </ul>
      </div>
    </div>
  )
}

