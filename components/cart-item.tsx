"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"

interface CartItemProps {
  item: {
    id: string
    type: string
    game: string
    proName?: string
    pricePerGame: number | string
    gameCount: number | string
    proId?: string
    proAvatar?: string
  }
}

export function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity, removeItem } = useCart()
  const [quantity, setQuantity] = useState(Number(item.gameCount) || 1)

  // Ensure price is a valid number
  const pricePerGame = Number(item.pricePerGame) || 0
  const gameCount = Number(item.gameCount) || 1
  const totalPrice = pricePerGame * gameCount

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantity(newQuantity)
    updateItemQuantity(item.id, newQuantity)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 text-white overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-24 h-24 bg-gray-800 flex items-center justify-center">
            {item.type === "quick-match" ? (
              <div className="text-3xl font-bold text-gray-600">QM</div>
            ) : item.proAvatar ? (
              <Image
                src={item.proAvatar || "/placeholder.svg"}
                alt={item.proName || "Pro"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-3xl font-bold text-gray-600">
                {item.proName ? item.proName.charAt(0).toUpperCase() : "P"}
              </div>
            )}
          </div>

          <div className="flex-1 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold">
                  {item.type === "quick-match"
                    ? `${item.game} Quick Match`
                    : `${item.game} with ${item.proName || "Pro"}`}
                </h3>
                <p className="text-sm text-gray-400">
                  {item.type === "quick-match"
                    ? "Match with any available pro"
                    : `Direct booking with ${item.proName || "Pro"}`}
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-400">Price per game</div>
                <div className="font-bold">${pricePerGame.toFixed(2)}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-r-none border-gray-700"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="h-8 px-4 flex items-center justify-center border-y border-gray-700 bg-gray-800/50">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-l-none border-gray-700"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total</div>
                  <div className="font-bold text-green-500">${totalPrice.toFixed(2)}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
