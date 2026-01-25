export interface SnakeType {
  level: number
  tokenId: number
  name: string
  rarity: string
  rarityColor: string
  multiplier: number
  description: string
  image: string
  bgColor: string
  xpToNextLevel?: number
  price: string
  gameColors: {
    head: [string, string] // gradient colors for head
    body: [string, string] // gradient colors for body
  }
}

export interface SnakeNFT extends SnakeType {
  id: string
  xp: number
  energy: number
  maxEnergy: number
  nextPlayTime: number | null
}

export const SNAKE_TYPES: SnakeType[] = [
  {
    level: 1,
    tokenId: 0,
    name: "Rattlesnake",
    rarity: "Common",
    rarityColor: "text-gray-400",
    multiplier: 1.0,
    description: "Deadly and precise",
    image: "/images/cascavel.png",
    bgColor: "bg-gradient-to-br from-amber-700/20 to-purple-500/20",
    xpToNextLevel: 200,
    price: "1",
    gameColors: {
      head: ["210, 170, 80", "180, 140, 60"], // golden amber
      body: ["180, 140, 60", "140, 100, 40"], // darker amber
    },
  },
  {
    level: 2,
    tokenId: 1,
    name: "Coral Snake",
    rarity: "Rare",
    rarityColor: "text-blue-400",
    multiplier: 1.5,
    description: "Bright and venomous",
    image: "/images/coral.png",
    bgColor: "bg-gradient-to-br from-red-500/20 to-purple-500/20",
    xpToNextLevel: 300,
    price: "5",
    gameColors: {
      head: ["220, 60, 60", "180, 40, 40"], // bright red
      body: ["180, 40, 40", "100, 20, 20"], // dark red to black
    },
  },
  {
    level: 3,
    tokenId: 2,
    name: "King Cobra",
    rarity: "Legendary",
    rarityColor: "text-yellow-400",
    multiplier: 2.0,
    description: "Strong and intimidating",
    image: "/images/naja.png",
    bgColor: "bg-gradient-to-br from-yellow-600/20 to-purple-500/20",
    xpToNextLevel: 1000,
    price: "10",
    gameColors: {
      head: ["230, 180, 60", "200, 150, 40"], // bright gold
      body: ["200, 150, 40", "80, 100, 80"], // gold to dark teal
    },
  },
  {
    level: 4,
    tokenId: 3,
    name: "Black Mamba",
    rarity: "Mythic",
    rarityColor: "text-purple-400",
    multiplier: 3.0,
    description: "Extremely fast and lethal",
    image: "/images/mamba.png",
    bgColor: "bg-gradient-to-br from-blue-900/20 to-purple-500/20",
    xpToNextLevel: 1500,
    price: "20",
    gameColors: {
      head: ["80, 100, 180", "60, 60, 140"], // deep blue
      body: ["60, 60, 140", "40, 40, 80"], // dark blue-purple
    },
  },
]
