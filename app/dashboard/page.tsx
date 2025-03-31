import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { getAirdrops } from "@/lib/airdrop-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { Suspense } from "react"
import { AirdropTable } from "@/components/airdrop-table"
import { AirdropTableSkeleton } from "@/components/airdrop-table-skeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e17]">
      <DashboardHeader username={session.username} />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Your Airdrops</h1>
          <Link href="/dashboard/add">
            <Button className="group bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
              Add Airdrop
            </Button>
          </Link>
        </div>

        <Suspense fallback={<AirdropTableSkeleton />}>
          <AirdropContent userId={session.userId} />
        </Suspense>
      </main>
    </div>
  )
}

async function AirdropContent({ userId }: { userId: string }) {
  const airdrops = await getAirdrops(userId)
  const hasAirdrops = airdrops.length > 0

  if (!hasAirdrops) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-gray-700 rounded-lg bg-[#1a1f2e] text-white">
        <h3 className="text-xl font-medium mb-2">No airdrops yet</h3>
        <p className="text-gray-400 mb-6">You haven&apos;t added any airdrops yet</p>
        <Link href="/dashboard/add">
          <Button className="group bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
            Add Airdrop
          </Button>
        </Link>
      </div>
    )
  }

  return <AirdropTable airdrops={airdrops} />
}

