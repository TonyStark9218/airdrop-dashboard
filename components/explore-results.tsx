"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Plus, Check, Twitter, MessageCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cloneAirdrop } from "@/lib/airdrop-actions"
import type { AirdropDocument } from "@/lib/models/airdrop"

interface ExploreResultsProps {
  results: AirdropDocument[]
  query: string
  userId: string
}

export function ExploreResults({ results, query, userId }: ExploreResultsProps) {
  const { toast } = useToast()
  const [addingState, setAddingState] = useState<Record<string, boolean>>({})
  const [addedAirdrops, setAddedAirdrops] = useState<Record<string, boolean>>({})

  // Function to get badge color based on airdrop type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "testnet":
        return "default"
      case "daily":
        return "secondary"
      case "quest":
        return "outline"
      case "node":
        return "destructive"
      case "retro":
        return "default"
      default:
        return "outline"
    }
  }

  const handleAddAirdrop = async (airdrop: AirdropDocument) => {
    const airdropId = airdrop._id.toString()
    setAddingState((prev) => ({ ...prev, [airdropId]: true }))

    try {
      const result = await cloneAirdrop({
        airdropId,
        userId,
      })

      if (result.success) {
        setAddedAirdrops((prev) => ({ ...prev, [airdropId]: true }))
        toast({
          title: "Success!",
          description: "Airdrop added to your dashboard",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add airdrop",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding airdrop:", error)
      toast({
        title: "Error",
        description: "An error occurred while adding the airdrop",
        variant: "destructive",
      })
    } finally {
      setAddingState((prev) => ({ ...prev, [airdropId]: false }))
    }
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-4">
          <ExternalLink className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-medium text-white mb-2">No results found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          No airdrops found for &quot;{query}&quot;. Try a different search term or check out trending airdrops.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((airdrop) => {
        const airdropId = airdrop._id.toString()
        const isAdding = addingState[airdropId]
        const isAdded = addedAirdrops[airdropId]

        return (
          <Card
            key={airdropId}
            className="bg-[#1a1f2e] border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 group"
          >
            <div className="relative h-40 w-full overflow-hidden">
              {airdrop.airdropImageUrl ? (
                <Image
                  src={airdrop.airdropImageUrl || "/placeholder.svg"}
                  alt={airdrop.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] to-transparent opacity-60"></div>
            </div>
            <CardHeader className="relative z-10 -mt-12 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white drop-shadow-md">{airdrop.name}</CardTitle>
                <Badge variant={getBadgeVariant(airdrop.type)} className="capitalize shadow-md">
                  {airdrop.type}
                </Badge>
              </div>
              {airdrop.description && (
                <CardDescription className="text-gray-300 line-clamp-2 drop-shadow-md">
                  {airdrop.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <a href={airdrop.twitterLink} target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <a href={airdrop.discordLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discord
                  </a>
                </Button>
                {airdrop.airdropLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <a href={airdrop.airdropLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Airdrop
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={isAdded ? "outline" : "default"}
                disabled={isAdding || isAdded}
                onClick={() => handleAddAirdrop(airdrop)}
                style={{
                  background: isAdded ? "transparent" : "linear-gradient(to right, #2563eb, #7c3aed)",
                  borderColor: isAdded ? "#4b5563" : "transparent",
                }}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Added to Dashboard
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Dashboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

