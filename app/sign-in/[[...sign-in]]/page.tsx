"use client"

import { useAuth } from "@clerk/nextjs"
import { SignIn } from "@clerk/nextjs"
import { useEffect } from "react"

export default function SignInPage() {
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      window.location.href = "/dashboard"
    }
  }, [isSignedIn])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {!isSignedIn && <SignIn />}
    </div>
  )
}
