"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/hooks/use-socket"

export interface SocketStatusProps {
  userId: string
  username: string
}

export function SocketStatus({ userId, username }: SocketStatusProps) {
  const { isConnected } = useSocket(userId, username)
  const [status, setStatus] = useState<"connected" | "connecting" | "disconnected">("connecting")

  useEffect(() => {
    setStatus(isConnected ? "connected" : "connecting")
  }, [isConnected])

  return (
    <Badge
      variant="outline"
      className={`ml-2 ${
        status === "connected"
          ? "bg-green-500/20 text-green-300 border-green-600"
          : status === "connecting"
            ? "bg-yellow-500/20 text-yellow-300 border-yellow-600"
            : "bg-red-500/20 text-red-300 border-red-600"
      }`}
    >
      {status === "connected" ? "Connected" : status === "connecting" ? "Connecting..." : "Disconnected"}
    </Badge>
  )
}
