"use client"

import { useGameStore } from "@/lib/game-store"
import { rooms as gameRooms, GAME_CONFIG } from "@/lib/game-data"
import { Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function GameHUD() {
  const { score, timeRemaining, penaltyAnimation, currentRoomIndex, roomStates } = useGameStore()
  const isWarning = timeRemaining <= GAME_CONFIG.warningTimeSeconds
  const isCritical = timeRemaining <= 60

  const room = gameRooms[currentRoomIndex]
  const roomState = roomStates[currentRoomIndex]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Timer */}
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-bold",
            isCritical
              ? "animate-pulse bg-game-danger/15 text-game-danger"
              : isWarning
                ? "bg-game-warning/15 text-game-warning"
                : "bg-secondary text-foreground"
          )}
        >
          <Clock className="size-3.5" />
          <span>{formatTime(timeRemaining)}</span>
        </div>

        {/* Room indicator dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: GAME_CONFIG.totalRooms }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-2 rounded-full transition-colors",
                i < currentRoomIndex
                  ? "bg-game-success"
                  : i === currentRoomIndex
                    ? "bg-primary"
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Score */}
        <div className="relative flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-foreground">
          <Zap className="size-3.5 text-game-warning" />
          <span>{score}</span>
          <span className="text-xs font-normal text-muted-foreground">pts</span>
          {penaltyAnimation && (
            <span
              className={cn(
                "absolute -bottom-6 right-0 animate-bounce text-xs font-bold",
                penaltyAnimation.type === "retry" ? "text-game-danger" : "text-game-warning"
              )}
            >
              -{penaltyAnimation.amount}
            </span>
          )}
        </div>
      </div>

      {/* Question progress bar */}
      {room && roomState && (
        <div className="flex gap-1 px-4 pb-2">
          {room.questions.map((q, i) => {
            const answered = q.id in roomState.correctAnswers
            const isCurrent = i === roomState.currentQuestionIndex && !roomState.completed
            return (
              <div
                key={q.id}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  answered ? "bg-game-success" : isCurrent ? "bg-primary" : "bg-muted"
                )}
              />
            )
          })}
        </div>
      )}
    </header>
  )
}
