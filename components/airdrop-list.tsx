import { AirdropCard } from "@/components/airdrop-card"
import type { AirdropDocument } from "@/lib/models/airdrop"

interface AirdropListProps {
  airdrops: AirdropDocument[]
}

export function AirdropList({ airdrops }: AirdropListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {airdrops.map((airdrop) => (
        <AirdropCard key={airdrop._id.toString()} airdrop={airdrop} />
      ))}
    </div>
  )
}

