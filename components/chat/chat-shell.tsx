"use client"

import { useState, useCallback, useEffect } from "react"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { ToolDropdown } from "./tool-dropdown"
import { ChatOnboarding } from "./chat-onboarding"
import { Button } from "@/components/ui/button"
import { useCrearTurno } from "@/components/agenda/crear-turno-context"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ToolCall = {
  name: string
  args: any
}

let msgCounter = 0

export function ChatShell() {
  const { refreshTurnos } = useCrearTurno()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<ToolCall | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("chat_onboarding")) {
      setShowOnboarding(true)
    }
  }, [])

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
      setPendingConfirmation(null)

      try {
        const history = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)

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

        if (data.needsConfirmation && data.toolCall) {
          setPendingConfirmation(data.toolCall)
        }
      } catch {
        addMessage("assistant", "❌ Error de conexión. Intentalo de nuevo.")
      } finally {
        setIsLoading(false)
      }
    },
    [messages, addMessage],
  )

  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmation) return
    setIsLoading(true)

    const contextMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmToolCall: pendingConfirmation,
          contextMessages,
        }),
      })

      if (!res.ok) {
        addMessage("assistant", "❌ Error al ejecutar la operación.")
        return
      }

      const data = await res.json()
      addMessage("assistant", data.message ?? "✅ Operación completada.")
      refreshTurnos()
    } catch {
      addMessage("assistant", "❌ Error de conexión. Intentalo de nuevo.")
    } finally {
      setPendingConfirmation(null)
      setIsLoading(false)
    }
  }, [pendingConfirmation, messages, addMessage, refreshTurnos])

  const handleReject = useCallback(() => {
    addMessage("assistant", "❌ Operación cancelada.")
    setPendingConfirmation(null)
  }, [addMessage])

  const toolButton = (
    <ToolDropdown onResult={handleQuickActionResult} onSend={handleSend} disabled={isLoading} />
  )

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="relative flex flex-1 overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
      {pendingConfirmation && (
        <div className="flex items-center justify-center gap-3 px-6 pt-1 pb-2">
          <span className="text-sm text-muted-foreground">¿Confirmar operación?</span>
          <Button size="sm" onClick={handleConfirm} disabled={isLoading}>
            Sí
          </Button>
          <Button size="sm" variant="outline" onClick={handleReject} disabled={isLoading}>
            No
          </Button>
        </div>
      )}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        toolButton={toolButton}
      />
      {showOnboarding && <ChatOnboarding onDismiss={() => setShowOnboarding(false)} toolButton={toolButton} />}
    </div>
  )
}
