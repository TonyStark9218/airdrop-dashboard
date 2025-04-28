import { redirect } from "next/navigation"
import { getSessionAppRouter } from "@/lib/auth-utils-app";
import {  isAdmin } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, Tag, LinkIcon, Info } from "lucide-react"
import Link from "next/link"
import { QuestForm } from "@/components/quest-form"
import { AnimatedElement } from "@/components/animated-element"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AddQuestPage() {
  const session = await getSessionAppRouter()

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin (AimTzy)
  if (!(await isAdmin(session.username))) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[#0f1218] py-8 px-6 rounded-lg shadow-lg shadow-white/50">
      <div className="space-y-8">
        <AnimatedElement animation="fadeUp" delay={0.1}>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/galxe-admin">
              <Button variant="outline" size="icon" className="border-gray-800 bg-[#151a23] hover:bg-[#1a1f2e]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Add New GALXE Quest</h1>
              <p className="text-gray-400 mt-1">Create a new quest for users to complete</p>
            </div>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedElement animation="fadeUp" delay={0.2}>
            <Card className="bg-[#151a23] border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quest Information</CardTitle>
                <CardDescription>Fill in the details for the new quest</CardDescription>
              </CardHeader>
              <CardContent>
                <QuestForm />
              </CardContent>
            </Card>
          </AnimatedElement>

          <AnimatedElement animation="fadeUp" delay={0.3}>
            <Card className="bg-[#151a23] border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quest Guidelines</CardTitle>
                <CardDescription>Tips for creating effective quests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Clear Quest Name</h3>
                      <p className="text-gray-400 text-sm">
                      Gunakan nama deskriptif yang secara jelas menunjukkan apa yang perlu dilakukan pengguna.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Detailed Description</h3>
                      <p className="text-gray-400 text-sm">
                      Berikan instruksi yang jelas tentang cara menyelesaikan misi dan apa yang akan diperoleh pengguna.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Set Appropriate Dates</h3>
                      <p className="text-gray-400 text-sm">
                      Berikan pengguna cukup waktu untuk menyelesaikan misi, tetapi ciptakan urgensi dengan tenggat waktu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Manage Status</h3>
                      <p className="text-gray-400 text-sm">
                      Tetapkan pencarian menjadi tidak aktif jika belum siap untuk diterbitkan atau perlu dijeda.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Valid Link</h3>
                      <p className="text-gray-400 text-sm">
                      Pastikan tautan Galxe benar dan mengarah ke halaman pencarian yang sesuai.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>
      </div>
    </div>
  )
}
