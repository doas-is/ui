"use client"

import { createContext, useContext, useCallback, useMemo, useSyncExternalStore } from "react"
import { rooms, GAME_CONFIG, type Question } from "@/lib/game-data"

// ─── Types ──────────────────────────────────────────────────────

export type GameScreen = "welcome" | "playing" | "room-result" | "game-over"

export interface RoomState {
  roomId: number
  answers: Record<string, number | null> // questionId -> selected option index
  correctAnswers: Record<string, boolean> // questionId -> was it correct
  currentQuestionIndex: number
  hintUsed: boolean // single hint: reveals wrong questions for -5 pts
  retryCount: number
  completed: boolean
  passed: boolean
}

export interface GameState {
  screen: GameScreen
  playerName: string
  score: number
  currentRoomIndex: number
  roomStates: RoomState[]
  timeRemaining: number
  isTimerRunning: boolean
  selectedAnswer: number | null
  answerConfirmed: boolean
  penaltyAnimation: { amount: number; type: "retry" | "hint" } | null
}

type Listener = () => void

function createInitialRoomState(roomId: number): RoomState {
  return {
    roomId,
    answers: {},
    correctAnswers: {},
    currentQuestionIndex: 0,
    hintUsed: false,
    retryCount: 0,
    completed: false,
    passed: false,
  }
}

function createInitialState(): GameState {
  return {
    screen: "welcome",
    playerName: "",
    score: 0,
    currentRoomIndex: 0,
    roomStates: rooms.map((r) => createInitialRoomState(r.id)),
    timeRemaining: GAME_CONFIG.totalTimeSeconds,
    isTimerRunning: false,
    selectedAnswer: null,
    answerConfirmed: false,
    penaltyAnimation: null,
  }
}

// ─── Store ──────────────────────────────────────────────────────

