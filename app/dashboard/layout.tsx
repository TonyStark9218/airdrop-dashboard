import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-utils"
import { SidebarNav } from "@/components/sidebar-nav"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <SidebarProvider>
        <SidebarNav username={session.username} />
        <SidebarInset className="bg-[#0a0e17]">
          <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

