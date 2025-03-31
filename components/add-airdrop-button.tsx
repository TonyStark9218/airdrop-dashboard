import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function AddAirdropButton() {
  return (
    <Link href="/dashboard/add">
      <Button className="group">
        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
        Add Airdrop
      </Button>
    </Link>
  )
}

