"use client"

import { Web3AuthProvider } from "@/lib/web3auth"
import { GameProvider } from "@/lib/game-store"
import { GameShell } from "@/components/game/game-shell"

export default function Home() {
  return (
    <Web3AuthProvider>
      <GameProvider>
        <GameShell />
      </GameProvider>
    </Web3AuthProvider>
  )
}
