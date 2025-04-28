"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "gradient"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
  className?: string
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ variant = "default", size = "default", children, className, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden transition-all duration-300 transform hover:scale-105"

    const variantClasses = {
      default: "bg-blue-600 hover:bg-blue-700 text-white",
      outline: "bg-transparent border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white",
      gradient: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    }

    const sizeClasses = {
      sm: "py-1 px-3 text-sm",
      default: "py-2 px-4",
      lg: "py-3 px-6 text-lg",
    }

    return (
      <Button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], "group", className)}
        {...props}
      >
        {variant === "gradient" && (
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    )
  },
)

AnimatedButton.displayName = "AnimatedButton"
