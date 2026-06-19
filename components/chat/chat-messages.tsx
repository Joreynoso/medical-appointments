"use client"

import { useEffect, useRef } from "react"
import { ChatBubble } from "./chat-bubble"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type ChatMessagesProps = {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="text-center text-sm text-muted-foreground">
          Consultá tus turnos usando los botones de arriba o escribí una pregunta.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0.1s]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0.2s]" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
