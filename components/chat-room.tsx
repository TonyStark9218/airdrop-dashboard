"use client"

import { useState, useEffect, useRef } from "react"
import type { MessageData } from "@/lib/types"
import { sendMessage, updateTypingStatus } from "@/lib/community-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface ChatRoomProps {
  roomId: string
  userId: string
  username: string
  initialMessages: MessageData[]
}

interface TypingUser {
  userId: string
  username: string
  timestamp: number
}

export default function ChatRoom({ roomId, userId, username, initialMessages }: ChatRoomProps) {
  const [messages, setMessages] = useState<MessageData[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Debounce the typing status to avoid too many updates
  const debouncedMessage = useDebounce(newMessage, 500)

  // Update typing status when message input changes
  useEffect(() => {
    const isTyping = newMessage.length > 0
    updateTypingStatus(roomId, userId, username, isTyping)
  }, [debouncedMessage, roomId, userId, username])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Poll for new messages and typing status
  useEffect(() => {
    const pollUpdates = async () => {
      if (isPolling) return

      setIsPolling(true)
      try {
        // Poll for new messages
        const response = await fetch(`/api/chat/${roomId}?lastMessageId=${messages[messages.length - 1]?._id || ""}`)

        if (response.ok) {
          const data = await response.json()

          if (data.messages && data.messages.length > 0) {
            setMessages((prev) => [...prev, ...data.messages])
          }

          // Update typing users
          if (data.typingUsers) {
            setTypingUsers(data.typingUsers.filter((user: TypingUser) => user.userId !== userId))
          }
        }
      } catch (error) {
        console.error("Error polling updates:", error)
      } finally {
        setIsPolling(false)
      }
    }

    const interval = setInterval(pollUpdates, 3000)
    return () => clearInterval(interval)
  }, [roomId, messages, isPolling, userId])

  // Clean up typing status when component unmounts
  useEffect(() => {
    return () => {
      updateTypingStatus(roomId, userId, username, false)
    }
  }, [roomId, userId, username])

  // Remove typing users after 3 seconds of inactivity
  useEffect(() => {
    const now = Date.now()
    const activeTypingUsers = typingUsers.filter((user) => now - user.timestamp < 3000)

    if (activeTypingUsers.length !== typingUsers.length) {
      setTypingUsers(activeTypingUsers)
    }
  }, [typingUsers])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)

    // Optimistic update
    const optimisticMessage: MessageData = {
      _id: `temp-${Date.now()}`,
      roomId,
      senderId: userId,
      senderUsername: username,
      content: newMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setNewMessage("")

    try {
      const result = await sendMessage(roomId, userId, username, newMessage)

      if (!result.success) {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticMessage._id))

        toast({
          title: "Failed to send message",
          description: result.message || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticMessage._id))

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Be the first to send a message!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-600/20 text-blue-200 p-3 rounded-lg text-sm">
              <p>Messages in this chat room will automatically be deleted after 24 hours.</p>
            </div>

            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.senderId === userId ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {message.senderId !== userId && (
                    <p className="text-xs font-medium mb-1 text-gray-300">{message.senderUsername}</p>
                  )}
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {typingUsers.length > 0 && (
              <div className="flex items-center text-gray-400 text-sm">
                <div className="flex-shrink-0 mr-2">
                  <span className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                </div>
                <p>
                  {typingUsers.length === 1
                    ? `${typingUsers[0].username} is typing...`
                    : `${typingUsers.map((u) => u.username).join(", ")} are typing...`}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <style jsx>{`
        .typing-indicator {
          display: inline-flex;
          align-items: center;
        }
        
        .dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  )
}

