import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Picker data={data} onEmojiSelect={onEmojiSelect} theme="dark" previewPosition="none" skinTonePosition="none" />
  )
}