function createGameStore() {
  let state = createInitialState()
  const listeners = new Set<Listener>()
  let timerInterval: ReturnType<typeof setInterval> | null = null

  function getState() {
    return state
  }

  function setState(partial: Partial<GameState> | ((prev: GameState) => Partial<GameState>)) {
    const updates = typeof partial === "function" ? partial(state) : partial
    state = { ...state, ...updates }
    listeners.forEach((l) => l())
  }

  function subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  // Timer
  function startTimer() {
    if (timerInterval) return
    setState({ isTimerRunning: true })
    timerInterval = setInterval(() => {
      setState((prev) => {
        const next = prev.timeRemaining - 1
        if (next <= 0) {
          stopTimer()
          return { timeRemaining: 0, screen: "game-over", isTimerRunning: false }
        }
        return { timeRemaining: next }
      })
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    setState({ isTimerRunning: false })
  }

  // Actions
  function startGame(name: string) {
    setState({
      ...createInitialState(),
      screen: "playing",
      playerName: name,
    })
    startTimer()
  }

  function selectAnswer(optionIndex: number) {
    setState({ selectedAnswer: optionIndex })
  }

  function confirmAnswerImmediate(optionIndex: number) {
    const { currentRoomIndex, roomStates } = state

    const roomState = roomStates[currentRoomIndex]
    const room = rooms[currentRoomIndex]
    const question = room.questions[roomState.currentQuestionIndex]
    const isCorrect = optionIndex === question.correctIndex

    const newRoomStates = [...roomStates]
    const newRoomState = { ...roomState }
    newRoomState.answers = { ...newRoomState.answers, [question.id]: optionIndex }
    newRoomState.correctAnswers = { ...newRoomState.correctAnswers, [question.id]: isCorrect }
    newRoomStates[currentRoomIndex] = newRoomState

    // No scoring here — scoring happens at end of room
    setState({
      roomStates: newRoomStates,
      selectedAnswer: optionIndex,
      answerConfirmed: true,
    })
  }

  function confirmAnswer() {
    // kept for compatibility but confirmAnswerImmediate is preferred
    const { selectedAnswer } = state
    if (selectedAnswer === null) return
    confirmAnswerImmediate(selectedAnswer)
  }

  function nextQuestion() {
    const { currentRoomIndex, roomStates } = state
    const roomState = roomStates[currentRoomIndex]
    const room = rooms[currentRoomIndex]

    if (roomState.currentQuestionIndex >= room.questions.length - 1) {
      // Room finished — check results and calculate score
      const correctCount = Object.values(roomState.correctAnswers).filter(Boolean).length
      const passed = correctCount >= GAME_CONFIG.passingThreshold
      const roomScore = correctCount * GAME_CONFIG.pointsPerCorrect

      const newRoomStates = [...roomStates]
      newRoomStates[currentRoomIndex] = {
        ...roomState,
        completed: true,
        passed,
      }

      setState({
        roomStates: newRoomStates,
        screen: "room-result",
        score: state.score + roomScore,
        selectedAnswer: null,
        answerConfirmed: false,
      })
    } else {
      // Next question in room
      const newRoomStates = [...roomStates]
      newRoomStates[currentRoomIndex] = {
        ...roomState,
        currentQuestionIndex: roomState.currentQuestionIndex + 1,
      }

      setState({
        roomStates: newRoomStates,
        selectedAnswer: null,
        answerConfirmed: false,
      })
    }
  }

  function proceedToNextRoom() {
    const { currentRoomIndex } = state
    if (currentRoomIndex >= rooms.length - 1) {
      stopTimer()
      setState({ screen: "game-over" })
    } else {
      setState({
        currentRoomIndex: currentRoomIndex + 1,
        screen: "playing",
        selectedAnswer: null,
        answerConfirmed: false,
      })
    }
  }

  function useHint() {
    const { currentRoomIndex, roomStates, score } = state
    const roomState = roomStates[currentRoomIndex]
    if (roomState.hintUsed) return // already used hint
    if (!roomState.completed) return // only after room attempt

    const newRoomStates = [...roomStates]
    newRoomStates[currentRoomIndex] = {
      ...roomState,
      hintUsed: true,
    }

    setState({
      roomStates: newRoomStates,
      score: Math.max(0, score - GAME_CONFIG.hintPenalty),
      penaltyAnimation: { amount: GAME_CONFIG.hintPenalty, type: "hint" },
    })

    setTimeout(() => setState({ penaltyAnimation: null }), 1500)
  }

  function retryRoom() {
    const { currentRoomIndex, roomStates, score } = state
    const roomState = roomStates[currentRoomIndex]

    const newRoomStates = [...roomStates]
    newRoomStates[currentRoomIndex] = {
      ...createInitialRoomState(roomState.roomId),
      retryCount: roomState.retryCount + 1,
    }

    setState({
      roomStates: newRoomStates,
      score: Math.max(0, score - GAME_CONFIG.retryPenalty),
      screen: "playing",
      selectedAnswer: null,
      answerConfirmed: false,
      penaltyAnimation: { amount: GAME_CONFIG.retryPenalty, type: "retry" },
    })

    setTimeout(() => setState({ penaltyAnimation: null }), 1500)
  }

  function resetGame() {
    stopTimer()
    setState(createInitialState())
  }

  return {
    getState,
    subscribe,
    startGame,
    selectAnswer,
    confirmAnswer,
    confirmAnswerImmediate,
    nextQuestion,
    proceedToNextRoom,
    useHint,
    retryRoom,
    resetGame,
    stopTimer,
  }
}

// ─── Singleton ──────────────────────────────────────────────────

const store = createGameStore()

export type GameStore = ReturnType<typeof createGameStore>

const GameContext = createContext<GameStore>(store)

export function GameProvider({ children }: { children: React.ReactNode }) {
  return <GameContext.Provider value={store}>{children}</GameContext.Provider>
}

export function useGameStore() {
  const s = useContext(GameContext)
  const state = useSyncExternalStore(s.subscribe, s.getState, s.getState)
  return { ...state, ...s }
}

export function useCurrentRoom() {
  const { currentRoomIndex, roomStates } = useGameStore()
  return {
    room: rooms[currentRoomIndex],
    roomState: roomStates[currentRoomIndex],
  }
}

export function useCurrentQuestion(): Question | null {
  const { room, roomState } = useCurrentRoom()
  if (!room || !roomState) return null
  return room.questions[roomState.currentQuestionIndex] ?? null
}
