"use client"

import { createContext, useContext, useSyncExternalStore } from "react"
import { rooms, GAME_CONFIG, type Question } from "@/lib/game-data"

// ─── Types ──────────────────────────────────────────────────────

export type GameScreen = "login" | "welcome" | "playing" | "room-result" | "game-over"

export interface RoomState {
  roomId: number
  answers: Record<string, number | null> // questionId -> selected option index
  correctAnswers: Record<string, boolean> // questionId -> was it correct
  currentQuestionIndex: number
  hintsUsedInRoom: number // 0-2, per-question hints used in this room
  eliminatedOptions: Record<string, number[]> // questionId -> eliminated option indices
  endOfRoomHintUsed: boolean
  endOfRoomHintResult: string | null // e.g., "3/5"
  retryCount: number
  completed: boolean
  passed: boolean
}

export interface GameState {
  screen: GameScreen
  score: number
  currentRoomIndex: number
  roomStates: RoomState[]
  timeRemaining: number
  isTimerRunning: boolean
  selectedAnswer: number | null
  answerConfirmed: boolean
  penaltyAnimation: { amount: number; type: "retry" | "hint" | "room-hint" } | null
}

type Listener = () => void

function createInitialRoomState(roomId: number): RoomState {
  return {
    roomId,
    answers: {},
    correctAnswers: {},
    currentQuestionIndex: 0,
    hintsUsedInRoom: 0,
    eliminatedOptions: {},
    endOfRoomHintUsed: false,
    endOfRoomHintResult: null,
    retryCount: 0,
    completed: false,
    passed: false,
  }
}

function createInitialState(): GameState {
  return {
    screen: "login",
    score: GAME_CONFIG.startingScore,
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
  function goToWelcome() {
    setState({ screen: "welcome" })
  }

  function startGame() {
    setState({
      ...createInitialState(),
      screen: "playing",
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

    setState({
      roomStates: newRoomStates,
      selectedAnswer: optionIndex,
      answerConfirmed: true,
    })
  }

  function confirmAnswer() {
    const { selectedAnswer } = state
    if (selectedAnswer === null) return
    confirmAnswerImmediate(selectedAnswer)
  }

  function nextQuestion() {
    const { currentRoomIndex, roomStates } = state
    const roomState = roomStates[currentRoomIndex]
    const room = rooms[currentRoomIndex]

    if (roomState.currentQuestionIndex >= room.questions.length - 1) {
      // Room finished — check results
      const correctCount = Object.values(roomState.correctAnswers).filter(Boolean).length
      const passed = correctCount >= GAME_CONFIG.passingThreshold

      const newRoomStates = [...roomStates]
      newRoomStates[currentRoomIndex] = {
        ...roomState,
        completed: true,
        passed,
      }

      setState({
        roomStates: newRoomStates,
        screen: "room-result",
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

  /**
   * Per-question hint: eliminates 1 wrong answer option.
   * Costs -5 from score, max 2 per room.
   * Can only be used BEFORE answering the current question.
   */
  function useQuestionHint() {
    const { currentRoomIndex, roomStates, score } = state
    const roomState = roomStates[currentRoomIndex]
    const room = rooms[currentRoomIndex]
    const question = room.questions[roomState.currentQuestionIndex]

    // Check constraints
    if (roomState.hintsUsedInRoom >= GAME_CONFIG.maxHintsPerRoom) return
    if (state.answerConfirmed) return // can't hint after answering

    // Find wrong options that haven't been eliminated yet
    const currentEliminated = roomState.eliminatedOptions[question.id] || []
    const wrongOptions = question.options
      .map((_, i) => i)
      .filter((i) => i !== question.correctIndex && !currentEliminated.includes(i))

    if (wrongOptions.length === 0) return

    // Pick a random wrong option to eliminate
    const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)]

    const newRoomStates = [...roomStates]
    const newRoomState = { ...roomState }
    newRoomState.hintsUsedInRoom = roomState.hintsUsedInRoom + 1
    newRoomState.eliminatedOptions = {
      ...roomState.eliminatedOptions,
      [question.id]: [...currentEliminated, toEliminate],
    }
    newRoomStates[currentRoomIndex] = newRoomState

    setState({
      roomStates: newRoomStates,
      score: Math.max(0, score - GAME_CONFIG.hintPenaltyPerQuestion),
      penaltyAnimation: { amount: GAME_CONFIG.hintPenaltyPerQuestion, type: "hint" },
    })

    setTimeout(() => setState({ penaltyAnimation: null }), 1500)
  }

  /**
   * End-of-room hint: shows "X/5" correct count.
   * Costs -10 from score, only available on failed rooms.
   * Independent from per-question hints.
   */
  function useEndOfRoomHint() {
    const { currentRoomIndex, roomStates, score } = state
    const roomState = roomStates[currentRoomIndex]
    const room = rooms[currentRoomIndex]

    if (roomState.endOfRoomHintUsed) return
    if (roomState.passed) return // only on failed rooms

    const correctCount = Object.values(roomState.correctAnswers).filter(Boolean).length

    const newRoomStates = [...roomStates]
    newRoomStates[currentRoomIndex] = {
      ...roomState,
      endOfRoomHintUsed: true,
      endOfRoomHintResult: `${correctCount}/${room.questions.length}`,
    }

    setState({
      roomStates: newRoomStates,
      score: Math.max(0, score - GAME_CONFIG.hintPenaltyEndRoom),
      penaltyAnimation: { amount: GAME_CONFIG.hintPenaltyEndRoom, type: "room-hint" },
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
    goToWelcome,
    startGame,
    selectAnswer,
    confirmAnswer,
    confirmAnswerImmediate,
    nextQuestion,
    proceedToNextRoom,
    useQuestionHint,
    useEndOfRoomHint,
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
