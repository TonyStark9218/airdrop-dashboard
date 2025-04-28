"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Clock, X } from "lucide-react"

// Common emoji categories
const emojis = {
  recent: ["😊", "👍", "❤️", "🔥", "🎉", "🚀", "💯", "✨", "🙏", "👏"],
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  gestures: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  crypto: ["₿", "⟠", "Ξ", "Ł", "Ð", "₳", "₮", "🚀", "🌕", "💎", "🙌", "📈", "📉", "🪙", "💰", "💸", "🏦"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "����", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧"],
  food: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆"],
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("smileys")
  const [recentEmojis, setRecentEmojis] = useState<string[]>(emojis.recent)

  // Load recent emojis from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recentEmojis")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentEmojis(parsed)
        }
      } catch (e) {
        console.error("Failed to parse recent emojis", e)
      }
    }
  }, [])

  // Save emoji to recent list
  const addToRecent = (emoji: string) => {
    const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 20)
    setRecentEmojis(updated)
    localStorage.setItem("recentEmojis", JSON.stringify(updated))
  }

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji)
    addToRecent(emoji)
  }

  const filteredEmojis = searchQuery
    ? Object.values(emojis)
        .flat()
        .filter((emoji) => emoji.includes(searchQuery))
    : emojis[activeTab as keyof typeof emojis] || []

  return (
    <div className="p-2">
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search emoji"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus-visible:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {searchQuery ? (
        <div className="h-[250px] overflow-y-auto p-2 grid grid-cols-8 gap-1 custom-scrollbar">
          {filteredEmojis.length > 0 ? (
            filteredEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded cursor-pointer transition-colors"
              >
                {emoji}
              </button>
            ))
          ) : (
            <div className="col-span-8 flex items-center justify-center h-full text-gray-400 text-sm">
              No emojis found
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800 border border-gray-700 grid grid-cols-7">
            <TabsTrigger value="recent" className="data-[state=active]:bg-gray-700 p-1">
              <Clock className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="smileys" className="data-[state=active]:bg-gray-700 p-1">
              😀
            </TabsTrigger>
            <TabsTrigger value="gestures" className="data-[state=active]:bg-gray-700 p-1">
              👍
            </TabsTrigger>
            <TabsTrigger value="symbols" className="data-[state=active]:bg-gray-700 p-1">
              ❤️
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-gray-700 p-1">
              ₿
            </TabsTrigger>
            <TabsTrigger value="animals" className="data-[state=active]:bg-gray-700 p-1">
              🐱
            </TabsTrigger>
            <TabsTrigger value="food" className="data-[state=active]:bg-gray-700 p-1">
              🍎
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-2">
            <div className="h-[200px] overflow-y-auto p-2 grid grid-cols-8 gap-1 custom-scrollbar">
              {recentEmojis.length > 0 ? (
                recentEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded cursor-pointer transition-colors"
                  >
                    {emoji}
                  </button>
                ))
              ) : (
                <div className="col-span-8 flex items-center justify-center h-full text-gray-400 text-sm">
                  No recent emojis
                </div>
              )}
            </div>
          </TabsContent>

          {Object.entries(emojis)
            .filter(([key]) => key !== "recent")
            .map(([key, emojiList]) => (
              <TabsContent key={key} value={key} className="mt-2">
                <div className="h-[200px] overflow-y-auto p-2 grid grid-cols-8 gap-1 custom-scrollbar">
                  {emojiList.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded cursor-pointer transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
        </Tabs>
      )}
    </div>
  )
}
