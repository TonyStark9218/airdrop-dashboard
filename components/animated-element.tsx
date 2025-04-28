"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AnimatedElementProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scale"
}

export function AnimatedElement({ children, delay = 0, className = "", animation = "fadeUp" }: AnimatedElementProps) {
  const animations = {
    fadeUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay, ease: "easeOut" },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, delay, ease: "easeOut" },
    },
    slideLeft: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, delay, ease: "easeOut" },
    },
    slideRight: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, delay, ease: "easeOut" },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay, ease: "easeOut" },
    },
  }

  const animationProps = animations[animation]

  return (
    <motion.div
      className={className}
      initial={animationProps.initial}
      whileInView={animationProps.animate}
      viewport={{ once: true, margin: "-50px" }}
      transition={animationProps.transition}
    >
      {children}
    </motion.div>
  )
}
