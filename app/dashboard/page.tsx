import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { getAirdrops } from "@/lib/airdrop-actions"
import { Suspense } from "react"
import { AirdropTable } from "@/components/airdrop-table"
import { AirdropTableSkeleton } from "@/components/airdrop-table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus, BarChart3, Wallet, Coins, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track and manage your crypto airdrops</p>
        </div>
        <div className="flex items-center">
          <Link href="/dashboard/add">
            <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
              Add Airdrop
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Airdrops</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              24
              <span className="ml-2 text-sm text-green-400 flex items-center">
                +3
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">12 active, 12 completed</span>
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-600/10 to-blue-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Estimated Value</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              $1,240
              <span className="ml-2 text-sm text-green-400 flex items-center">
                +$120
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Based on current market data</span>
              <Wallet className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Completed Tasks</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              78%
              <span className="ml-2 text-sm text-green-400 flex items-center">
                +5%
                <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">18/24 tasks completed</span>
              <div className="h-2 w-24 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f2e] border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-600/10 to-red-600/10 rounded-bl-full"></div>
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Upcoming Airdrops</CardDescription>
            <CardTitle className="text-2xl text-white flex items-baseline">
              7<span className="ml-2 text-sm text-yellow-400 flex items-center">Next 7 days</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">3 high priority</span>
              <Coins className="h-5 w-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">Your Airdrops</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Sort
            </Button>
          </div>
        </div>

        <Suspense fallback={<AirdropTableSkeleton />}>
          <AirdropContent userId={session.userId} />
        </Suspense>
      </div>
    </div>
  )
}

async function AirdropContent({ userId }: { userId: string }) {
  const airdrops = await getAirdrops(userId)
  const hasAirdrops = airdrops.length > 0

  if (!hasAirdrops) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-gray-700 rounded-lg bg-[#1a1f2e] text-white">
        <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <Coins className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No airdrops yet</h3>
        <p className="text-gray-400 mb-6 max-w-md">Start tracking your crypto airdrops by adding your first one</p>
        <Link href="/dashboard/add">
          <Button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
            Add Your First Airdrop
          </Button>
        </Link>
      </div>
    )
  }

  return <AirdropTable airdrops={airdrops} />
}

