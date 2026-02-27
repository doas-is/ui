"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"

// ─── Types ──────────────────────────────────────────────────────

export interface Web3AuthUser {
  email?: string
  name?: string
  profileImage?: string
  verifier?: string
  verifierId?: string
}

export interface Web3AuthContextType {
  isConnected: boolean
  isLoading: boolean
  isInitialized: boolean
  userInfo: Web3AuthUser | null
  address: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider: unknown | null
}

const Web3AuthContext = createContext<Web3AuthContextType>({
  isConnected: false,
  isLoading: true,
  isInitialized: false,
  userInfo: null,
  address: null,
  connect: async () => {},
  disconnect: async () => {},
  provider: null,
})

// ─── Provider component ─────────────────────────────────────────

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [userInfo, setUserInfo] = useState<Web3AuthUser | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [web3authProvider, setWeb3authProvider] = useState<unknown | null>(null)

  const web3authRef = useRef<any>(null)
  const initPromiseRef = useRef<Promise<void> | null>(null)

  // Initialize Web3Auth lazily
  const initWeb3Auth = useCallback(async () => {
    if (web3authRef.current) return
    if (initPromiseRef.current) return initPromiseRef.current

    initPromiseRef.current = (async () => {
      try {
        const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
        const network = process.env.NEXT_PUBLIC_WEB3AUTH_NETWORK || "sapphire_devnet"

        if (!clientId) {
          console.error("[web3auth] Missing NEXT_PUBLIC_WEB3AUTH_CLIENT_ID")
          setIsLoading(false)
          return
        }

        const { Web3Auth } = await import("@web3auth/modal")
        const { CHAIN_NAMESPACES } = await import("@web3auth/modal")

        const web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: network as any,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0xaa36a7", // Sepolia 11155111
            rpcTarget: "https://rpc.sepolia.org",
            displayName: "Sepolia Testnet",
            blockExplorerUrl: "https://sepolia.etherscan.io",
            ticker: "ETH",
            tickerName: "Ethereum",
          },
        })

        await web3auth.initModal()
        web3authRef.current = web3auth

        // Check if already connected from previous session
        if (web3auth.connected && web3auth.provider) {
          await handleConnected(web3auth)
        }

        setIsInitialized(true)
      } catch (error) {
        console.error("[web3auth] Init error:", error)
      } finally {
        setIsLoading(false)
      }
    })()

    return initPromiseRef.current
  }, [])

  const handleConnected = useCallback(async (web3auth: any) => {
    try {
      const user = await web3auth.getUserInfo()
      setUserInfo({
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        verifier: user.verifier,
        verifierId: user.verifierId,
      })

      // Get address via ethers
      const { BrowserProvider } = await import("ethers")
      const ethersProvider = new BrowserProvider(web3auth.provider as any)
      const signer = await ethersProvider.getSigner()
      const addr = await signer.getAddress()
      setAddress(addr)
      setWeb3authProvider(web3auth.provider)
      setIsConnected(true)
    } catch (error) {
      console.error("[web3auth] Error getting user info:", error)
    }
  }, [])

  useEffect(() => {
    initWeb3Auth()
  }, [initWeb3Auth])

  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      await initWeb3Auth()
      const web3auth = web3authRef.current
      if (!web3auth) throw new Error("Web3Auth not initialized")

      const provider = await web3auth.connect()
      if (provider) {
        await handleConnected(web3auth)
      }
    } catch (error) {
      console.error("[web3auth] Connect error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [initWeb3Auth, handleConnected])

  const disconnect = useCallback(async () => {
    try {
      const web3auth = web3authRef.current
      if (web3auth) {
        await web3auth.logout()
      }
      setIsConnected(false)
      setUserInfo(null)
      setAddress(null)
      setWeb3authProvider(null)
    } catch (error) {
      console.error("[web3auth] Disconnect error:", error)
    }
  }, [])

  return (
    <Web3AuthContext.Provider
      value={{
        isConnected,
        isLoading,
        isInitialized,
        userInfo,
        address,
        connect,
        disconnect,
        provider: web3authProvider,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  )
}

export function useWeb3Auth() {
  return useContext(Web3AuthContext)
}
