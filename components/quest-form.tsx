"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Tag, LinkIcon, Award, AlertCircle } from "lucide-react"
import { AnimatedButton } from "@/components/animated-button"
import { createQuest, updateQuest } from "@/lib/quest-service"
import type { Quest, QuestCreateInput, QuestUpdateInput } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"

interface QuestFormProps {
  initialData?: Quest
  isEditing?: boolean
}

export function QuestForm({ initialData, isEditing = false }: QuestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [questName, setQuestName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? format(new Date(initialData.startDate), "yyyy-MM-dd") : "",
  )
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? format(new Date(initialData.endDate), "yyyy-MM-dd") : "",
  )
  const [status, setStatus] = useState<"active" | "inactive">(
    (initialData?.status as "active" | "inactive") || "active",
  )
  const [rewardType, setRewardType] = useState<"XP" | "TOKEN" | "NFT" | "BADGE">(
    (initialData?.rewardType as "XP" | "TOKEN" | "NFT" | "BADGE") || "XP",
  )
  const [rewardAmount, setRewardAmount] = useState(initialData?.rewardAmount?.toString() || "50")
  const [galxeLink, setGalxeLink] = useState(initialData?.link || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const questData: QuestCreateInput | QuestUpdateInput = {
        name: questName,
        description,
        startDate,
        endDate,
        status: status as "active" | "inactive",
        reward: `${rewardAmount} ${rewardType}`,
        rewardAmount: Number(rewardAmount),
        rewardType: rewardType as "XP" | "TOKEN" | "NFT" | "BADGE",
        link: galxeLink,
      }

      let response

      if (isEditing && initialData) {
        response = await updateQuest({
          id: initialData.id,
          ...questData,
        })
      } else {
        response = await createQuest(questData)
      }

      if (response.success) {
        setSuccess(isEditing ? "Quest updated successfully!" : "Quest created successfully!")
        setTimeout(() => {
          router.push("/dashboard/galxe-admin")
          router.refresh()
        }, 1500)
      } else {
        setError(response.error || "An error occurred")
      }
    } catch {
      setError("Failed to save quest. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 text-green-400 border-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="questName" className="text-gray-300">
          Quest Name
        </Label>
        <div className="relative">
          <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="questName"
            value={questName}
            onChange={(e) => setQuestName(e.target.value)}
            className="bg-[#0f1218] border-gray-800 text-white pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter quest name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#0f1218] border-gray-800 text-white min-h-[100px] transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter detailed quest description"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-gray-300">
            Start Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#0f1218] border-gray-800 text-white pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-gray-300">
            End Date
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#0f1218] border-gray-800 text-white pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rewardType" className="text-gray-300">
            Reward Type
          </Label>
          <Select value={rewardType} onValueChange={(value: "XP" | "TOKEN" | "NFT" | "BADGE") => setRewardType(value)}>
            <SelectTrigger className="bg-[#0f1218] border-gray-800 text-white">
              <SelectValue placeholder="Select reward type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-gray-800 text-white">
              <SelectItem value="XP">XP</SelectItem>
              <SelectItem value="TOKEN">Token</SelectItem>
              <SelectItem value="NFT">NFT</SelectItem>
              <SelectItem value="BADGE">Badge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rewardAmount" className="text-gray-300">
            Reward Amount
          </Label>
          <div className="relative">
            <Award className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="rewardAmount"
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              className="bg-[#0f1218] border-gray-800 text-white pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 100"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Status</Label>
        <RadioGroup
          value={status}
          onValueChange={(value: "active" | "inactive") => setStatus(value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" className="text-blue-400 border-gray-700" />
            <Label htmlFor="active" className="text-gray-300">
              Active
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="inactive" className="text-red-400 border-gray-700" />
            <Label htmlFor="inactive" className="text-gray-300">
              Inactive
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="galxeLink" className="text-gray-300">
          Link Galxe
        </Label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="galxeLink"
            value={galxeLink}
            onChange={(e) => setGalxeLink(e.target.value)}
            className="bg-[#0f1218] border-gray-800 text-white pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="https://galxe.com/quest/..."
            required
          />
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <AnimatedButton type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Quest" : "Save Quest"}
        </AnimatedButton>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-gray-800 bg-[#0f1218] hover:bg-[#1a1f2e]"
          onClick={() => router.push("/dashboard/galxe-admin")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
