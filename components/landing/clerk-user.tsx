"use client"

import { UserButton, useUser } from "@clerk/nextjs"

export default function ClerkUser({ initials }: { initials: string }) {
  const { user } = useUser()

  const displayInitials = (
    user?.firstName?.charAt(0) ||
    user?.emailAddresses[0]?.emailAddress?.charAt(0) ||
    initials
  ).toUpperCase()

  return (
    <div className="relative flex items-center justify-center">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "size-8",
            userButtonAvatarImage: "opacity-0",
          },
        }}
      />
      <div className="pointer-events-none absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
        {displayInitials}
      </div>
    </div>
  )
}
