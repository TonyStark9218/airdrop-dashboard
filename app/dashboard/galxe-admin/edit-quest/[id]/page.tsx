"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { QuestForm } from "@/components/quest-form"
import { AnimatedElement } from "@/components/animated-element"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageLoader } from "@/components/loading-spinner"
import { getQuestById } from "@/lib/quest-service"
import type { Quest } from "@/lib/types"

export default function EditQuestPage() {
  const params = useParams()
  const router = useRouter()
  const [quest, setQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuest = async () => {
      if (!params.id) {
        setError("Quest ID is required")
        setIsLoading(false)
        return
      }

      try {
        const response = await getQuestById(params.id as string)

        if (response.success && response.data) {
          setQuest(response.data)
        } else {
          setError(response.error || "Failed to fetch quest")
        }
      } catch (err) {
        setError("An error occurred while fetching the quest")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuest()
  }, [params.id])

  if (isLoading) {
    return <PageLoader />
  }

  if (error || !quest) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Quest not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/galxe-admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Dashboard
          </Button>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-white">Edit Quest</h1>
              <p className="text-gray-400 mt-1">Update quest details</p>
            </div>
          </div>
        </AnimatedElement>

        <AnimatedElement animation="fadeUp" delay={0.2}>
          <Card className="bg-[#151a23] border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-white">Quest Information</CardTitle>
              <CardDescription>Update the details for this quest</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestForm initialData={quest} isEditing={true} />
            </CardContent>
          </Card>
        </AnimatedElement>
      </div>
    </div>
  )
}
