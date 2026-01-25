"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SnakeNFT } from "@/lib/snake-data"
import { ArrowLeft, RotateCcw } from "lucide-react"

interface SnakeGameProps {
  snake: SnakeNFT
  onGameEnd: (finalScore: number) => void
  isTrainingMode?: boolean
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type PowerUpType = "slow" | null

interface Position {
  x: number
  y: number
}

interface Food extends Position {
  type: "regular" | "golden"
}

export function SnakeGame({ snake, onGameEnd, isTrainingMode = false }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  const gridSize = 20
  const cellSize = 20

  const snakeRef = useRef<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
  ])
  const directionRef = useRef<Direction>("RIGHT")
  const nextDirectionRef = useRef<Direction>("RIGHT")
  const foodRef = useRef<Food>({ x: 15, y: 10, type: "regular" })
  const powerUpRef = useRef<PowerUpType>(null)
  const powerUpTimeRef = useRef<number>(0)
  const gameSpeedRef = useRef<number>(150)

  const btcImageRef = useRef<HTMLImageElement | null>(null)
  const usdcImageRef = useRef<HTMLImageElement | null>(null)
  const imagesLoadedRef = useRef(false)

  const isPositionOnSnake = useCallback((pos: Position, snakeBody: Position[]): boolean => {
    return snakeBody.some((segment) => segment.x === pos.x && segment.y === pos.y)
  }, [])

  const generateFood = useCallback((): Food => {
    const isGolden = Math.random() < 0.15 // 15% chance for golden food
    let newFood: Food
    let attempts = 0
    const maxAttempts = 100

    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        type: isGolden ? "golden" : "regular",
      }
      attempts++
    } while (isPositionOnSnake(newFood, snakeRef.current) && attempts < maxAttempts)

    return newFood
  }, [isPositionOnSnake])

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ]
    directionRef.current = "RIGHT"
    nextDirectionRef.current = "RIGHT"
    foodRef.current = generateFood()
    powerUpRef.current = null
    powerUpTimeRef.current = 0
    setScore(0)
    setXpEarned(0)
    setGameOver(false)
    setGameStarted(true)
  }, [generateFood])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) {
        if (e.key.startsWith("Arrow") || ["w", "a", "s", "d"].includes(e.key.toLowerCase())) {
          if (!gameStarted) {
            setGameStarted(true)
          }
        }
        return
      }

      const key = e.key.toLowerCase()
      const current = directionRef.current

      if ((key === "arrowup" || key === "w") && current !== "DOWN") {
        nextDirectionRef.current = "UP"
      } else if ((key === "arrowdown" || key === "s") && current !== "UP") {
        nextDirectionRef.current = "DOWN"
      } else if ((key === "arrowleft" || key === "a") && current !== "RIGHT") {
        nextDirectionRef.current = "LEFT"
      } else if ((key === "arrowright" || key === "d") && current !== "LEFT") {
        nextDirectionRef.current = "RIGHT"
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameStarted, gameOver])

  useEffect(() => {
    const usdcImg = new Image()
    usdcImg.crossOrigin = "anonymous"
    usdcImg.src = "/images/usdc-token.png"
    usdcImg.onload = () => {
      usdcImageRef.current = usdcImg
      checkImagesLoaded()
    }

    const btcImg = new Image()
    btcImg.crossOrigin = "anonymous"
    btcImg.src = "/images/btc-token.png"
    btcImg.onload = () => {
      btcImageRef.current = btcImg
      checkImagesLoaded()
    }

    function checkImagesLoaded() {
      if (btcImageRef.current && usdcImageRef.current) {
        imagesLoadedRef.current = true
      }
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gameLoop = setInterval(() => {
      directionRef.current = nextDirectionRef.current

      const head = { ...snakeRef.current[0] }

      switch (directionRef.current) {
        case "UP":
          head.y -= 1
          break
        case "DOWN":
          head.y += 1
          break
        case "LEFT":
          head.x -= 1
          break
        case "RIGHT":
          head.x += 1
          break
      }

      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        setGameOver(true)
        const earnedXP = Math.floor(score / 10)
        setXpEarned(earnedXP)
        return
      }

      if (snakeRef.current.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        const earnedXP = Math.floor(score / 10)
        setXpEarned(earnedXP)
        return
      }

      snakeRef.current.unshift(head)

      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        const points = foodRef.current.type === "golden" ? 5 : 1
        const multipliedPoints = Math.floor(points * snake.multiplier)
        setScore((prev) => prev + multipliedPoints)
        foodRef.current = generateFood()

        if (Math.random() < 0.1 && !powerUpRef.current) {
          powerUpRef.current = "slow"
          powerUpTimeRef.current = 3000
          gameSpeedRef.current = 250
        }
      } else {
        snakeRef.current.pop()
      }

      if (powerUpRef.current && powerUpTimeRef.current > 0) {
        powerUpTimeRef.current -= gameSpeedRef.current
        if (powerUpTimeRef.current <= 0) {
          powerUpRef.current = null
          gameSpeedRef.current = 150
        }
      }

      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "#1a1a1a"
      ctx.lineWidth = 1
      for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cellSize, 0)
        ctx.lineTo(i * cellSize, gridSize * cellSize)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * cellSize)
        ctx.lineTo(gridSize * cellSize, i * cellSize)
        ctx.stroke()
      }

      const foodX = foodRef.current.x * cellSize
      const foodY = foodRef.current.y * cellSize

      // Draw symbol only (slightly wider for the $ icon in the grid)
      const symbol = foodRef.current.type === "golden" ? "\u20BF" : "$"
      ctx.font = `bold ${Math.floor(cellSize * 0.8)}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = foodRef.current.type === "golden" ? "#F7931A" : "#2775CA"
      if (symbol === "$") {
        ctx.save()
        ctx.translate(foodX + cellSize / 2, foodY + cellSize / 2 + 1)
        ctx.scale(1.2, 1)
        ctx.fillText(symbol, 0, 0)
        ctx.restore()
      } else {
        ctx.fillText(symbol, foodX + cellSize / 2, foodY + cellSize / 2 + 1)
      }

      snakeRef.current.forEach((segment, index) => {
        const opacity = 1 - (index / snakeRef.current.length) * 0.5
        const gradient = ctx.createLinearGradient(
          segment.x * cellSize,
          segment.y * cellSize,
          (segment.x + 1) * cellSize,
          (segment.y + 1) * cellSize,
        )

        const colors = snake.gameColors || {
          head: ["59, 130, 246", "139, 92, 246"],
          body: ["59, 130, 246", "6, 182, 212"],
        }

        if (index === 0) {
          gradient.addColorStop(0, `rgba(${colors.head[0]}, ${opacity})`)
          gradient.addColorStop(1, `rgba(${colors.head[1]}, ${opacity})`)
        } else {
          gradient.addColorStop(0, `rgba(${colors.body[0]}, ${opacity})`)
          gradient.addColorStop(1, `rgba(${colors.body[1]}, ${opacity})`)
        }

        ctx.fillStyle = gradient
        ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2)
      })
    }, gameSpeedRef.current)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, score, snake.multiplier, generateFood])

  if (gameOver) {
    return (
      <Card className="max-w-2xl mx-auto p-8 border-border/50 bg-card/50 text-center">
        <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-muted-foreground mb-2">Final Score</p>
            <p className="text-4xl font-bold text-primary">{score}</p>
          </div>
          {!isTrainingMode && (
            <div>
              <p className="text-muted-foreground mb-2">XP Earned</p>
              <p className="text-2xl font-bold text-accent">+{xpEarned} XP</p>
            </div>
          )}
          {isTrainingMode && <p className="text-sm text-muted-foreground">Training mode - No XP earned</p>}
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={resetGame} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          <Button onClick={() => onGameEnd(score)} variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => onGameEnd(score)} variant="outline" size="sm" className="gap-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Snake</p>
            <p className="font-semibold">{snake.name}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Multiplier</p>
            <p className="font-bold text-accent">{snake.multiplier}x</p>
          </div>
          {powerUpRef.current === "slow" && (
            <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-lg text-sm font-semibold animate-pulse">
              ⏱️ Slow Motion
            </div>
          )}
        </div>
      </div>

      <Card className="p-4 border-border/50 bg-card/50">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={gridSize * cellSize}
            height={gridSize * cellSize}
            className="border border-border/50 rounded-lg mx-auto bg-black"
          />
          {!gameStarted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <p className="text-xl font-bold mb-2">Press any arrow key or WASD to start</p>
                <p className="text-sm text-muted-foreground">Use arrow keys or WASD to control</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 border-border/50 bg-card/50">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#2775CA] font-bold text-xl">$</span>
            <p className="font-semibold">+1 point</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#F7931A] font-bold text-xl">{"\u20BF"}</span>
            <p className="font-semibold">+5 points</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">&#9201;</span>
            <p className="font-semibold">Slow motion</p>
          </div>
        </div>
      </Card>

      {isTrainingMode && (
        <Card className="p-3 bg-primary/10 border-primary/30">
          <p className="text-sm text-center">
            🎮 <span className="font-semibold">Training Mode</span> - Scores don't count toward leaderboard
          </p>
        </Card>
      )}
    </div>
  )
}
