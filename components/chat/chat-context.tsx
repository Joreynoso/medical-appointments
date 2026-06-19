"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ChatModal } from "./chat-modal"

type ChatContextType = {
  openChat: () => void
}

const ChatContext = createContext<ChatContextType>({
  openChat: () => {},
})

export function useChat() {
  return useContext(ChatContext)
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ChatContext.Provider value={{ openChat: () => setIsOpen(true) }}>
      {children}
      <ChatModal open={isOpen} onOpenChange={setIsOpen} />
    </ChatContext.Provider>
  )
}
