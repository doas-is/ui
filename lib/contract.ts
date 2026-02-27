export const CONTRACT_CONFIG = {
  address: "0xe445db15bae6b6cd305fe247443c8a298f6d5344",
  chainId: 11155111, // Sepolia
  network: "sepolia",
  rpcUrl: "https://rpc.sepolia.org",
  trustedForwarder: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7",
  explorer: "https://sepolia.etherscan.io",
} as const

export const CONTRACT_ABI = [
  // Constructor
  {
    inputs: [
      { internalType: "address", name: "_aiAgent", type: "address" },
      { internalType: "address", name: "_trustedForwarder", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint8", name: "roomId", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "quizId", type: "uint8" },
      { indexed: false, internalType: "bool", name: "correct", type: "bool" },
      { indexed: false, internalType: "uint16", name: "newScore", type: "uint16" },
    ],
    name: "AnswerResult",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint16", name: "finalScore", type: "uint16" },
      { indexed: false, internalType: "uint32", name: "durationSeconds", type: "uint32" },
    ],
    name: "GameCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint32", name: "startTime", type: "uint32" },
    ],
    name: "GameStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint8", name: "roomId", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "hintLevel", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "revealedQuizId", type: "uint8" },
      { indexed: false, internalType: "bool", name: "choiceRemoved", type: "bool" },
      { indexed: false, internalType: "uint16", name: "newScore", type: "uint16" },
    ],
    name: "HintGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint32", name: "timestamp", type: "uint32" },
    ],
    name: "PlayerRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint8", name: "roomId", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "correctCount", type: "uint8" },
      { indexed: false, internalType: "uint16", name: "score", type: "uint16" },
    ],
    name: "RoomPassed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint8", name: "roomId", type: "uint8" },
      { indexed: false, internalType: "uint8", name: "retryNumber", type: "uint8" },
      { indexed: false, internalType: "uint16", name: "newScore", type: "uint16" },
    ],
    name: "RoomRetried",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint16", name: "finalScore", type: "uint16" },
    ],
    name: "TimeExpiredEvent",
    type: "event",
  },
  // Player Functions
  { inputs: [], name: "register", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "startGame", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "uint8", name: "quizId", type: "uint8" },
      { internalType: "string", name: "answer", type: "string" },
    ],
    name: "submitAnswer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "retryRoom", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "uint8", name: "roomId", type: "uint8" },
      { internalType: "uint8", name: "hintLevel", type: "uint8" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "requestHint",
    outputs: [
      { internalType: "uint8", name: "revealedQuizId", type: "uint8" },
      { internalType: "bool", name: "choiceRemoved", type: "bool" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "checkTimeExpiry", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Read Functions
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getMyStats",
    outputs: [
      { internalType: "bool", name: "gameStarted", type: "bool" },
      { internalType: "uint8", name: "currentRoom", type: "uint8" },
      { internalType: "uint16", name: "score", type: "uint16" },
      { internalType: "bool", name: "gameFinished", type: "bool" },
      { internalType: "bool", name: "timeExpired", type: "bool" },
      { internalType: "uint8", name: "totalHintsUsed", type: "uint8" },
      { internalType: "uint32", name: "startTime", type: "uint32" },
      { internalType: "uint32", name: "timeRemainingSeconds", type: "uint32" },
      { internalType: "uint16", name: "rank", type: "uint16" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint8", name: "roomId", type: "uint8" },
    ],
    name: "getRoomState",
    outputs: [
      { internalType: "enum CryptoRoom.RoomState", name: "state", type: "uint8" },
      { internalType: "uint8", name: "correctCount", type: "uint8" },
      { internalType: "uint8", name: "retryCount", type: "uint8" },
      { internalType: "uint8", name: "hintsUsedInRoom", type: "uint8" },
      { internalType: "bool", name: "hintOneUsed", type: "bool" },
      { internalType: "bool", name: "hintTwoUsed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint8", name: "roomId", type: "uint8" },
    ],
    name: "getQuizProgress",
    outputs: [
      { internalType: "bool[5]", name: "answered", type: "bool[5]" },
      { internalType: "bool[5]", name: "correct", type: "bool[5]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRankings",
    outputs: [
      {
        components: [
          { internalType: "address", name: "player", type: "address" },
          { internalType: "uint16", name: "score", type: "uint16" },
          { internalType: "uint8", name: "totalHints", type: "uint8" },
          { internalType: "uint16", name: "rank", type: "uint16" },
          { internalType: "bool", name: "gameFinished", type: "bool" },
        ],
        internalType: "struct CryptoRoom.RankEntry[]",
        name: "entries",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "hasStarted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "isGameFinished",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGameRules",
    outputs: [
      { internalType: "uint8", name: "questionsPerRoom", type: "uint8" },
      { internalType: "uint8", name: "passThreshold", type: "uint8" },
      { internalType: "uint8", name: "totalRooms", type: "uint8" },
      { internalType: "uint8", name: "pointsPerQuestion", type: "uint8" },
      { internalType: "uint16", name: "maxScore", type: "uint16" },
      { internalType: "uint8", name: "retryPenalty", type: "uint8" },
      { internalType: "uint8", name: "hintPenalty", type: "uint8" },
      { internalType: "uint8", name: "maxHintsPerRoom", type: "uint8" },
      { internalType: "uint32", name: "gameDurationSeconds", type: "uint32" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getGameInfo",
    outputs: [
      { internalType: "uint256", name: "totalPlayers", type: "uint256" },
      { internalType: "uint32", name: "policyVersion", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "trustedForwarder",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const
