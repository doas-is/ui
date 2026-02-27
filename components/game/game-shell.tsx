"use client"

import { useGameStore } from "@/lib/game-store"
import { WelcomeScreen } from "@/components/game/welcome-screen"
import { GameHUD } from "@/components/game/game-hud"
import { QuestionCard } from "@/components/game/question-card"
import { RoomResultScreen } from "@/components/game/room-result-screen"
import { GameOverScreen } from "@/components/game/game-over-screen"

export function GameShell() {
  const { screen } = useGameStore()

  if (screen === "welcome") {
    return <WelcomeScreen />
  }

  if (screen === "game-over") {
    return <GameOverScreen />
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <GameHUD />
      <main className="flex flex-1 flex-col">
        {screen === "playing" && <QuestionCard />}
        {screen === "room-result" && <RoomResultScreen />}
      </main>
    </div>
  )
}
