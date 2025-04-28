import { redirect } from "next/navigation"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { AddAirdropForm } from "@/components/add-airdrop-form"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function AddAirdropPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e17]">
      <DashboardHeader username={session.username} />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Add New Airdrop</h1>
        <AddAirdropForm userId={session.userId} />
      </main>
    </div>
  )
}

