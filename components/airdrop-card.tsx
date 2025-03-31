import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Twitter, DiscIcon as Discord, ExternalLink } from "lucide-react"
import type { AirdropDocument } from "@/lib/models/airdrop"

interface AirdropCardProps {
  airdrop: AirdropDocument
}

export function AirdropCard({ airdrop }: AirdropCardProps) {
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48 w-full">
        {airdrop.airdropImageUrl ? (
          <Image src={airdrop.airdropImageUrl || "/placeholder.svg"} alt={airdrop.name} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{airdrop.name}</CardTitle>
          <Badge variant={getBadgeVariant(airdrop.type)} className="capitalize">
            {airdrop.type}
          </Badge>
        </div>
        {airdrop.description && <CardDescription className="line-clamp-2">{airdrop.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="hover:bg-gray-50">
            <a href={airdrop.twitterLink} target="_blank" rel="noopener noreferrer">
              <Twitter className="mr-2 h-4 w-4" />
              Twitter
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="hover:bg-gray-50">
            <a href={airdrop.discordLink} target="_blank" rel="noopener noreferrer">
              <Discord className="mr-2 h-4 w-4" />
              Discord
            </a>
          </Button>
          {airdrop.airdropLink && (
            <Button variant="outline" size="sm" asChild className="hover:bg-gray-50">
              <a href={airdrop.airdropLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Airdrop
              </a>
            </Button>
          )}
        </div>

        {airdrop.guideImageUrl && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">How to Participate:</h4>
            <div className="relative h-48 w-full border rounded overflow-hidden">
              <Image src={airdrop.guideImageUrl || "/placeholder.svg"} alt="Guide" fill className="object-contain" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

