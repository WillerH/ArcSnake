"use client"

import type React from "react"
import dynamic from "next/dynamic"

const Web3Providers = dynamic(() => import("@/components/Web3Providers"), {
  ssr: false,
})

export function ClientWeb3Providers({ children }: { children: React.ReactNode }) {
  return <Web3Providers>{children}</Web3Providers>
}
