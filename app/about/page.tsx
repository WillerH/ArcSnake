"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ExternalLink } from "lucide-react"

const SNAKE_CONTRACT = "0x2A1FBF5eAE3124FD3A9af8BD0eaB235e9D1Ae469"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Minimal header with back link */}
      <header className="border-b border-border gradient-header backdrop-blur-md sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-7xl">
          <Link
            href="/"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center glow-primary-strong transition-transform hover:scale-105 duration-200">
              <div className="text-3xl font-bold text-background">🐍</div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent tracking-tight">
              Arc Snake
            </h1>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl space-y-8">
        {/* About Arc Snake */}
        <Card className="p-8 border-border/50 gradient-card">
          <h2 className="text-4xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            About Arc Snake
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Arc Snake is an experimental Web3 game inspired by the classic Snake experience.
            It&apos;s an independent and experimental project, built for entertainment, learning,
            and testing purposes only.
          </p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Snakes are represented as NFTs, allowing players to use them in gameplay, while still
            offering a way to try the game without NFTs for testing and exploration.
          </p>
        </Card>

        {/* Creator */}
        <Card className="p-8 border-border/50 gradient-card">
          <h3 className="text-2xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Creator</h3>
          <p className="text-muted-foreground mb-4">
            ArcSnake was created by an independent developer.
          </p>
          <a
            href="https://x.com/Wi113R"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @Wi113R
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Card>

        {/* About Arc */}
        <Card className="p-8 border-border/50 gradient-card">
          <h3 className="text-2xl font-bold mb-4 tracking-tight">About Arc</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Arc is an open Layer-1 blockchain purpose-built to unite programmable money and onchain
            innovation with real-world economic activity.
          </p>
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Useful Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.arc.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                >
                  Arc Network
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/arc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Arc Network on X
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            <span className="shrink-0 text-lg leading-none">⚠️</span>
            <p>
              <span className="font-semibold">Disclaimer:</span> This website is not an official product and is not affiliated in any way with the Arc Testnet / Arc Network team.
            </p>
          </div>
        </Card>

        {/* Snake NFT Contract */}
        <Card className="p-8 border-border/50 gradient-card">
          <h3 className="text-2xl font-bold mb-4 tracking-tight">Snake NFT Contract</h3>
          <div className="bg-muted/30 rounded-lg border border-border/50 p-4 overflow-x-auto">
            <code className="font-mono text-sm text-primary break-all select-all">
              {SNAKE_CONTRACT}
            </code>
          </div>
        </Card>
      </main>
    </div>
  )
}
