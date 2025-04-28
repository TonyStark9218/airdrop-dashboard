import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { redirect } from "next/navigation"
import { UserSettingsForm } from "@/components/user-settings-form"

export default async function SettingsPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <UserSettingsForm userId={session.userId} username={session.username} />
      </div>
    </div>
  )
}

