"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  FileText,
  Twitter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Droplet,
  Edit,
} from "lucide-react"
import type { AirdropDocument } from "@/lib/models/airdrop"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { toggleAirdropCompletion, deleteAirdrop } from "@/lib/airdrop-actions"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

interface AirdropTableProps {
  airdrops: AirdropDocument[]
}

export function AirdropTable({ airdrops }: AirdropTableProps) {
  const { toast } = useToast()
  const [localAirdrops, setLocalAirdrops] = useState<AirdropDocument[]>(airdrops)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [selectedAirdrop, setSelectedAirdrop] = useState<AirdropDocument | null>(null)

  // Check for airdrops that need to be reset (completed more than 24 hours ago)
  useEffect(() => {
    // Function to check and reset completion status based on time
    const checkCompletionStatus = () => {
      const now = new Date()
      const updatedAirdrops = localAirdrops.map((airdrop) => {
        if (airdrop.completed) {
          // Get the timestamp when the airdrop was marked as completed
          const completedAt = new Date(airdrop.updatedAt || airdrop.createdAt)

          // Calculate time difference in hours
          const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60)

          // If it's been more than 24 hours since completion, reset to incomplete
          if (hoursSinceCompletion >= 24) {
            console.log(`Resetting airdrop ${airdrop.name} - completed ${hoursSinceCompletion.toFixed(1)} hours ago`)
            return { ...airdrop, completed: false }
          }

          // For demonstration purposes, we'll also show when it will reset
          const resetTime = new Date(completedAt.getTime() + 24 * 60 * 60 * 1000)
          const hoursUntilReset = (resetTime.getTime() - now.getTime()) / (1000 * 60 * 60)
          console.log(
            `Airdrop ${airdrop.name} will reset in ${hoursUntilReset.toFixed(1)} hours (${resetTime.toLocaleTimeString()})`,
          )
        }
        return airdrop
      })

      // Update local state if any airdrops were changed
      const hasChanges = updatedAirdrops.some((airdrop, index) => airdrop.completed !== localAirdrops[index].completed)

      if (hasChanges) {
        setLocalAirdrops(updatedAirdrops)

        // In a real app, you would also update the database here
        // For now, we'll just show a toast notification
        toast({
          title: "Status updated",
          description: "Some airdrops have been automatically reset after 24 hours",
        })
      }
    }

    // Check on initial load
    checkCompletionStatus()

    // Set up interval to check every minute (for demo purposes)
    // In production, you might want to check less frequently (e.g., every 5-15 minutes)
    const intervalId = setInterval(checkCompletionStatus, 60 * 1000)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [localAirdrops, toast])

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

  // Function to get chain icon and color
  const getChainInfo = (chain = "ethereum") => {
    switch (chain.toLowerCase()) {
      case "ethereum":
        return { letter: "E", bgColor: "bg-purple-900", textColor: "text-purple-300" }
      case "solana":
        return { letter: "S", bgColor: "bg-green-900", textColor: "text-green-300" }
      case "avax":
        return { letter: "A", bgColor: "bg-red-900", textColor: "text-red-300" }
      case "bnb":
        return { letter: "B", bgColor: "bg-yellow-900", textColor: "text-yellow-300" }
      default:
        return { letter: "E", bgColor: "bg-purple-900", textColor: "text-purple-300" }
    }
  }

  // Function to check if a string is a base64 image
  const isBase64Image = (str: string) => {
    return str && str.startsWith("data:image/")
  }

  // Handle toggle completion
  const handleToggleCompletion = async (airdropId: string) => {
    setIsLoading((prev) => ({ ...prev, [airdropId]: true }));
  
    try {
      const result = await toggleAirdropCompletion(airdropId);
  
      if (result.success) {
        const currentAirdrop = localAirdrops.find((airdrop) => airdrop._id.toString() === airdropId);
        const isCurrentlyCompleted = currentAirdrop?.completed || false;
        const now = new Date();
  
        setLocalAirdrops((prev) =>
          prev.map((airdrop) =>
            airdrop._id.toString() === airdropId
              ? {
                  ...airdrop,
                  completed: !isCurrentlyCompleted,
                  completedAt: !isCurrentlyCompleted ? now : undefined, // Set completedAt saat selesai
                  updatedAt: now, // Tetap sebagai Date
                }
              : airdrop,
          ),
        );
  
        if (!isCurrentlyCompleted) {
          const resetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          toast({
            title: "Ditandai sebagai selesai",
            description: `Airdrop ini akan direset otomatis pada ${resetTime.toLocaleTimeString()} besok`,
          });
        } else {
          toast({
            title: "Ditandai sebagai belum selesai",
            description: "Status airdrop telah diperbarui",
          });
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Gagal memperbarui status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saat mengubah status:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui status",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [airdropId]: false }));
    }
  };

  // Handle delete airdrop
  const handleDeleteAirdrop = async (airdropId: string) => {
    setIsLoading((prev) => ({ ...prev, [airdropId]: true }))

    try {
      const result = await deleteAirdrop(airdropId)

      if (result.success) {
        // Update local state to remove the deleted airdrop
        setLocalAirdrops((prev) => prev.filter((airdrop) => airdrop._id.toString() !== airdropId))

        toast({
          title: "Airdrop deleted",
          description: "Airdrop has been successfully deleted",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete airdrop",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting airdrop:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the airdrop",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [airdropId]: false }))
    }
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-[#0f1623] overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-200 min-w-[1200px]">
        <thead className="text-xs uppercase bg-[#1a1f2e] text-gray-400 sticky top-0">
          <tr>
            <th scope="col" className="px-4 py-3 min-w-[200px]">
              PROJECT
            </th>
            <th scope="col" className="px-4 py-3 min-w-[100px]">
              LINK
            </th>
            <th scope="col" className="px-4 py-3 min-w-[80px]">
              STATUS
            </th>
            <th scope="col" className="px-4 py-3 min-w-[80px]">
              TWITTER
            </th>
            <th scope="col" className="px-4 py-3 min-w-[80px]">
              DISCORD
            </th>
            <th scope="col" className="px-4 py-3 min-w-[80px]">
              NOTES
            </th>
            <th scope="col" className="px-4 py-3 min-w-[120px]">
              JOIN DATE
            </th>
            <th scope="col" className="px-4 py-3 min-w-[120px]">
              CHAIN
            </th>
            <th scope="col" className="px-4 py-3 min-w-[100px]">
              STAGE
            </th>
            <th scope="col" className="px-4 py-3 min-w-[100px]">
              TYPE
            </th>
            <th scope="col" className="px-4 py-3 min-w-[120px]">
              LAST ACTIVITY
            </th>
            <th scope="col" className="px-4 py-3 min-w-[80px]">
              GUIDE
            </th>
            <th scope="col" className="px-4 py-3 min-w-[120px]">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {localAirdrops.map((airdrop) => {
            const chainInfo = getChainInfo(airdrop.chain)
            const airdropId = airdrop._id.toString()
            return (
              <tr key={airdropId} className="border-b border-gray-700 hover:bg-[#1a1f2e]">
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                    {airdrop.airdropImageUrl ? (
                      <Image
                        src={airdrop.airdropImageUrl || "/placeholder.svg"}
                        alt={airdrop.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">No img</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{airdrop.name}</div>
                    <Badge variant={getBadgeVariant(airdrop.type)} className="capitalize mt-1">
                      {airdrop.type}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {airdrop.airdropLink ? (
                      <a
                        href={airdrop.airdropLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                          title="Airdrop Link"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}

                    {airdrop.type === "testnet" && airdrop.faucetLink ? (
                      <a
                        href={airdrop.faucetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          title="Faucet Link"
                        >
                          <Droplet className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${airdrop.completed ? "text-green-400 hover:text-green-300 hover:bg-green-900/20" : "text-red-400 hover:text-red-300 hover:bg-red-900/20"}`}
                    onClick={() => handleToggleCompletion(airdropId)}
                    disabled={isLoading[airdropId]}
                    title={airdrop.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {isLoading[airdropId] ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : airdrop.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={airdrop.twitterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </a>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={airdrop.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </a>
                </td>
                <td className="px-4 py-3">
                  {airdrop.description ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                          onClick={() => setSelectedAirdrop(airdrop)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] bg-[#1a1f2e] border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">{selectedAirdrop?.name} - Notes</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 text-gray-200 whitespace-pre-wrap p-4 bg-[#0f1623] rounded-md">
                          {selectedAirdrop?.description || "No description available."}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-yellow-500">{new Date(airdrop.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(airdrop.createdAt), { addSuffix: true })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className={`h-6 w-6 mr-2 ${chainInfo.bgColor} rounded-full flex items-center justify-center`}>
                      <span className={`text-xs ${chainInfo.textColor}`}>{chainInfo.letter}</span>
                    </div>
                    <span>{airdrop.chain || "Ethereum"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-800">
                    {airdrop.type === "testnet" ? "Testnet" : "Mainnet"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className="bg-blue-600 hover:bg-blue-700">DailyClaim</Badge>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {formatDistanceToNow(new Date(airdrop.updatedAt || airdrop.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  {airdrop.guideImageUrl ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          onClick={() => setSelectedAirdrop(airdrop)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px] bg-[#1a1f2e] border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">{selectedAirdrop?.name} - Guide</DialogTitle>
                        </DialogHeader>
                        <div className="relative h-[500px] w-full mt-4 bg-[#0f1623] rounded-md overflow-hidden">
                          {selectedAirdrop?.guideImageUrl && (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              {isBase64Image(selectedAirdrop.guideImageUrl) ? (
                                <img
                                  src={selectedAirdrop.guideImageUrl || "/placeholder.svg"}
                                  alt="Tutorial Guide"
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <div className="text-4xl font-bold text-white/80">
                                  Guide Image (
                                  {selectedAirdrop.guideImageUrl.includes("(")
                                    ? selectedAirdrop.guideImageUrl.match(/$$([^)]+)$$/)?.[1] || "Unknown"
                                    : "Unknown"}
                                  )
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/edit/${airdropId}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                        title="Edit Airdrop"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          title="Delete Airdrop"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1a1f2e] border-gray-700 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Airdrop</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete the &quot;{airdrop.name}&quot; airdrop? This action cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteAirdrop(airdropId)}
                            disabled={isLoading[airdropId]}
                          >
                            {isLoading[airdropId] ? (
                              <>
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

