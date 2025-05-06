"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GamepadIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"

interface QuickMatchOptionProps {
  game: string
  pricePerGame: number
  onAddToCart: (game: string, count: number, price: number) => void
}

export default function QuickMatchOption({ game, pricePerGame, onAddToCart }: QuickMatchOptionProps) {
  const [gameCount, setGameCount] = useState(1)

  const incrementCount = () => {
    setGameCount((prev) => Math.min(prev + 1, 10)) // Maximum 10 games
  }

  const decrementCount = () => {
    if (gameCount > 1) {
      setGameCount((prev) => prev - 1)
    }
  }

  const handleAddToCart = () => {
    if (gameCount > 0) {
      console.log(`QuickMatchOption: Adding ${gameCount} games to cart`)
      onAddToCart(game, gameCount, pricePerGame)
      setGameCount(1) // Reset after adding to cart
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{game}</CardTitle>
          <Badge className="bg-purple-500/20 text-purple-400">Quick Match</Badge>
        </div>
        <p className="text-gray-400">Get matched with any available pro teammate</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Price per game</div>
            <div className="text-2xl font-bold text-green-500">${pricePerGame}</div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-gray-700 bg-transparent text-white hover:bg-gray-800"
              onClick={decrementCount}
              disabled={gameCount <= 1}
            >
              <MinusIcon className="h-5 w-5" />
            </Button>
            <span className="w-8 text-center text-xl">{gameCount}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-gray-700 bg-transparent text-white hover:bg-gray-800"
              onClick={incrementCount}
              disabled={gameCount >= 10}
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {gameCount > 0 && (
          <div className="mt-4 rounded-lg border border-gray-800 bg-black/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GamepadIcon className="h-5 w-5 text-purple-400" />
                <span>
                  {gameCount} game{gameCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="font-bold">Total: ${(gameCount * pricePerGame).toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
          disabled={gameCount === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCartIcon className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
