export interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export interface Room {
  id: number
  name: string
  slug: string
  icon: string
  description: string
  questions: Question[]
}

export const GAME_CONFIG = {
  totalRooms: 4,
  questionsPerRoom: 5,
  pointsPerCorrect: 5,
  maxScore: 100,
  startingScore: 100,
  passingThreshold: 4, // out of 5
  totalTimeSeconds: 15 * 60, // 15 minutes
  retryPenalty: 5,
  hintPenaltyPerQuestion: 5,
  hintPenaltyEndRoom: 10,
  maxHintsPerRoom: 2,
  warningTimeSeconds: 2 * 60, // 2 minutes warning
} as const

export const rooms: Room[] = [
  {
    id: 1,
    name: "Machine Learning Foundations",
    slug: "ml-foundations",
    icon: "Brain",
    description: "Test your deep knowledge of machine learning theory, ensemble methods, and statistical inference.",
    questions: [
      {
        id: "ch1_q1",
        text: "What is the primary difference between supervised and unsupervised learning?",
        options: [
          "The computational complexity of the learning task",
          "The presence or absence of labeled data during training",
          "The specific type of algorithm architecture implemented",
          "The overall size and volume of the dataset used",
        ],
        correctIndex: 1,
      },
      {
        id: "ch1_q2",
        text: "What is the statistical role of bootstrap sampling in ensemble methods?",
        options: [
          "It enforces strict independence across all features",
          "It guarantees asymptotic consistency for models",
          "It introduces controlled sample variance between learners",
          "It reduces bias by expanding the hypothesis space",
        ],
        correctIndex: 2,
      },
      {
        id: "ch1_q3",
        text: "Why does averaging multiple high-variance estimators reduce overall variance?",
        options: [
          "Errors cancel when estimators are partially decorrelated",
          "Parameter norms shrink significantly during aggregation",
          "Overfitting disappears with repeated sampling iterations",
          "Bias decreases proportionally to the ensemble size",
        ],
        correctIndex: 0,
      },
      {
        id: "ch1_q4",
        text: "What is the primary advantage of using Support Vector Machines (SVMs) in classification tasks?",
        options: [
          "They are significantly more efficient than decision trees",
          "They can handle much larger datasets than random forests",
          "They are more suitable for regression than classification tasks",
          "They offer high accuracy and capture complex relationships",
        ],
        correctIndex: 3,
      },
      {
        id: "ch1_q5",
        text: "What distinguishes Bayesian posterior inference from maximum likelihood estimation?",
        options: [
          "It restricts parameter search to convex regions only",
          "It avoids making assumptions about prior distributions",
          "It outputs a distribution over parameters rather than point estimates",
          "It removes the need for regularization entirely",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 2,
    name: "Retrieval-Augmented Generation (RAG)",
    slug: "rag",
    icon: "MessageSquare",
    description: "Dive into advanced RAG techniques, modular architectures, and retrieval optimization.",
    questions: [
      {
        id: "ch2_q1",
        text: "What specific advantage does RAG offer regarding security and privacy management compared to fine-tuning?",
        options: [
          "It prevents the model from generating any toxic or biased content",
          "It leverages built-in database roles and security controls to manage data usage",
          "It eliminates the need for storing user query history",
          "It automatically encrypts the model's parametric knowledge base",
        ],
        correctIndex: 1,
      },
      {
        id: "ch2_q2",
        text: 'What is the purpose of the "alignment optimization" strategy in the data indexing phase?',
        options: [
          "To remove duplicate documents from the external database",
          "To translate all foreign language documents into English",
          "To introduce hypothetical questions that align with document content",
          "To force all text chunks to conform to a uniform size",
        ],
        correctIndex: 2,
      },
      {
        id: "ch2_q3",
        text: 'What is the functional role of the "Extra Generation Module" in the Modular RAG paradigm?',
        options: [
          "To produce a summary of all documents stored in the vector database",
          "To create synthetic training data for fine-tuning the retriever",
          "To generate adversarial examples for testing the system's robustness",
          "To leverage the LLM to generate context likely to contain relevant information",
        ],
        correctIndex: 3,
      },
      {
        id: "ch2_q4",
        text: 'How does the "ReRank" technique in Advanced RAG specifically address the limitations of the context window?',
        options: [
          "By expanding the maximum token limit of the language model",
          "By converting semantic vectors back into raw text formats",
          "By relocating the most relevant information to the edges of the prompt",
          "By filtering out documents that contain toxic or biased language",
        ],
        correctIndex: 2,
      },
      {
        id: "ch2_q5",
        text: 'What characterizes the issue of "low precision" in the retrieval stage of Naive RAG?',
        options: [
          "The model generates an answer that is not supported by the context",
          "The retrieval set contains blocks that do not correlate with the query",
          "The retrieved documents exceed the model's context window limit",
          "The retrieval process fails to access the external knowledge base",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 3,
    name: "Agentic Systems in Cybersecurity",
    slug: "agentic-cybersecurity",
    icon: "Bot",
    description: "Explore autonomous AI agents, threat hunting, and dual-use challenges in cybersecurity.",
    questions: [
      {
        id: "ch3_q1",
        text: "What structural feature differentiates agentic systems from reactive generators?",
        options: [
          "Multi-turn conversational memory capabilities",
          "Persistent state with action-feedback loops",
          "Transformer-based decoding architectures",
          "Pretraining on large, diverse text corpora",
        ],
        correctIndex: 1,
      },
      {
        id: "ch3_q2",
        text: "Why are agentic systems particularly effective in threat hunting?",
        options: [
          "They operate without any external tools",
          "They replace analysts entirely",
          "They eliminate false positives completely",
          "They iteratively plan and adapt investigations",
        ],
        correctIndex: 3,
      },
      {
        id: "ch3_q3",
        text: "What risk emerges from dual-use capabilities in agentic cybersecurity systems?",
        options: [
          "Escalation through automated adversarial replication",
          "Reduced logging transparency in operations",
          "Latency increases in distributed environments",
          "Overfitting to historical attack patterns",
        ],
        correctIndex: 0,
      },
      {
        id: "ch3_q4",
        text: "What is the primary challenge in designing agentic threat hunting systems?",
        options: [
          "Focusing solely on isolated alert handling",
          "Preserving analyst flexibility while remaining robust",
          "Limiting use to routine alert-driven workflows",
          "Ensuring systems are completely autonomous",
        ],
        correctIndex: 1,
      },
      {
        id: "ch3_q5",
        text: "What tradeoff defines responsiveness versus controllability in agentic systems?",
        options: [
          "Model size versus inference speed metrics",
          "Precision versus recall in classification",
          "Exploration depth versus policy constraint",
          "Encryption strength versus observability",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 4,
    name: "Blockchain Security",
    slug: "blockchain-security",
    icon: "Blocks",
    description: "Master blockchain privacy, consensus mechanisms, cryptographic authority, and attack economics.",
    questions: [
      {
        id: "ch4_q1",
        text: "Why does address reuse reduce privacy in Bitcoin?",
        options: [
          "It exposes transaction graph linkability",
          "It weakens cryptographic hashing algorithms",
          "It lowers the mining difficulty temporarily",
          "It invalidates digital signatures permanently",
        ],
        correctIndex: 0,
      },
      {
        id: "ch4_q2",
        text: "What mechanism enforces transaction immutability in the blockchain?",
        options: [
          "Centralized ledger reconciliation protocols",
          "Miner fee competition dynamics",
          "Wallet encryption standards compliance",
          "Proof-of-work chained hashing",
        ],
        correctIndex: 3,
      },
      {
        id: "ch4_q3",
        text: "Why does double-spending require majority hash power to succeed?",
        options: [
          "Private keys are designed for one-time use",
          "Chain reorganization demands cumulative work dominance",
          "Blocks propagate sequentially across nodes",
          "Nodes validate signatures independently",
        ],
        correctIndex: 1,
      },
      {
        id: "ch4_q4",
        text: "What cryptographic property enables spending authority in Bitcoin?",
        options: [
          "Merkle tree inclusion proofs",
          "Hash preimage resistance functions",
          "ECDSA signature verification",
          "Timestamp ordering mechanisms",
        ],
        correctIndex: 2,
      },
      {
        id: "ch4_q5",
        text: "Why does increasing hash rate improve network security?",
        options: [
          "It shortens transaction confirmation intervals",
          "It reduces block size variability",
          "It compresses transaction data efficiently",
          "It raises the cost of rewriting history",
        ],
        correctIndex: 3,
      },
    ],
  },
]
