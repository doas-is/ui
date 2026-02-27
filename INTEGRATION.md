# Frontend-Backend Integration Guide

> **Document Version:** 1.0 | **Contract:** CryptoRoom v1.0 on Sepolia  
> **Purpose:** Define every touchpoint between the UI layer and the backend (smart contract + backend API + Redis queue). Each section maps a UI action to the backend call it must trigger, with exact function signatures, parameters, and expected return values.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Contract & Network Config](#2-contract--network-config)
3. [Environment Variables](#3-environment-variables)
4. [File Map](#4-file-map)
5. [Integration Points](#5-integration-points)
   - 5.1 [Authentication (Web3Auth)](#51-authentication-web3auth)
   - 5.2 [Player Registration](#52-player-registration)
   - 5.3 [Start Game](#53-start-game)
   - 5.4 [Submit Answer](#54-submit-answer)
   - 5.5 [Per-Question Hint (Hint Level 2)](#55-per-question-hint-hint-level-2)
   - 5.6 [End-of-Room Hint (Hint Level 1)](#56-end-of-room-hint-hint-level-1)
   - 5.7 [Retry Room](#57-retry-room)
   - 5.8 [Timer / Time Expiry](#58-timer--time-expiry)
   - 5.9 [Leaderboard](#59-leaderboard)
   - 5.10 [Player Stats](#510-player-stats)
   - 5.11 [Room State Sync](#511-room-state-sync)
6. [Redis Player Queue (Backend)](#6-redis-player-queue-backend)
7. [Biconomy Gasless Transactions](#7-biconomy-gasless-transactions)
8. [Game Rules Reference](#8-game-rules-reference)
9. [Screen-by-Screen Integration Map](#9-screen-by-screen-integration-map)
10. [Error Handling](#10-error-handling)
11. [Going Live Checklist](#11-going-live-checklist)

---

## 1. Architecture Overview

```
+--------------------+        +---------------------+       +--------------------+
|   Frontend (UI)    |  HTTP  |   Backend API       |  RPC  |  Smart Contract    |
|   Next.js App      |------->|   (Person 4)        |------>|  Sepolia           |
|                    |        |   Redis Queue        |       |  CryptoRoom.sol    |
+--------------------+        +---------------------+       +--------------------+
        |                              |
        |  Web3Auth SDK                |  Biconomy TrustedForwarder
        |  (Google/email login)        |  (Gasless meta-transactions)
        v                              v
   Browser Wallet              0x69015912AA337...
   (embedded via Web3Auth)
```

**Data flow:**
- **UI runs game logic locally** (client-side Zustand-style store in `lib/game-store.tsx`).
- **Each game action also triggers an on-chain transaction** via `lib/integration.ts`.
- **The contract is the source of truth**: scores, room states, hints, rankings.
- **The backend API** (Person 4) provides hint signatures and manages the Redis player queue.
- **Biconomy** relays meta-transactions so players never need ETH.

---

## 2. Contract & Network Config

Defined in `lib/contract.ts`:

| Key | Value |
|-----|-------|
| Contract Address | `0xe445db15bae6b6cd305fe247443c8a298f6d5344` |
| Chain ID | `11155111` (Sepolia) |
| RPC URL | `https://rpc.sepolia.org` |
| Trusted Forwarder (Biconomy) | `0x69015912AA33720b842dCD6aC059Ed623F28d9f7` |
| Explorer | `https://sepolia.etherscan.io` |
| Owner (Person 1) | `0x064A1B3A935EAa4F7482EE24c67583819a47922B` |

---

## 3. Environment Variables

| Variable | Required By | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | `lib/web3auth.tsx` | Web3Auth dashboard client ID |
| `NEXT_PUBLIC_WEB3AUTH_NETWORK` | `lib/web3auth.tsx` | `sapphire_devnet` or `sapphire_mainnet` |
| `NEXT_PUBLIC_BACKEND_URL` | `lib/integration.ts` | Backend API base URL (Person 4's server) |
| `NEXT_PUBLIC_BICONOMY_API_KEY` | Future | Biconomy Paymaster API key for gasless txns |

---

## 4. File Map

```
lib/
  contract.ts         -- Contract address, chain config, full ABI (read-only config)
  integration.ts      -- All async functions that call the contract (the integration layer)
  game-store.tsx      -- Client-side game state store (local-first, syncs with contract)
  game-data.ts        -- Static game content: rooms, questions, correct answers, config
  web3auth.tsx         -- Web3Auth provider: connect, disconnect, get signer/address

components/game/
  login-screen.tsx     -- Web3Auth login UI
  welcome-screen.tsx   -- Player name input, rules, start game
  game-shell.tsx       -- Screen router (login -> welcome -> playing -> room-result -> game-over)
  question-card.tsx    -- MCQ UI with per-question hint button
  room-result-screen.tsx -- Pass/fail result with end-of-room hint & retry
  game-hud.tsx         -- Sticky HUD: timer, score, room progress
  game-over-screen.tsx -- Final score, leaderboard, share

app/
  page.tsx             -- Root: wraps everything in Web3AuthProvider + GameProvider
```

---

## 5. Integration Points

Each subsection below describes:
- **UI trigger**: What the player does
- **UI file**: Which component handles it
- **Local action**: What happens in `game-store.tsx`
- **Contract call**: The on-chain function to invoke via `integration.ts`
- **Backend call**: Any backend API call needed
- **Expected response**: What comes back and how the UI uses it

---

### 5.1 Authentication (Web3Auth)

**UI trigger:** Player taps "Connect with Web3Auth" on the login screen.

**UI file:** `components/game/login-screen.tsx`

**Current flow:**
```
1. User clicks "Connect with Web3Auth"
2. web3auth.connect() opens modal (Google / email)
3. On success: get userInfo (email, name, profileImage)
4. Get ethers BrowserProvider -> Signer -> address
5. Store in Web3Auth context: { isConnected, userInfo, address, provider }
6. User clicks "Continue" -> goToWelcome()
```

**What the backend needs to know:**
After successful Web3Auth login, the UI has:
- `address` (string): Player's Ethereum wallet address
- `provider` (Web3Auth provider): Can create an ethers Signer for contract calls
- `userInfo.email` / `userInfo.name`: Player identity

**Integration hook (add to login-screen.tsx after connection):**
```typescript
// After handleConnected succeeds:
const playerAddress = await signer.getAddress()

// 1. Check if registered on-chain
const registered = await isPlayerRegistered(provider, playerAddress)

// 2. If not registered, register on-chain
if (!registered) {
  await registerPlayer(signer)
}

// 3. Add player to Redis queue (backend API call)
await fetch(`${BACKEND_URL}/players/enqueue`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    address: playerAddress,
    email: userInfo?.email,
    name: userInfo?.name,
  }),
})
```

**Contract functions used:**
| Function | Signature | Mutability |
|----------|-----------|------------|
| `isRegistered(address)` | `(address) -> bool` | view |
| `register()` | `() -> void` | nonpayable (write) |

---

### 5.2 Player Registration

**UI trigger:** Automatic, immediately after Web3Auth login completes.

**UI file:** `components/game/login-screen.tsx` (post-connection logic)

**Integration function:** `registerPlayer(signer)` in `lib/integration.ts`

**Contract call:**
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)
const tx = await contract.register()
await tx.wait()
// Emits: PlayerRegistered(player, timestamp)
```

**When to call:** Only if `isRegistered(address)` returns `false`.

**Error cases:**
- Player already registered: Contract will revert. Check `isRegistered` first.
- Network error: Show retry prompt.

---

### 5.3 Start Game

**UI trigger:** Player enters name and clicks "Start Game" on the welcome screen.

**UI file:** `components/game/welcome-screen.tsx`

**Local action:** `game-store.startGame(name)` -- resets state, starts local 15-min timer, transitions to "playing" screen.

**Contract call:** `startGameOnChain(signer)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)

// Check if already started
const started = await contract.hasStarted(playerAddress)
if (!started) {
  const tx = await contract.startGame()
  await tx.wait()
  // Emits: GameStarted(player, startTime)
}
```

**Contract function:**
| Function | Signature | Mutability |
|----------|-----------|------------|
| `hasStarted(address)` | `(address) -> bool` | view |
| `startGame()` | `() -> void` | nonpayable |

**Important:** The contract starts its own 15-minute countdown from `startTime`. The UI also runs a local countdown. On reconnect, sync the UI timer with `getMyStats().timeRemainingSeconds`.

---

### 5.4 Submit Answer

**UI trigger:** Player taps an answer option on the question card.

**UI file:** `components/game/question-card.tsx`

**Local action:** `game-store.confirmAnswerImmediate(optionIndex)` -- records the answer locally, marks `answerConfirmed = true`. Does NOT reveal correctness to the player.

**Contract call:** `submitAnswerOnChain(signer, quizId, answer)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)

// quizId = 1-based question index within the room (1, 2, 3, 4, or 5)
// answer = the selected option text (plain string, contract normalizes to lowercase)
const tx = await contract.submitAnswer(quizId, answer)
const receipt = await tx.wait()

// Parse the AnswerResult event
const event = receipt.logs
  .map(log => contract.interface.parseLog(log))
  .find(e => e?.name === "AnswerResult")

const isCorrect = event.args.correct    // bool
const newScore  = Number(event.args.newScore)  // uint16
```

**Contract function:**
| Function | Signature | Mutability |
|----------|-----------|------------|
| `submitAnswer(uint8 quizId, string answer)` | `(quizId, answer) -> void` | nonpayable |

**Event emitted:** `AnswerResult(player, roomId, quizId, correct, newScore)`

**Parameter mapping:**
| UI Value | Contract Parameter |
|----------|-------------------|
| `roomState.currentQuestionIndex + 1` | `quizId` (1-5) |
| `question.options[selectedIndex]` | `answer` (plain text string) |

**Sync logic:** After receiving `AnswerResult`, update the local store's `correctAnswers` and `score` to match the contract's `newScore`. The UI intentionally does NOT show the player whether their answer was correct -- it only shows "Answer recorded."

---

### 5.5 Per-Question Hint (Hint Level 2)

**UI trigger:** Player taps the "Hint (-5 pts)" button on the question card, before answering.

**UI file:** `components/game/question-card.tsx`

**Local action:** `game-store.useQuestionHint()` -- picks a random wrong option to eliminate, deducts 5 pts, increments `hintsUsedInRoom`.

**Contract call:** `requestHintOnChain(signer, roomId, hintLevel=2, signature)` in `lib/integration.ts`

**This requires a backend call first:**
```typescript
// Step 1: Get hint signature from backend (Person 4's API)
const response = await fetch(`${BACKEND_URL}/hint/request`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    player: playerAddress,
    roomId: currentRoomIndex + 1,  // 1-based
    hintLevel: 2,                  // Level 2 = eliminate 1 wrong option
  }),
})
const { signature } = await response.json()

// Step 2: Call contract with signature
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)
const tx = await contract.requestHint(roomId, 2, signature)
const receipt = await tx.wait()

// Step 3: Parse HintGranted event
const event = receipt.logs
  .map(log => contract.interface.parseLog(log))
  .find(e => e?.name === "HintGranted")

const revealedQuizId = Number(event.args.revealedQuizId)  // which question
const choiceRemoved  = event.args.choiceRemoved            // true = option eliminated
const newScore       = Number(event.args.newScore)
```

**Contract function:**
| Function | Signature | Returns |
|----------|-----------|---------|
| `requestHint(uint8 roomId, uint8 hintLevel, bytes signature)` | `(roomId, hintLevel, sig)` | `(uint8 revealedQuizId, bool choiceRemoved)` |

**Event emitted:** `HintGranted(player, roomId, hintLevel, revealedQuizId, choiceRemoved, newScore)`

**Constraints:**
- Max 2 hints per room (tracked by `hintsUsedInRoom` in both local store and contract)
- Can only use before answering the current question
- Costs -5 pts per use
- The signature must come from the AI Agent (Person 2) via Person 4's backend

**Note on hint levels (contract vs UI):**
The contract defines Hint Level 1 as "reveal which question was wrong" and Hint Level 2 as "remove 1 wrong MCQ option." The UI maps these as:
- **Per-question hint button** (during gameplay) = Contract Hint Level 2 (choiceRemoved)
- **End-of-room hint button** (after failing a room) = Contract Hint Level 1 (revealedQuizId)

---

### 5.6 End-of-Room Hint (Hint Level 1)

**UI trigger:** Player taps "Use Hint (-10 pts) -- See your score" on the room-result screen after failing.

**UI file:** `components/game/room-result-screen.tsx`

**Local action:** `game-store.useEndOfRoomHint()` -- reveals the score as "X/5" (e.g., "3/5"), deducts 10 pts.

**Contract call:** `requestHintOnChain(signer, roomId, hintLevel=1, signature)` in `lib/integration.ts`

```typescript
// Step 1: Get signature from backend
const response = await fetch(`${BACKEND_URL}/hint/request`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    player: playerAddress,
    roomId: currentRoomIndex + 1,
    hintLevel: 1,  // Level 1 = reveal wrong count
  }),
})
const { signature } = await response.json()

// Step 2: Call contract
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)
const tx = await contract.requestHint(roomId, 1, signature)
const receipt = await tx.wait()
```

**UI display:** Shows only the count (e.g., "3/5") -- never reveals WHICH questions were wrong or right. This is critical to the game design.

**Cost:** -10 pts (the UI currently deducts 10 from local store; contract deducts its own penalty)

---

### 5.7 Retry Room

**UI trigger:** Player taps "Retry Room (-5 pts)" on the room-result screen after failing.

**UI file:** `components/game/room-result-screen.tsx`

**Local action:** `game-store.retryRoom()` -- resets the room state, deducts 5 pts, increments retryCount, transitions back to "playing".

**Contract call:** `retryRoomOnChain(signer)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)
const tx = await contract.retryRoom()
await tx.wait()
// Emits: RoomRetried(player, roomId, retryNumber, newScore)
```

**Contract function:**
| Function | Signature | Mutability |
|----------|-----------|------------|
| `retryRoom()` | `() -> void` | nonpayable |

**Event emitted:** `RoomRetried(player, roomId, retryNumber, newScore)`

**Sync:** After the tx confirms, update local `score` from `newScore` in the event.

---

### 5.8 Timer / Time Expiry

**UI trigger:** Timer reaches 0 in the HUD, or player has been playing for 15 minutes.

**UI file:** `components/game/game-hud.tsx` (display), `lib/game-store.tsx` (timer logic)

**Local action:** When `timeRemaining` hits 0, the store sets `screen: "game-over"` and stops the timer.

**Contract call:** `checkTimeExpiry(signer)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer)
const tx = await contract.checkTimeExpiry()
await tx.wait()
// Emits: TimeExpiredEvent(player, finalScore)
```

**When to call:**
- When the local timer reaches 0
- Periodically as a safeguard (e.g., every 60 seconds during gameplay)
- On reconnect, if `getMyStats().timeExpired` is already true

**Timer sync on reconnect:**
```typescript
const stats = await contract.getMyStats(playerAddress)
const serverTimeRemaining = Number(stats.timeRemainingSeconds)
// Update local store: setState({ timeRemaining: serverTimeRemaining })
```

---

### 5.9 Leaderboard

**UI trigger:** Game ends (all rooms done or timer expires) -- shown on game-over screen.

**UI file:** `components/game/game-over-screen.tsx`

**Contract call:** `getLeaderboard(provider)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider)
const rankings = await contract.getRankings()

// Returns: RankEntry[]
// Each entry: { player: address, score: uint16, totalHints: uint8, rank: uint16, gameFinished: bool }
```

**Contract function:**
| Function | Signature | Returns |
|----------|-----------|---------|
| `getRankings()` | `() -> RankEntry[]` | Array of `{ player, score, totalHints, rank, gameFinished }` |

**Ranking criteria (from contract):**
1. Highest score first
2. Fewest hints used (tiebreaker)

**Current UI behavior:** Uses a mock leaderboard + merges the player's score. Replace with:
```typescript
const rankings = await getLeaderboard(provider)
// Map contract addresses to display names (from backend or ENS)
```

---

### 5.10 Player Stats

**UI trigger:** On reconnect, on game-over, or periodically for sync.

**Contract call:** `getPlayerStats(provider, address)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider)
const stats = await contract.getMyStats(playerAddress)

// Returns:
// stats[0] = gameStarted       (bool)
// stats[1] = currentRoom       (uint8, 1-4)
// stats[2] = score             (uint16, 0-100)
// stats[3] = gameFinished      (bool)
// stats[4] = timeExpired       (bool)
// stats[5] = totalHintsUsed    (uint8, 0-8)
// stats[6] = startTime         (uint32, unix timestamp)
// stats[7] = timeRemainingSeconds (uint32)
// stats[8] = rank              (uint16, 0 = unranked)
```

**Use for reconnect logic:**
```typescript
if (stats.gameFinished || stats.timeExpired) {
  // Go to game-over screen
} else if (stats.gameStarted) {
  // Resume: set currentRoom, score, timeRemaining from contract
} else {
  // Not started yet: show welcome screen
}
```

---

### 5.11 Room State Sync

**UI trigger:** On reconnect or after each room transition.

**Contract call:** `getRoomStateOnChain(provider, address, roomId)` in `lib/integration.ts`
```typescript
const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider)
const room = await contract.getRoomState(playerAddress, roomId)

// Returns:
// room[0] = state           (0=Locked, 1=Active, 2=Passed)
// room[1] = correctCount    (uint8, 0-5)
// room[2] = retryCount      (uint8)
// room[3] = hintsUsedInRoom (uint8, 0-2)
// room[4] = hintOneUsed     (bool)
// room[5] = hintTwoUsed     (bool)
```

**Additional: Quiz Progress**
```typescript
const progress = await contract.getQuizProgress(playerAddress, roomId)
// progress[0] = answered[5]  (bool[5] - which questions have been answered)
// progress[1] = correct[5]   (bool[5] - which answers were correct)
```

---

## 6. Redis Player Queue (Backend)

> This is NOT implemented in the frontend. The UI only makes HTTP calls to the backend API. Person 4 manages the Redis queue.

**When to enqueue:** After successful Web3Auth login + on-chain registration.

**API endpoint (expected):**
```
POST ${BACKEND_URL}/players/enqueue
Content-Type: application/json

{
  "address": "0x...",
  "email": "player@example.com",
  "name": "PlayerName",
  "timestamp": 1740000000
}
```

**Expected response:**
```json
{
  "success": true,
  "position": 42,
  "message": "Player added to queue"
}
```

**The UI should call this endpoint in `login-screen.tsx` after the Web3Auth connection succeeds and before transitioning to the welcome screen.**

---

## 7. Biconomy Gasless Transactions

> Players should never need ETH. All write transactions go through Biconomy's TrustedForwarder.

**Trusted Forwarder address:** `0x69015912AA33720b842dCD6aC059Ed623F28d9f7`

**Integration approach (to be implemented):**
```typescript
import { Bundler, BiconomySmartAccountV2, createSmartAccountClient } from "@biconomy/account"

// After Web3Auth gives us a signer:
const smartAccount = await createSmartAccountClient({
  signer: web3authSigner,
  bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/...`,
  paymasterUrl: `https://paymaster.biconomy.io/api/v1/${chainId}/...`,
})

// All contract.functionName() calls go through the smart account
// which uses the trusted forwarder for gasless meta-transactions
```

**Environment variable needed:** `NEXT_PUBLIC_BICONOMY_API_KEY`

**Current state:** The `lib/integration.ts` functions use a direct signer. To enable gasless:
1. Replace the ethers `Signer` with the Biconomy Smart Account
2. All `contract.functionName()` calls remain the same
3. The TrustedForwarder handles gas payment

---

## 8. Game Rules Reference

| Rule | Value | Source |
|------|-------|--------|
| Total rooms | 4 | `GAME_CONFIG.totalRooms` |
| Questions per room | 5 | `GAME_CONFIG.questionsPerRoom` |
| Points per correct answer | 5 | `GAME_CONFIG.pointsPerCorrect` |
| Max score | 100 | `GAME_CONFIG.maxScore` |
| Starting score | 100 | `GAME_CONFIG.startingScore` |
| Passing threshold | 4/5 | `GAME_CONFIG.passingThreshold` |
| Total game time | 15 minutes | `GAME_CONFIG.totalTimeSeconds` |
| Per-question hint penalty | -5 pts | `GAME_CONFIG.hintPenaltyPerQuestion` |
| End-of-room hint penalty | -10 pts | `GAME_CONFIG.hintPenaltyEndRoom` |
| Retry penalty | -5 pts | `GAME_CONFIG.retryPenalty` |
| Max hints per room | 2 | `GAME_CONFIG.maxHintsPerRoom` |
| Timer warning | 2 min remaining | `GAME_CONFIG.warningTimeSeconds` |

**Scoring model:** Players START at 100 points. Points are DEDUCTED for hints and retries. Correct answers do NOT add points -- they are required to pass rooms.

---

## 9. Screen-by-Screen Integration Map

### Screen 1: Login (`login-screen.tsx`)

| Action | Local Store | Contract Call | Backend Call |
|--------|-------------|---------------|--------------|
| Tap "Connect with Web3Auth" | -- | -- | -- |
| Web3Auth modal completes | Set `isConnected`, `address`, `userInfo` | `isRegistered(address)` | -- |
| If not registered | -- | `register()` | `POST /players/enqueue` |
| Tap "Continue" | `goToWelcome()` | -- | -- |

### Screen 2: Welcome (`welcome-screen.tsx`)

| Action | Local Store | Contract Call | Backend Call |
|--------|-------------|---------------|--------------|
| Enter name | Local state only | -- | -- |
| Tap "Start Game" | `startGame(name)` | `startGame()` | -- |
| View rules | Local toggle | -- | -- |

### Screen 3: Playing (`question-card.tsx` + `game-hud.tsx`)

| Action | Local Store | Contract Call | Backend Call |
|--------|-------------|---------------|--------------|
| Tap answer option | `confirmAnswerImmediate(i)` | `submitAnswer(quizId, answer)` | -- |
| Tap "Hint (-5 pts)" | `useQuestionHint()` | `requestHint(roomId, 2, sig)` | `POST /hint/request` |
| Tap "Next Question" | `nextQuestion()` | -- | -- |
| Tap "Submit Room" | `nextQuestion()` (triggers room eval) | -- | -- |
| Timer ticks | `timeRemaining--` | -- | -- |
| Timer hits 0 | `screen: "game-over"` | `checkTimeExpiry()` | -- |

### Screen 4: Room Result (`room-result-screen.tsx`)

| Action | Local Store | Contract Call | Backend Call |
|--------|-------------|---------------|--------------|
| (Auto) Show pass/fail | Read `roomState.passed` | -- | -- |
| Tap "Use Hint (-10 pts)" | `useEndOfRoomHint()` | `requestHint(roomId, 1, sig)` | `POST /hint/request` |
| Tap "Retry Room (-5 pts)" | `retryRoom()` | `retryRoom()` | -- |
| Tap "Enter Room N+1" | `proceedToNextRoom()` | -- | -- |
| Tap "Finish Game" | `proceedToNextRoom()` -> game-over | -- | -- |

### Screen 5: Game Over (`game-over-screen.tsx`)

| Action | Local Store | Contract Call | Backend Call |
|--------|-------------|---------------|--------------|
| (Auto) Show score | Read local `score` | `getMyStats(address)` | -- |
| (Auto) Show leaderboard | -- | `getRankings()` | -- |
| Tap "Share Results" | -- | -- | -- |
| Tap "Play Again" | `resetGame()` | -- | -- |

---

## 10. Error Handling

| Error | Source | UI Response |
|-------|--------|-------------|
| Web3Auth init fails | `lib/web3auth.tsx` | Show "Connection failed, please retry" |
| Contract tx reverts | `lib/integration.ts` | Show toast with error, allow retry |
| Network timeout | ethers RPC | Retry with exponential backoff (3 attempts) |
| Already registered | `register()` revert | Silently continue (expected for returning players) |
| Already started | `startGame()` revert | Sync state from `getMyStats()` and resume |
| Invalid hint signature | `requestHint()` revert | Show "Hint unavailable, try again" |
| Time expired on contract | Any write call | Call `checkTimeExpiry()`, transition to game-over |
| Backend API unreachable | `fetch()` failure | Show "Server unavailable" with retry button |

---

## 11. Going Live Checklist

To switch from local-only mode to full on-chain integration:

1. **Set environment variables:**
   - `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` -- from Web3Auth dashboard
   - `NEXT_PUBLIC_WEB3AUTH_NETWORK` -- `sapphire_devnet` for testing, `sapphire_mainnet` for prod
   - `NEXT_PUBLIC_BACKEND_URL` -- Person 4's deployed backend URL
   - `NEXT_PUBLIC_BICONOMY_API_KEY` -- from Biconomy dashboard

2. **Uncomment ethers calls in `lib/integration.ts`:**
   Every function has commented-out ethers code with `// const { ethers } = await import("ethers")`. Uncomment these blocks and remove the `console.log` fallbacks.

3. **Wire contract calls into UI components:**
   In each component where a `game-store` action is called, add the corresponding `integration.ts` call. Example for `question-card.tsx`:
   ```typescript
   // Before:
   confirmAnswerImmediate(optionIndex)
   
   // After:
   confirmAnswerImmediate(optionIndex)
   const result = await submitAnswerOnChain(signer, quizId, answerText)
   if (result) {
     // Sync score from contract
   }
   ```

4. **Add reconnect/resume logic:**
   On app load, if Web3Auth session exists, call `getMyStats()` and `getRoomState()` to restore game state from the contract.

5. **Add Biconomy smart account:**
   Wrap the ethers signer with Biconomy's Smart Account for gasless transactions.

6. **Replace mock leaderboard:**
   In `game-over-screen.tsx`, replace `MOCK_LEADERBOARD` with `await getLeaderboard(provider)`.

7. **Connect Redis queue:**
   Add the `POST /players/enqueue` call in the login flow after registration.

8. **Test the full flow:**
   - Login with Web3Auth -> register on-chain -> enqueue in Redis
   - Start game -> answer questions -> submit answers on-chain
   - Use hints (requires backend signature) -> check contract events
   - Retry rooms -> verify score deductions match contract
   - Game over -> verify leaderboard matches `getRankings()`
   - Timer expiry -> verify `checkTimeExpiry()` works
   - Reconnect -> verify state restores from contract

---

## Contract Events Reference

| Event | Parameters | Emitted When |
|-------|------------|--------------|
| `PlayerRegistered` | `(player, timestamp)` | `register()` succeeds |
| `GameStarted` | `(player, startTime)` | `startGame()` succeeds |
| `AnswerResult` | `(player, roomId, quizId, correct, newScore)` | `submitAnswer()` succeeds |
| `RoomPassed` | `(player, roomId, correctCount, score)` | Room threshold met |
| `RoomRetried` | `(player, roomId, retryNumber, newScore)` | `retryRoom()` succeeds |
| `HintGranted` | `(player, roomId, hintLevel, revealedQuizId, choiceRemoved, newScore)` | `requestHint()` succeeds |
| `GameCompleted` | `(player, finalScore, durationSeconds)` | All 4 rooms passed |
| `TimeExpiredEvent` | `(player, finalScore)` | `checkTimeExpiry()` confirms timeout |

---

## Contract Read Functions Reference

| Function | Parameters | Returns |
|----------|------------|---------|
| `isRegistered(address)` | Player address | `bool` |
| `hasStarted(address)` | Player address | `bool` |
| `isGameFinished(address)` | Player address | `bool` |
| `getMyStats(address)` | Player address | `(gameStarted, currentRoom, score, gameFinished, timeExpired, totalHintsUsed, startTime, timeRemainingSeconds, rank)` |
| `getRoomState(address, roomId)` | Player address, Room ID (1-4) | `(state, correctCount, retryCount, hintsUsedInRoom, hintOneUsed, hintTwoUsed)` |
| `getQuizProgress(address, roomId)` | Player address, Room ID (1-4) | `(answered[5], correct[5])` |
| `getRankings()` | None | `RankEntry[]` |
| `getGameRules()` | None | `(questionsPerRoom, passThreshold, totalRooms, pointsPerQuestion, maxScore, retryPenalty, hintPenalty, maxHintsPerRoom, gameDurationSeconds)` |
| `getGameInfo()` | None | `(totalPlayers, policyVersion)` |

---

*End of Integration Guide*
