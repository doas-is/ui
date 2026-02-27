/**
 * Integration Layer — UI ↔ Smart Contract
 *
 * This file documents all contract interactions and provides async functions
 * that the UI calls. Currently the game runs locally (UI-first), but each
 * function here shows exactly how to wire it to the on-chain contract.
 *
 * When ready to go on-chain, uncomment the ethers calls and remove the
 * local-only fallbacks.
 */

import { CONTRACT_CONFIG, CONTRACT_ABI } from "@/lib/contract"

// Types matching the contract's return values
export interface PlayerStats {
  gameStarted: boolean
  currentRoom: number
  score: number
  gameFinished: boolean
  timeExpired: boolean
  totalHintsUsed: number
  startTime: number
  timeRemainingSeconds: number
  rank: number
}

export interface RoomStateOnChain {
  state: number // 0=Locked, 1=Active, 2=Passed
  correctCount: number
  retryCount: number
  hintsUsedInRoom: number
  hintOneUsed: boolean
  hintTwoUsed: boolean
}

export interface RankEntry {
  player: string
  score: number
  totalHints: number
  rank: number
  gameFinished: boolean
}

// ─── Contract interaction functions ─────────────────────────────

/**
 * Register a player on-chain.
 * Call after Web3Auth login if player is not already registered.
 */
export async function registerPlayer(signer: unknown): Promise<void> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer as ethers.Signer)
  // const tx = await contract.register()
  // await tx.wait()
  console.log("[integration] registerPlayer called — local mode, no-op")
}

/**
 * Start game on-chain. Triggers the 15-minute countdown.
 */
export async function startGameOnChain(signer: unknown): Promise<void> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer as ethers.Signer)
  // const tx = await contract.startGame()
  // await tx.wait()
  console.log("[integration] startGameOnChain called — local mode, no-op")
}

/**
 * Submit an answer on-chain.
 * answer = plain text answer string (contract normalizes to lowercase)
 * quizId = 1-5 within the current room
 */
export async function submitAnswerOnChain(
  signer: unknown,
  quizId: number,
  answer: string
): Promise<{ isCorrect: boolean; newScore: number } | null> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer as ethers.Signer)
  // const tx = await contract.submitAnswer(quizId, answer)
  // const receipt = await tx.wait()
  // const event = receipt.logs
  //   .map((log: any) => contract.interface.parseLog(log))
  //   .find((e: any) => e?.name === "AnswerResult")
  // return { isCorrect: event.args.correct, newScore: Number(event.args.newScore) }
  console.log("[integration] submitAnswerOnChain called — local mode", { quizId, answer })
  return null
}

/**
 * Retry current room on-chain. Applies -5 pts penalty.
 */
export async function retryRoomOnChain(signer: unknown): Promise<void> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer as ethers.Signer)
  // const tx = await contract.retryRoom()
  // await tx.wait()
  console.log("[integration] retryRoomOnChain called — local mode, no-op")
}

/**
 * Request a hint on-chain.
 * Requires a signature from Person 2 via Person 4's backend API.
 */
export async function requestHintOnChain(
  signer: unknown,
  roomId: number,
  hintLevel: number,
  signature: string
): Promise<{ revealedQuizId: number; choiceRemoved: boolean } | null> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer as ethers.Signer)
  // const tx = await contract.requestHint(roomId, hintLevel, signature)
  // const receipt = await tx.wait()
  // const event = receipt.logs
  //   .map((log: any) => contract.interface.parseLog(log))
  //   .find((e: any) => e?.name === "HintGranted")
  // return {
  //   revealedQuizId: Number(event.args.revealedQuizId),
  //   choiceRemoved: event.args.choiceRemoved,
  // }
  console.log("[integration] requestHintOnChain called — local mode", { roomId, hintLevel })
  return null
}

/**
 * Get player stats from the contract.
 */
export async function getPlayerStats(
  provider: unknown,
  address: string
): Promise<PlayerStats | null> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider as ethers.Provider)
  // const stats = await contract.getMyStats(address)
  // return {
  //   gameStarted: stats[0],
  //   currentRoom: Number(stats[1]),
  //   score: Number(stats[2]),
  //   gameFinished: stats[3],
  //   timeExpired: stats[4],
  //   totalHintsUsed: Number(stats[5]),
  //   startTime: Number(stats[6]),
  //   timeRemainingSeconds: Number(stats[7]),
  //   rank: Number(stats[8]),
  // }
  console.log("[integration] getPlayerStats called — local mode", { address })
  return null
}

/**
 * Get room state from the contract.
 */
export async function getRoomStateOnChain(
  provider: unknown,
  address: string,
  roomId: number
): Promise<RoomStateOnChain | null> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider as ethers.Provider)
  // const room = await contract.getRoomState(address, roomId)
  // return {
  //   state: Number(room[0]),
  //   correctCount: Number(room[1]),
  //   retryCount: Number(room[2]),
  //   hintsUsedInRoom: Number(room[3]),
  //   hintOneUsed: room[4],
  //   hintTwoUsed: room[5],
  // }
  console.log("[integration] getRoomStateOnChain called — local mode", { address, roomId })
  return null
}

/**
 * Get leaderboard rankings from the contract.
 */
export async function getLeaderboard(provider: unknown): Promise<RankEntry[]> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider as ethers.Provider)
  // const rankings = await contract.getRankings()
  // return rankings.map((entry: any) => ({
  //   player: entry.player,
  //   score: Number(entry.score),
  //   totalHints: Number(entry.totalHints),
  //   rank: Number(entry.rank),
  //   gameFinished: entry.gameFinished,
  // }))
  console.log("[integration] getLeaderboard called — local mode")
  return []
}

/**
 * Check if time has expired for the player.
 */
export async function checkTimeExpiry(signer: unknown): Promise<void> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer as ethers.Signer)
  // const tx = await contract.checkTimeExpiry()
  // await tx.wait()
  console.log("[integration] checkTimeExpiry called — local mode, no-op")
}

/**
 * Check if a player is already registered on-chain.
 */
export async function isPlayerRegistered(
  provider: unknown,
  address: string
): Promise<boolean> {
  // const { ethers } = await import("ethers")
  // const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider as ethers.Provider)
  // return await contract.isRegistered(address)
  console.log("[integration] isPlayerRegistered called — local mode", { address })
  return false
}
