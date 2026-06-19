"use client"

import { useState, useCallback } from "react"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { QuickActions } from "./quick-actions"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

let msgCounter = 0

export function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    msgCounter++
    setMessages((prev) => [...prev, { id: `msg-${msgCounter}`, role, content }])
  }, [])

  const handleQuickActionResult = useCallback(
    (userMsg: string, assistantMsg: string) => {
      const isTemp = assistantMsg.startsWith("⏳")
      if (isTemp) {
        msgCounter++
        setMessages((prev) => [...prev, { id: `msg-${msgCounter}`, role: "user", content: userMsg }])
        msgCounter++
        setMessages((prev) => [...prev, { id: `msg-${msgCounter}`, role: "assistant", content: assistantMsg }])
      } else {
        setMessages((prev) => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && updated[lastIdx].content.startsWith("⏳")) {
            updated[lastIdx] = { ...updated[lastIdx], content: assistantMsg }
          } else {
            updated.push({ id: `msg-${++msgCounter}`, role: "assistant", content: assistantMsg })
          }
          return updated
        })
      }
    },
    [],
  )

  const handleSend = useCallback(
    async (text: string) => {
      addMessage("user", text)
      setIsLoading(true)

      try {
        const history = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-6)

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...history, { role: "user", content: text }],
          }),
        })

        if (!res.ok) {
          addMessage("assistant", "❌ Error al comunicarse con el servidor.")
          return
        }

        const data = await res.json()
        addMessage("assistant", data.message ?? "✅ Listo.")
      } catch {
        addMessage("assistant", "❌ Error de conexión. Intentalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    },
    [messages, addMessage],
  )

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <QuickActions onResult={handleQuickActionResult} disabled={isLoading} />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
