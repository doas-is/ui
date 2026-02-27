"use client"

import { GameProvider } from "@/lib/game-store"
import { GameShell } from "@/components/game/game-shell"

export default function Home() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  )
}
