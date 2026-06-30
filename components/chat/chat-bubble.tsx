"use client"

import ReactMarkdown from "react-markdown"

type ChatBubbleProps = {
  role: "user" | "assistant"
  content: string
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] ${
          isUser
            ? "rounded-xl bg-primary px-4 py-2.5 text-primary-foreground"
            : "rounded-lg border border-border bg-muted px-4 py-3"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="max-w-none text-sm text-foreground leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_li:first-child]:mt-0 [&_table]:w-full [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium [&_th]:bg-muted [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
