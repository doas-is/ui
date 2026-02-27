"use client"

import { useGameStore, useCurrentRoom } from "@/lib/game-store"
import { rooms, GAME_CONFIG } from "@/lib/game-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Check,
  X,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Trophy,
  Brain,
  MessageSquare,
  Bot,
  Blocks,
  AlertTriangle,
  HelpCircle,
} from "lucide-react"

const roomIcons: Record<string, React.ReactNode> = {
  Brain: <Brain className="size-6" />,
  MessageSquare: <MessageSquare className="size-6" />,
  Bot: <Bot className="size-6" />,
  Blocks: <Blocks className="size-6" />,
}

export function RoomResultScreen() {
  const {
    currentRoomIndex,
    score,
    proceedToNextRoom,
    useHint,
    retryRoom,
  } = useGameStore()
  const { room, roomState } = useCurrentRoom()

  if (!room || !roomState) return null

  const correctCount = Object.values(roomState.correctAnswers).filter(Boolean).length
  const passed = roomState.passed
  const isLastRoom = currentRoomIndex >= rooms.length - 1
  const nextRoom = !isLastRoom ? rooms[currentRoomIndex + 1] : null
  const hintRevealed = roomState.hintUsed

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col px-4 py-6">
      {/* Result Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          className={cn(
            "mb-4 flex size-16 items-center justify-center rounded-2xl",
            passed ? "bg-game-success/15" : "bg-game-danger/15"
          )}
        >
          {passed ? (
            <Trophy className="size-8 text-game-success" />
          ) : (
            <AlertTriangle className="size-8 text-game-danger" />
          )}
        </div>

        <h2 className="mb-1 text-2xl font-bold text-foreground">
          {passed ? "Room Cleared!" : "Room Failed"}
        </h2>
        <p className="mb-1 text-sm text-muted-foreground">
          Room {room.id}: {room.name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-3xl font-bold",
              passed ? "text-game-success" : "text-game-danger"
            )}
          >
            {correctCount}/{room.questions.length}
          </span>
          <span className="text-sm text-muted-foreground">correct</span>
        </div>
        {!passed && (
          <p className="mt-2 text-xs text-muted-foreground">
            You need at least {GAME_CONFIG.passingThreshold}/{room.questions.length} to pass this room.
          </p>
        )}
      </div>

      {/* Question results — only show details if hint was used */}
      <div className="mb-6 space-y-2">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Question Results
        </p>
        {room.questions.map((q, i) => {
          const isCorrect = roomState.correctAnswers[q.id]
          const isWrong = !isCorrect && q.id in roomState.correctAnswers

          // If hint NOT used, don't reveal which specific ones were wrong
          // Just show generic "answered" state for all
          if (!hintRevealed) {
            return (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                  <HelpCircle className="size-3.5" />
                </div>
                <span className="flex-1 text-sm text-card-foreground">
                  Question {i + 1}
                </span>
                <span className="text-xs text-muted-foreground">Submitted</span>
              </div>
            )
          }

          // Hint was used — reveal correct/wrong per question
          return (
            <div
              key={q.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                isCorrect
                  ? "border-game-success/30 bg-game-success/5"
                  : "border-game-danger/30 bg-game-danger/5"
              )}
            >
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                  isCorrect
                    ? "bg-game-success/15 text-game-success"
                    : "bg-game-danger/15 text-game-danger"
                )}
              >
                {isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              </div>
              <span className="flex-1 text-sm text-card-foreground">
                Question {i + 1}
                {isWrong && (
                  <span className="ml-2 text-xs text-game-danger">-- Wrong answer</span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-3">
        {passed ? (
          <Button
            onClick={proceedToNextRoom}
            className="h-12 w-full bg-game-success text-game-success-foreground hover:bg-game-success/90 text-base font-semibold"
            size="lg"
          >
            {isLastRoom ? "Finish Game" : `Enter Room ${currentRoomIndex + 2}`}
            <ChevronRight className="size-5" />
          </Button>
        ) : (
          <>
            {/* Hint — reveals which questions were wrong, costs -10 pts */}
            {!roomState.hintUsed && (
              <Button
                variant="outline"
                onClick={useHint}
                className="h-11 w-full border-game-warning/50 text-game-warning hover:bg-game-warning/10"
              >
                <Lightbulb className="size-4" />
                Use Hint (-{GAME_CONFIG.hintPenalty} pts) -- Reveal wrong answers
              </Button>
            )}

            {/* Retry — does NOT reveal wrong answers, costs -5 pts */}
            <Button
              onClick={retryRoom}
              className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
              size="lg"
            >
              <RotateCcw className="size-4" />
              Retry Room (-{GAME_CONFIG.retryPenalty} pts)
            </Button>

            {!roomState.hintUsed && (
              <p className="text-center text-xs text-muted-foreground/70">
                Hint reveals which answers were wrong so you can focus on them during retry.
              </p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Current score: <span className="font-semibold text-foreground">{score} pts</span>
              {roomState.retryCount > 0 && (
                <> &middot; Retries: {roomState.retryCount}</>
              )}
            </p>
          </>
        )}

        {/* Next room preview */}
        {passed && nextRoom && (
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {roomIcons[nextRoom.icon]}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Next up</p>
              <p className="text-sm font-semibold text-foreground">
                Room {nextRoom.id}: {nextRoom.name}
              </p>
              <p className="text-xs text-muted-foreground">{nextRoom.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
