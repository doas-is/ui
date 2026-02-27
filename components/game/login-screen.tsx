"use client"

import { useWeb3Auth } from "@/lib/web3auth"
import { useGameStore } from "@/lib/game-store"
import { Button } from "@/components/ui/button"
import { Shield, Loader2, LogIn, Wallet } from "lucide-react"

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function LoginScreen() {
  const { isConnected, isLoading, isInitialized, userInfo, address, connect } = useWeb3Auth()
  const { goToWelcome } = useGameStore()
  const isDemoMode = !process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl" />
            <div className="relative flex size-20 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-sm">
              <Shield className="size-10 text-primary" />
            </div>
          </div>
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground">
            AI Escape Room
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            Connect your wallet to begin the challenge. Navigate 4 rooms, solve AI puzzles, and escape before time runs out.
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="size-6 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="mb-1 text-lg font-semibold text-foreground">Sign In</h2>
                <p className="text-sm text-muted-foreground">
                  Use your Google account or email to connect via Web3Auth.
                </p>
              </div>
              <Button
                onClick={connect}
                disabled={isLoading}
                className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="size-5" />
                    <span>{isDemoMode ? "Play in Demo Mode" : "Connect with Web3Auth"}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* User info */}
              <div className="flex size-14 items-center justify-center rounded-full bg-game-success/10">
                {userInfo?.profileImage ? (
                  <img
                    src={userInfo.profileImage}
                    alt="Player profile"
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-game-success">
                    {(userInfo?.name || userInfo?.email || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>

              <div className="text-center">
                <h2 className="mb-0.5 text-lg font-semibold text-foreground">
                  {userInfo?.name || userInfo?.email || "Connected"}
                </h2>
                {userInfo?.email && userInfo?.name && (
                  <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                )}
                {address && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {truncateAddress(address)}
                  </p>
                )}
              </div>

              <div className="w-full rounded-lg border border-game-success/20 bg-game-success/5 px-3 py-2 text-center">
                <p className="text-sm font-medium text-game-success">Wallet Connected</p>
              </div>

              <Button
                onClick={goToWelcome}
                className="h-12 w-full bg-game-success text-game-success-foreground hover:bg-game-success/90 text-base font-semibold"
                size="lg"
              >
                Continue
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isDemoMode
            ? "Demo Mode -- set NEXT_PUBLIC_WEB3AUTH_CLIENT_ID for live wallet auth"
            : "Powered by Web3Auth on Sepolia Testnet"}
        </p>
      </div>
    </div>
  )
}
