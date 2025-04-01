import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { getAirdropById } from "@/lib/airdrop-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { EditAirdropForm } from "@/components/edit-airdrop-form"

interface EditAirdropPageProps {
  params: {
    id: string
  }
}

export default async function EditAirdropPage({ params }: EditAirdropPageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const airdrop = await getAirdropById(params.id)

  if (!airdrop) {
    redirect("/dashboard")
  }

  // Make sure the user can only edit their own airdrops
  if (airdrop.userId !== session.userId) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e17]">
      <DashboardHeader username={session.username} />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Edit Airdrop</h1>
        <EditAirdropForm airdrop={airdrop} userId={session.userId} />
      </main>
    </div>
  )
}

