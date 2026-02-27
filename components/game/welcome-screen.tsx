"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/game-store"
import { GAME_CONFIG, rooms } from "@/lib/game-data"
import {
  Brain,
  MessageSquare,
  Bot,
  Blocks,
  Clock,
  Target,
  Lightbulb,
  RotateCcw,
  ChevronRight,
  Shield,
} from "lucide-react"

const roomIcons: Record<string, React.ReactNode> = {
  Brain: <Brain className="size-5" />,
  MessageSquare: <MessageSquare className="size-5" />,
  Bot: <Bot className="size-5" />,
  Blocks: <Blocks className="size-5" />,
}

export function WelcomeScreen() {
  const { startGame } = useGameStore()
  const [name, setName] = useState("")
  const [showRules, setShowRules] = useState(false)

  const handleStart = () => {
    if (name.trim().length < 2) return
    startGame(name.trim())
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-primary/30 bg-card">
            <Shield className="size-10 text-primary" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground">
          AI Escape Room
        </h1>
        <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
          Navigate 4 rooms of AI challenges. Answer questions, earn points, and escape before time runs out.
        </p>

        {/* Name input */}
        <div className="mb-6 w-full max-w-xs">
          <label htmlFor="player-name" className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Player Name
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="h-12 w-full rounded-lg border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            maxLength={30}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
        </div>

        {/* Action buttons */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button
            onClick={handleStart}
            disabled={name.trim().length < 2}
            className="h-12 w-full bg-game-success text-game-success-foreground hover:bg-game-success/90 text-base font-semibold"
            size="lg"
          >
            Start Game
            <ChevronRight className="size-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRules(!showRules)}
            className="h-10 w-full border-border text-foreground"
          >
            {showRules ? "Hide Rules" : "View Rules"}
          </Button>
        </div>
      </div>

      {/* Rules section */}
      {showRules && (
        <div className="border-t border-border bg-card px-4 py-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Game Rules</h2>

          {/* Stats grid */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <RuleStat icon={<Target className="size-4 text-primary" />} label="Max Score" value={`${GAME_CONFIG.maxScore} pts`} />
            <RuleStat icon={<Clock className="size-4 text-game-warning" />} label="Time Limit" value="15 min" />
            <RuleStat icon={<Lightbulb className="size-4 text-game-warning" />} label="Hint Penalty" value="-10 pts" />
            <RuleStat icon={<RotateCcw className="size-4 text-game-danger" />} label="Retry Penalty" value="-5 pts" />
          </div>

          {/* Rules list */}
          <div className="mb-6 space-y-3">
            <RuleItem number={1} text="4 rooms must be completed in sequence." />
            <RuleItem number={2} text={`Each room has ${GAME_CONFIG.questionsPerRoom} multiple-choice questions (4 options).`} />
            <RuleItem number={3} text={`You earn ${GAME_CONFIG.pointsPerCorrect} points per correct answer.`} />
            <RuleItem number={4} text={`You need at least ${GAME_CONFIG.passingThreshold}/${GAME_CONFIG.questionsPerRoom} correct to pass a room.`} />
            <RuleItem number={5} text="Answers are not revealed during the quiz. Results come after submitting the room." />
            <RuleItem number={6} text="If you fail, use Hint (-10 pts) to see which questions were wrong." />
            <RuleItem number={7} text="Retry resets the room with a -5 pts penalty (wrong answers stay hidden)." />
            <RuleItem number={8} text="The global timer of 15 minutes applies to the entire game." />
          </div>

          {/* Rooms preview */}
          <h3 className="mb-3 text-sm font-semibold text-foreground">Rooms</h3>
          <div className="space-y-2">
            {rooms.map((room, i) => (
              <div key={room.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {roomIcons[room.icon]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Room {i + 1}: {room.name}</p>
                  <p className="text-xs text-muted-foreground">{room.questions.length} questions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RuleStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/50 px-3 py-2.5">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function RuleItem({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {number}
      </span>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}
