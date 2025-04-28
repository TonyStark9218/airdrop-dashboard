import { getSessionAppRouter } from "@/lib/auth-utils-app";
import { redirect } from "next/navigation"
import UserSearch from "@/components/user-search"

export default async function UsersPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login?redirect=/dashboard/community/users")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Find Users</h1>
        <p className="text-gray-400">Connect with other users in the community</p>
      </div>

      <UserSearch currentUserId={session.userId} />
    </div>
  )
}

