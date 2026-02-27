"use client"

import { useGameStore } from "@/lib/game-store"
import { rooms, GAME_CONFIG } from "@/lib/game-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Trophy,
  Star,
  Check,
  X,
  Share2,
  RotateCcw,
  Clock,
  Brain,
  MessageSquare,
  Bot,
  Blocks,
} from "lucide-react"

const roomIcons: Record<string, React.ReactNode> = {
  Brain: <Brain className="size-5" />,
  MessageSquare: <MessageSquare className="size-5" />,
  Bot: <Bot className="size-5" />,
  Blocks: <Blocks className="size-5" />,
}

// Mock leaderboard for demo -- in production this comes from contract.getRankings()
const MOCK_LEADERBOARD = [
  { name: "Satoshi", score: 95 },
  { name: "Vitalik", score: 90 },
  { name: "Ada", score: 85 },
  { name: "Alan", score: 80 },
  { name: "Grace", score: 75 },
]

export function GameOverScreen() {
  const { score, playerName, roomStates, timeRemaining, resetGame } = useGameStore()

  const timeUsed = GAME_CONFIG.totalTimeSeconds - timeRemaining
  const minutes = Math.floor(timeUsed / 60)
  const seconds = timeUsed % 60
  const timedOut = timeRemaining <= 0

  const allRoomsPassed = roomStates.every((rs) => rs.passed)
  const roomsCleared = roomStates.filter((rs) => rs.passed).length
  const totalHintsUsed = roomStates.reduce((acc, rs) => acc + rs.hintsUsedInRoom + (rs.endOfRoomHintUsed ? 1 : 0), 0)

  // Merge player into leaderboard
  const leaderboard = [...MOCK_LEADERBOARD, { name: playerName || "You", score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  const scorePercentage = Math.round((score / GAME_CONFIG.maxScore) * 100)

  function handleShare() {
    const text = `I scored ${score}/${GAME_CONFIG.maxScore} on the AI Escape Room! Cleared ${roomsCleared}/${GAME_CONFIG.totalRooms} rooms. Can you beat me?`
    if (navigator.share) {
      navigator.share({ title: "AI Escape Room", text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="absolute -inset-3 rounded-full bg-game-warning/20 blur-lg" />
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-game-warning/15">
            <Trophy className="size-8 text-game-warning" />
          </div>
        </div>

        <h1 className="mb-1 text-2xl font-bold text-foreground">
          {timedOut ? "Time's Up!" : allRoomsPassed ? "Congratulations!" : "Game Over"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {timedOut
            ? "You ran out of time."
            : allRoomsPassed
              ? "You escaped all rooms!"
              : `You cleared ${roomsCleared} of ${GAME_CONFIG.totalRooms} rooms.`}
        </p>
      </div>

      {/* Score display */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-center">
          <div className="relative">
            <svg className="size-28" viewBox="0 0 120 120" aria-hidden="true">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${scorePercentage * 3.27} 327`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className={cn(
                  score >= 80
                    ? "text-game-success"
                    : score >= 50
                      ? "text-game-warning"
                      : "text-game-danger"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{score}</span>
              <span className="text-xs text-muted-foreground">/ {GAME_CONFIG.maxScore}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-secondary p-2.5">
            <Clock className="mb-1 size-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground">Time Used</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary p-2.5">
            <Star className="mb-1 size-4 text-game-warning" />
            <span className="text-sm font-bold text-foreground">
              {roomsCleared}/{GAME_CONFIG.totalRooms}
            </span>
            <span className="text-[10px] text-muted-foreground">Rooms</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary p-2.5">
            <Check className="mb-1 size-4 text-game-success" />
            <span className="text-sm font-bold text-foreground">{totalHintsUsed}</span>
            <span className="text-[10px] text-muted-foreground">Hints Used</span>
          </div>
        </div>
      </div>

      {/* Room breakdown */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Room Breakdown
        </p>
        <div className="flex flex-col gap-2">
          {rooms.map((room, i) => {
            const rs = roomStates[i]
            return (
              <div
                key={room.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                  rs.passed
                    ? "border-game-success/30 bg-game-success/5"
                    : rs.completed
                      ? "border-game-danger/30 bg-game-danger/5"
                      : "border-border bg-card"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md",
                    rs.passed
                      ? "bg-game-success/15 text-game-success"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {roomIcons[room.icon]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{room.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rs.completed
                      ? rs.passed
                        ? "Passed"
                        : "Failed"
                      : "Not attempted"}
                    {rs.retryCount > 0 && ` | ${rs.retryCount} retries`}
                    {rs.hintsUsedInRoom > 0 && ` | ${rs.hintsUsedInRoom} hints`}
                  </p>
                </div>
                <div className="flex size-7 shrink-0 items-center justify-center">
                  {rs.passed ? (
                    <Check className="size-4 text-game-success" />
                  ) : rs.completed ? (
                    <X className="size-4 text-game-danger" />
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Leaderboard
        </p>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {leaderboard.map((entry, i) => {
            const isPlayer = entry.name === (playerName || "You")
            return (
              <div
                key={`${entry.name}-${i}`}
                className={cn(
                  "flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0",
                  isPlayer && "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    i === 0
                      ? "bg-game-warning/15 text-game-warning"
                      : i === 1
                        ? "bg-muted text-muted-foreground"
                        : i === 2
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                  )}
                >
                  {i + 1}
                </div>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm",
                    isPlayer ? "font-bold text-primary" : "text-foreground"
                  )}
                >
                  {entry.name}
                  {isPlayer && " (You)"}
                </span>
                <span className="text-sm font-bold text-foreground">{entry.score}</span>
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-3">
        <Button
          onClick={handleShare}
          className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
          size="lg"
        >
          <Share2 className="size-4" />
          <span>Share Results</span>
        </Button>
        <Button
          variant="outline"
          onClick={resetGame}
          className="h-10 w-full border-border text-foreground"
        >
          <RotateCcw className="size-4" />
          <span>Play Again</span>
        </Button>
      </div>
    </div>
  )
}
