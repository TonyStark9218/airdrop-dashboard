"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "blue" | "white" | "purple"
}

export function LoadingSpinner({ size = "md", color = "blue" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  }

  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    white: "border-white border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
  }

  return <div className={cn("animate-spin rounded-full", sizeClasses[size], colorClasses[color])} />
}

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-[#0d1117] bg-opacity-80 flex items-center justify-center z-50 animate-fadeOut">
      <div className="flex flex-col items-center animate-fadeIn">
        <LoadingSpinner size="lg" color="blue" />
        <p className="mt-4 text-white text-opacity-80">Loading...</p>
      </div>
    </div>
  )
}
