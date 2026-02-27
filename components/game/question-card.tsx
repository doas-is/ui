"use client"

import { useGameStore, useCurrentRoom, useCurrentQuestion } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight, Brain, MessageSquare, Bot, Blocks } from "lucide-react"

const roomIcons: Record<string, React.ReactNode> = {
  Brain: <Brain className="size-5" />,
  MessageSquare: <MessageSquare className="size-5" />,
  Bot: <Bot className="size-5" />,
  Blocks: <Blocks className="size-5" />,
}

const optionLabels = ["A", "B", "C", "D"]

export function QuestionCard() {
  const { selectedAnswer, answerConfirmed, confirmAnswerImmediate, nextQuestion } = useGameStore()
  const { room, roomState } = useCurrentRoom()
  const question = useCurrentQuestion()

  if (!room || !roomState || !question) return null

  const hasSelected = answerConfirmed

  function handleOptionClick(optionIndex: number) {
    if (hasSelected) return
    // Immediately record and confirm the answer (no feedback shown)
    confirmAnswerImmediate(optionIndex)
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-4">
      {/* Room header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          {roomIcons[room.icon]}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Room {room.id}
          </p>
          <p className="text-sm font-semibold text-foreground">{room.name}</p>
        </div>
        <div className="ml-auto rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Q{roomState.currentQuestionIndex + 1}/{room.questions.length}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <p className="text-base font-medium leading-relaxed text-card-foreground">
          {question.text}
        </p>
      </div>

      {/* Options — no correct/wrong colors, just selected state */}
      <div className="mb-6 flex flex-col gap-3">
        {question.options.map((option, i) => {
          const isSelected = hasSelected && selectedAnswer === i

          return (
            <button
              key={i}
              onClick={() => handleOptionClick(i)}
              disabled={hasSelected}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                !hasSelected && "border-border bg-card hover:border-primary/50 hover:bg-secondary active:scale-[0.98]",
                isSelected && "border-primary bg-primary/10",
                hasSelected && !isSelected && "border-border bg-card opacity-40"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  !hasSelected && "bg-secondary text-muted-foreground",
                  isSelected && "bg-primary text-primary-foreground",
                  hasSelected && !isSelected && "bg-secondary text-muted-foreground"
                )}
              >
                {optionLabels[i]}
              </span>
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  isSelected ? "font-medium text-foreground" : "text-card-foreground"
                )}
              >
                {option}
              </span>
            </button>
          )
        })}
      </div>

      {/* Next button — only shows after selecting */}
      <div className="mt-auto">
        {hasSelected && (
          <Button
            onClick={nextQuestion}
            className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
            size="lg"
          >
            {roomState.currentQuestionIndex >= room.questions.length - 1 ? "Submit Room" : "Next Question"}
            <ChevronRight className="size-5" />
          </Button>
        )}
      </div>

      {/* Minimal confirmation — no reveal of correctness */}
      {hasSelected && (
        <div className="mt-3 rounded-lg bg-secondary px-4 py-3 text-center text-sm font-medium text-muted-foreground">
          Answer recorded. {roomState.currentQuestionIndex >= room.questions.length - 1
            ? "Submit to see your results."
            : "Proceed to the next question."}
        </div>
      )}
    </div>
  )
}
