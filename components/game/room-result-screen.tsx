"use client"

import { useGameStore, useCurrentRoom } from "@/lib/game-store"
import { rooms, GAME_CONFIG } from "@/lib/game-data"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Trophy,
  Brain,
  MessageSquare,
  Bot,
  Blocks,
  AlertTriangle,
  Check,
  X,
} from "lucide-react"

const roomIcons: Record<string, React.ReactNode> = {
  Brain: <Brain className="size-6" />,
  MessageSquare: <MessageSquare className="size-6" />,
  Bot: <Bot className="size-6" />,
  Blocks: <Blocks className="size-6" />,
}

export function RoomResultScreen() {
  const { currentRoomIndex, score, proceedToNextRoom, useEndOfRoomHint, retryRoom } =
    useGameStore()
  const { room, roomState } = useCurrentRoom()

  if (!room || !roomState) return null

  const passed = roomState.passed
  const isLastRoom = currentRoomIndex >= rooms.length - 1
  const nextRoom = !isLastRoom ? rooms[currentRoomIndex + 1] : null

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
        <p className="mb-2 text-sm text-muted-foreground">
          Room {room.id}: {room.name}
        </p>

        {/* Only show score if hint was used */}
        {roomState.endOfRoomHintUsed && roomState.endOfRoomHintResult && (
          <div className="mt-2 rounded-lg border border-game-warning/30 bg-game-warning/10 px-4 py-2">
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="text-2xl font-bold text-game-warning">{roomState.endOfRoomHintResult}</p>
          </div>
        )}

        {!passed && !roomState.endOfRoomHintUsed && (
          <p className="mt-2 text-xs text-muted-foreground">
            {"You need at least "}
            {GAME_CONFIG.passingThreshold}/{room.questions.length}
            {" correct to pass."}
          </p>
        )}
      </div>

      {/* Info about what happened */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        {passed ? (
          <p className="text-center text-sm leading-relaxed text-card-foreground">
            {"You passed this room with at least "}
            {GAME_CONFIG.passingThreshold}/{room.questions.length}
            {" correct answers. Well done!"}
          </p>
        ) : roomState.endOfRoomHintUsed ? (
          /* After hint: show each question with correct/wrong indicator */
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Question Breakdown
            </p>
            {room.questions.map((q, i) => {
              const wasCorrect = roomState.correctAnswers[q.id] === true
              return (
                <div
                  key={q.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
                    wasCorrect
                      ? "border-game-success/30 bg-game-success/5"
                      : "border-game-danger/30 bg-game-danger/5"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                      wasCorrect ? "bg-game-success/20" : "bg-game-danger/20"
                    )}
                  >
                    {wasCorrect ? (
                      <Check className="size-3 text-game-success" />
                    ) : (
                      <X className="size-3 text-game-danger" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      wasCorrect ? "text-game-success" : "text-game-danger"
                    )}
                  >
                    {"Q"}{i + 1}{": "}{q.text.length > 70 ? q.text.slice(0, 70) + "..." : q.text}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-sm leading-relaxed text-card-foreground">
            {"You did not reach the passing threshold of "}
            {GAME_CONFIG.passingThreshold}/{room.questions.length}
            {". Use a hint to see your score, or retry the room."}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-3">
        {passed ? (
          <Button
            onClick={proceedToNextRoom}
            className="h-12 w-full bg-game-success text-game-success-foreground hover:bg-game-success/90 text-base font-semibold"
            size="lg"
          >
            <span>{isLastRoom ? "Finish Game" : `Enter Room ${currentRoomIndex + 2}`}</span>
            <ChevronRight className="size-5" />
          </Button>
        ) : (
          <>
            {/* End-of-room hint: shows score like "3/5", costs -10 pts */}
            {!roomState.endOfRoomHintUsed && (
              <Button
                variant="outline"
                onClick={useEndOfRoomHint}
                className="h-11 w-full border-game-warning/50 text-game-warning hover:bg-game-warning/10"
              >
                <Lightbulb className="size-4" />
                <span>Use Hint (-{GAME_CONFIG.hintPenaltyEndRoom} pts) -- See your score</span>
              </Button>
            )}

            {/* Retry */}
            <Button
              onClick={retryRoom}
              className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
              size="lg"
            >
              <RotateCcw className="size-4" />
              <span>Retry Room (-{GAME_CONFIG.retryPenalty} pts)</span>
            </Button>

            {!roomState.endOfRoomHintUsed && (
              <p className="text-center text-xs text-muted-foreground/70">
                Hint reveals your score and which questions were wrong.
              </p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {"Current score: "}
              <span className="font-semibold text-foreground">{score} pts</span>
              {roomState.retryCount > 0 && (
                <span>{" / Retries: "}{roomState.retryCount}</span>
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
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Next up</p>
              <p className="text-sm font-semibold text-foreground">
                Room {nextRoom.id}: {nextRoom.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{nextRoom.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
