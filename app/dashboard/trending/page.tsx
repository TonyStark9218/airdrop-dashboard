import { getSession } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

// Mock trending data
const trendingAirdrops = [
  {
    id: "1",
    name: "Ethereum L2",
    type: "testnet",
    change: 35, // percentage change in interest
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Ethereum+L2",
    description: "Layer 2 scaling solution for Ethereum with upcoming token launch",
    users: 1245,
  },
  {
    id: "2",
    name: "DeFi Protocol",
    type: "retro",
    change: 22,
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=DeFi",
    description: "Decentralized finance protocol with retroactive airdrop for early users",
    users: 987,
  },
  {
    id: "3",
    name: "Solana Ecosystem",
    type: "daily",
    change: -5,
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Solana",
    description: "Ecosystem project on Solana with daily tasks for token rewards",
    users: 756,
  },
  {
    id: "4",
    name: "Gaming Token",
    type: "quest",
    change: 0,
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Gaming",
    description: "Play-to-earn gaming platform with quest-based token distribution",
    users: 543,
  },
  {
    id: "5",
    name: "Privacy Protocol",
    type: "node",
    change: 15,
    imageUrl: "https://placehold.co/600x400/1a1f2e/ffffff?text=Privacy",
    description: "Privacy-focused blockchain with node operator rewards",
    users: 321,
  },
]

export default async function TrendingPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Function to get badge color based on airdrop type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "testnet":
        return "bg-blue-900/30 text-blue-400 border-blue-800"
      case "daily":
        return "bg-green-900/30 text-green-400 border-green-800"
      case "quest":
        return "bg-purple-900/30 text-purple-400 border-purple-800"
      case "node":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800"
      case "retro":
        return "bg-red-900/30 text-red-400 border-red-800"
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-800"
    }
  }

  // Function to get change indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <ArrowUp className="h-4 w-4 text-green-400" />
    } else if (change < 0) {
      return <ArrowDown className="h-4 w-4 text-red-400" />
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  // Function to get change color
  const getChangeColor = (change: number) => {
    if (change > 0) {
      return "text-green-400"
    } else if (change < 0) {
      return "text-red-400"
    } else {
      return "text-gray-400"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Trending Airdrops</h1>
        <p className="text-gray-400 max-w-2xl text-center">
          Discover the most popular airdrops in the community right now.
        </p>
      </div>

      <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
          <h2 className="text-lg font-medium text-white">Top Trending Airdrops</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {trendingAirdrops.map((airdrop) => (
            <div key={airdrop.id} className="p-4 flex items-center">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                <Image
                  src={airdrop.imageUrl || "/placeholder.svg"}
                  alt={airdrop.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="text-white font-medium truncate">{airdrop.name}</h3>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border ${getBadgeColor(airdrop.type)}`}>
                    {airdrop.type}
                  </span>
                </div>
                <p className="text-gray-400 text-sm truncate">{airdrop.description}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                <div className={`flex items-center ${getChangeColor(airdrop.change)}`}>
                  {getChangeIndicator(airdrop.change)}
                  <span className="ml-1">{Math.abs(airdrop.change)}%</span>
                </div>
                <span className="text-gray-400 text-sm">{airdrop.users} users</span>
              </div>
              <Button size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700" asChild>
                <Link href={`/dashboard/explore?q=${encodeURIComponent(airdrop.name)}`}>View</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-medium text-white mb-4">Trending Categories</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Layer 2 Solutions</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>42%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">DeFi Protocols</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>28%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Gaming Tokens</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>15%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Privacy Coins</span>
              <div className="flex items-center text-red-400">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>8%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">NFT Projects</span>
              <div className="flex items-center text-gray-400">
                <Minus className="h-4 w-4 mr-1" />
                <span>0%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-medium text-white mb-4">Trending Blockchains</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Ethereum</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>35%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Solana</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>22%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Avalanche</span>
              <div className="flex items-center text-green-400">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>18%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Binance Smart Chain</span>
              <div className="flex items-center text-red-400">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>5%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Polkadot</span>
              <div className="flex items-center text-red-400">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

