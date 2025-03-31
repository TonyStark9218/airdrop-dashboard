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
} from "lucide-react"
import type { AirdropDocument } from "@/lib/models/airdrop"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
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

interface AirdropTableProps {
  airdrops: AirdropDocument[]
}

export function AirdropTable({ airdrops }: AirdropTableProps) {
  const { toast } = useToast()
  const [localAirdrops, setLocalAirdrops] = useState<AirdropDocument[]>(airdrops)
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

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

  // Handle toggle completion
  const handleToggleCompletion = async (airdropId: string) => {
    setIsLoading((prev) => ({ ...prev, [airdropId]: true }))

    try {
      const result = await toggleAirdropCompletion(airdropId)

      if (result.success) {
        // Update local state to avoid a full page refresh
        setLocalAirdrops((prev) =>
          prev.map((airdrop) =>
            airdrop._id.toString() === airdropId ? { ...airdrop, completed: !airdrop.completed } : airdrop,
          ),
        )

        toast({
          title: "Status updated",
          description: "Airdrop status has been updated",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling completion:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the status",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [airdropId]: false }))
    }
  }

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
    <div className="rounded-lg border border-gray-700 bg-[#0f1623] overflow-hidden">
      <table className="w-full text-sm text-left text-gray-200">
        <thead className="text-xs uppercase bg-[#1a1f2e] text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">
              PROJECT
            </th>
            <th scope="col" className="px-4 py-3">
              LINK
            </th>
            <th scope="col" className="px-4 py-3">
              STATUS
            </th>
            <th scope="col" className="px-4 py-3">
              TWITTER
            </th>
            <th scope="col" className="px-4 py-3">
              DISCORD
            </th>
            <th scope="col" className="px-4 py-3">
              NOTES
            </th>
            <th scope="col" className="px-4 py-3">
              JOIN DATE
            </th>
            <th scope="col" className="px-4 py-3">
              CHAIN
            </th>
            <th scope="col" className="px-4 py-3">
              STAGE
            </th>
            <th scope="col" className="px-4 py-3">
              TYPE
            </th>
            <th scope="col" className="px-4 py-3">
              LAST ACTIVITY
            </th>
            <th scope="col" className="px-4 py-3">
              GUIDE
            </th>
            <th scope="col" className="px-4 py-3">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-300 hover:bg-gray-700/20"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
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
                  {formatDistanceToNow(new Date(airdrop.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  {airdrop.guideImageUrl ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px] bg-[#1a1f2e] border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">{airdrop.name} - Guide</DialogTitle>
                        </DialogHeader>
                        <div className="relative h-[500px] w-full mt-4 bg-[#0f1623] rounded-md flex items-center justify-center">
                          <div className="text-4xl font-bold text-white/80">Tutorial Guide</div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#1a1f2e] border-gray-700 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Airdrop</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete the &quot;{airdrop.name}&quot; airdrop? This action cannot be
                          undone.
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

