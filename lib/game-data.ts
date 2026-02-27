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
  questionsPerRoom: 10,
  pointsPerCorrect: 5,
  maxScore: 200,
  passingThreshold: 8, // out of 10
  totalTimeSeconds: 15 * 60, // 15 minutes
  retryPenalty: 5,
  hintPenalty: 10,
  warningTimeSeconds: 2 * 60, // 2 minutes warning
} as const

export const rooms: Room[] = [
  {
    id: 1,
    name: "AI Foundations",
    slug: "ai-foundations",
    icon: "Brain",
    description: "Test your knowledge of artificial intelligence fundamentals, machine learning types, and data preprocessing.",
    questions: [
      {
        id: "ch1_q01",
        text: "What is machine learning a subset of?",
        options: [
          "Deep Learning",
          "Artificial Intelligence",
          "Data Science",
          "Statistics"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q02",
        text: "What are the three main types of machine learning?",
        options: [
          "Supervised, Unsupervised, Reinforcement",
          "Supervised, Unsupervised, Semi-supervised",
          "Regression, Classification, Clustering",
          "Linear Regression, Logistic Regression, Decision Trees"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q03",
        text: "What is an example of a regression task?",
        options: [
          "Predicting whether a customer will buy a product",
          "Predicting the value of a particular stock",
          "Classifying images into different categories",
          "Clustering similar data points together"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q04",
        text: "What is the purpose of the High Correlation filter technique in data cleaning?",
        options: [
          "To identify and drop features with constant values",
          "To find highly correlated features and remove them to reduce multicollinearity",
          "To replace missing values with suitable values",
          "To delete rows with outliers"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q05",
        text: "What is the difference between feature selection and feature extraction?",
        options: [
          "Feature selection involves creating new features, while feature extraction involves selecting a subset of existing features",
          "Feature selection involves selecting a subset of existing features, while feature extraction involves creating new features",
          "Feature selection and feature extraction are the same thing",
          "Feature selection is used for regression tasks, while feature extraction is used for classification tasks"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q06",
        text: "What is the purpose of dimensionality reduction?",
        options: [
          "To increase the number of features in a dataset",
          "To reduce the number of features in a dataset",
          "To improve the accuracy of a model",
          "To increase the training time of a model"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q07",
        text: "What is an example of an unsupervised learning algorithm that involves clustering?",
        options: [
          "Linear Regression",
          "Decision Trees",
          "k-Means",
          "Support Vector Machines"
        ],
        correctIndex: 2
      },
      {
        id: "ch1_q08",
        text: "How does the meanshift algorithm differ from the k-Means algorithm?",
        options: [
          "The meanshift algorithm requires specifying a value for k, while the k-Means algorithm does not",
          "The meanshift algorithm does not require specifying a value for k, while the k-Means algorithm does",
          "The meanshift algorithm is used for regression tasks, while the k-Means algorithm is used for classification tasks",
          "The meanshift algorithm is used for classification tasks, while the k-Means algorithm is used for regression tasks"
        ],
        correctIndex: 1
      },
      {
        id: "ch1_q09",
        text: "What is the purpose of the Missing Value Ratio technique in data cleaning?",
        options: [
          "To identify and drop features with constant values",
          "To find highly correlated features and remove them to reduce multicollinearity",
          "To replace missing values with suitable values",
          "To drop features with a large number of missing values"
        ],
        correctIndex: 3
      },
      {
        id: "ch1_q10",
        text: "What is the advantage of using feature selection in machine learning?",
        options: [
          "It increases the training time of a model",
          "It makes the model more complex and harder to interpret",
          "It reduces the training time of a model and makes it easier to interpret",
          "It has no effect on the performance of a model"
        ],
        correctIndex: 2
      }
    ]
  },
  {
    id: 2,
    name: "LLMs",
    slug: "llms",
    icon: "MessageSquare",
    description: "Dive into Large Language Models, transformers, and natural language processing.",
    questions: [
      {
        id: "r2q1",
        text: "What architecture is the foundation of most modern LLMs?",
        options: [
          "Recurrent Neural Networks (RNN)",
          "Convolutional Neural Networks (CNN)",
          "Transformer",
          "Boltzmann Machines"
        ],
        correctIndex: 2
      },
      {
        id: "r2q2",
        text: "What does 'attention mechanism' do in a Transformer model?",
        options: [
          "It filters out irrelevant training data",
          "It allows the model to focus on relevant parts of the input sequence",
          "It speeds up the GPU computation",
          "It reduces memory usage"
        ],
        correctIndex: 1
      },
      {
        id: "r2q3",
        text: "What is 'tokenization' in the context of LLMs?",
        options: [
          "Converting models into cryptocurrency tokens",
          "Breaking text into smaller units (tokens) for processing",
          "Encrypting the model weights",
          "Compressing the training dataset"
        ],
        correctIndex: 1
      },
      {
        id: "r2q4",
        text: "What is 'hallucination' in LLMs?",
        options: [
          "When the model generates confident but factually incorrect information",
          "When the model stops generating output",
          "When the model runs out of memory",
          "When the model creates visual images"
        ],
        correctIndex: 0
      },
      {
        id: "r2q5",
        text: "What technique is commonly used to adapt a pre-trained LLM to specific tasks?",
        options: [
          "Data augmentation",
          "Fine-tuning",
          "Feature engineering",
          "Dimensionality reduction"
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 3,
    name: "Agentic AI",
    slug: "agentic-ai",
    icon: "Bot",
    description: "Explore autonomous AI agents, tool use, reasoning chains, and multi-agent systems.",
    questions: [
      {
        id: "r3q1",
        text: "What distinguishes an 'AI agent' from a standard LLM?",
        options: [
          "It has a larger model size",
          "It can autonomously plan, use tools, and take actions",
          "It only works offline",
          "It requires no training data"
        ],
        correctIndex: 1
      },
      {
        id: "r3q2",
        text: "What is 'ReAct' in the context of AI agents?",
        options: [
          "A JavaScript framework for building UIs",
          "A pattern combining Reasoning and Acting in language models",
          "A method for training reward models",
          "A database for storing agent memories"
        ],
        correctIndex: 1
      },
      {
        id: "r3q3",
        text: "What is 'tool use' in agentic AI?",
        options: [
          "Using physical robotic tools",
          "The ability of an AI to call external APIs or functions to complete tasks",
          "A method for compressing model weights",
          "A technique for data labeling"
        ],
        correctIndex: 1
      },
      {
        id: "r3q4",
        text: "What is the main challenge with multi-agent systems?",
        options: [
          "They require exactly two agents",
          "Coordination, communication, and preventing conflicting actions",
          "They can only work on text tasks",
          "They are always slower than single models"
        ],
        correctIndex: 1
      },
      {
        id: "r3q5",
        text: "What is a 'chain of thought' prompting technique?",
        options: [
          "Linking multiple LLMs in sequence",
          "Asking the model to show its step-by-step reasoning process",
          "Creating a blockchain of model outputs",
          "Using multiple GPUs in a chain"
        ],
        correctIndex: 1
      }
    ]
  },
  {
    id: 4,
    name: "Blockchain & Quantum",
    slug: "blockchain-quantum",
    icon: "Blocks",
    description: "Master blockchain fundamentals, smart contracts, and quantum computing concepts.",
    questions: [
      {
        id: "r4q1",
        text: "What is a 'smart contract'?",
        options: [
          "A legally binding digital document",
          "Self-executing code stored on a blockchain that runs when conditions are met",
          "An AI that negotiates contracts",
          "An encrypted email protocol"
        ],
        correctIndex: 1
      },
      {
        id: "r4q2",
        text: "What consensus mechanism does Ethereum currently use?",
        options: [
          "Proof of Work",
          "Proof of Stake",
          "Proof of Authority",
          "Delegated Proof of Stake"
        ],
        correctIndex: 1
      },
      {
        id: "r4q3",
        text: "What is a 'qubit' in quantum computing?",
        options: [
          "A classical bit that is faster",
          "A quantum bit that can exist in superposition of 0 and 1",
          "A unit of blockchain storage",
          "A type of encryption key"
        ],
        correctIndex: 1
      },
      {
        id: "r4q4",
        text: "What is 'quantum supremacy'?",
        options: [
          "When quantum computers become affordable for everyone",
          "When a quantum computer solves a problem faster than any classical computer",
          "When all encryption is broken by quantum computers",
          "When quantum computers replace all classical computers"
        ],
        correctIndex: 1
      },
      {
        id: "r4q5",
        text: "What problem does blockchain's immutability solve?",
        options: [
          "Slow internet connections",
          "Data tampering and trust in decentralized systems",
          "High electricity costs",
          "Software compatibility issues"
        ],
        correctIndex: 1
      }
    ]
  }
]
