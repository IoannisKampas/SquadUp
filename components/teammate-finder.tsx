"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StarIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import { CheckoutModal } from "@/components/checkout-modal"
import QuickMatchOption from "@/components/quick-match-option"

const teammates = [
  {
    id: 1,
    name: "AimMaster",
    game: "Valorant",
    role: "Duelist",
    rank: "Radiant",
    rating: 4.9,
    reviews: 128,
    pricePerGame: 8,
    image: "/placeholder.svg?height=100&width=100&text=AM",
    available: true,
  },
  {
    id: 2,
    name: "TacticalGenius",
    game: "Valorant",
    role: "Controller",
    rank: "Immortal 3",
    rating: 4.7,
    reviews: 94,
    pricePerGame: 6,
    image: "/placeholder.svg?height=100&width=100&text=TG",
    available: true,
  },
  {
    id: 3,
    name: "MarvelPro",
    game: "Marvel Rivals",
    role: "Support",
    rank: "Diamond",
    rating: 4.8,
    reviews: 76,
    pricePerGame: 7,
    image: "/placeholder.svg?height=100&width=100&text=MP",
    available: false,
  },
  {
    id: 4,
    name: "FlankMaster",
    game: "Valorant",
    role: "Initiator",
    rank: "Immortal 1",
    rating: 4.6,
    reviews: 62,
    pricePerGame: 5,
    image: "/placeholder.svg?height=100&width=100&text=FM",
    available: true,
  },
]

export default function TeammateFinder() {
  const [selectedTeammates, setSelectedTeammates] = useState<{ [key: number]: number }>({})
  const [quickMatchItems, setQuickMatchItems] = useState<{ [key: string]: { count: number; price: number } }>({})
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const addToCart = (teammateId: number) => {
    setSelectedTeammates((prev) => ({
      ...prev,
      [teammateId]: (prev[teammateId] || 0) + 1,
    }))
  }

  const removeFromCart = (teammateId: number) => {
    setSelectedTeammates((prev) => {
      const updated = { ...prev }
      if (updated[teammateId] > 0) {
        updated[teammateId] -= 1
      }
      if (updated[teammateId] === 0) {
        delete updated[teammateId]
      }
      return updated
    })
  }

  const addQuickMatchToCart = (game: string, count: number, price: number) => {
    setQuickMatchItems((prev) => ({
      ...prev,
      [game]: { count, price },
    }))
  }

  // Calculate totals for direct bookings
  const directBookingGames = Object.values(selectedTeammates).reduce((sum, count) => sum + count, 0)
  const directBookingCost = teammates.reduce((sum, teammate) => {
    return sum + (selectedTeammates[teammate.id] || 0) * teammate.pricePerGame
  }, 0)

  // Calculate totals for quick matches
  const quickMatchGames = Object.values(quickMatchItems).reduce((sum, item) => sum + item.count, 0)
  const quickMatchCost = Object.values(quickMatchItems).reduce((sum, item) => sum + item.count * item.price, 0)

  // Combined totals
  const totalGames = directBookingGames + quickMatchGames
  const totalCost = directBookingCost + quickMatchCost

  // Prepare checkout data
  const getCheckoutData = () => {
    const teammateItems = teammates
      .filter((teammate) => selectedTeammates[teammate.id] > 0)
      .map((teammate) => ({
        id: teammate.id,
        name: teammate.name,
        game: teammate.game,
        pricePerGame: teammate.pricePerGame,
        count: selectedTeammates[teammate.id],
      }))

    const quickItems = Object.entries(quickMatchItems).map(([game, data]) => ({
      id: `quick-${game}`,
      name: `Quick Match`,
      game,
      pricePerGame: data.price,
      count: data.count,
    }))

    return {
      totalGames,
      totalCost,
      teammates: [...teammateItems, ...quickItems],
    }
  }

  const handleCheckout = () => {
    setCheckoutOpen(true)
  }

  return (
    <div>
      {/* Quick Match Options */}
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-bold">Quick Match Options</h3>
        <p className="mb-6 text-gray-400">
          Get matched with any available pro teammate at a lower price. Our system will automatically assign you to a
          skilled player.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <QuickMatchOption game="Valorant" pricePerGame={4} onAddToCart={addQuickMatchToCart} />
          <QuickMatchOption game="Marvel Rivals" pricePerGame={4} onAddToCart={addQuickMatchToCart} />
        </div>
      </div>

      {/* Cart Summary */}
      {totalGames > 0 && (
        <div className="mb-6 rounded-xl border border-gray-800 bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingCartIcon className="h-5 w-5 text-green-500" />
              <div>
                <span className="font-medium">
                  {totalGames} game{totalGames !== 1 ? "s" : ""} selected
                </span>
                <span className="ml-2 text-gray-400">
                  Total: <span className="font-bold text-green-500">${totalCost}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-gray-800">
                View Details
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Teammates */}
      <h3 className="mb-4 text-xl font-bold">Select a Pro Teammate</h3>
      <p className="mb-6 text-gray-400">
        Choose your preferred pro teammate based on their game, role, rank, and reviews.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {teammates.map((teammate) => (
          <div
            key={teammate.id}
            className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-gray-700"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-800">
                <Image
                  src={teammate.image || "/placeholder.svg"}
                  alt={teammate.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border border-gray-800 ${teammate.available ? "bg-green-500" : "bg-gray-500"}`}
                ></div>
              </div>
              <div>
                <h3 className="font-bold">{teammate.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
                  <StarIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>{teammate.rating}</span>
                  <span>({teammate.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Game:</span>
                <Badge variant="outline" className="border-gray-700 bg-gray-800/50">
                  {teammate.game}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Role:</span>
                <Badge variant="outline" className="border-gray-700 bg-gray-800/50">
                  {teammate.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rank:</span>
                <Badge className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 text-cyan-400">
                  {teammate.rank}
                </Badge>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Price per game</div>
                  <div className="font-bold">${teammate.pricePerGame}</div>
                </div>

                {teammate.available ? (
                  selectedTeammates[teammate.id] ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-700 bg-transparent text-white hover:bg-gray-800"
                        onClick={() => removeFromCart(teammate.id)}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{selectedTeammates[teammate.id]}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-700 bg-transparent text-white hover:bg-gray-800"
                        onClick={() => addToCart(teammate.id)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
                      onClick={() => addToCart(teammate.id)}
                    >
                      Add Game
                    </Button>
                  )
                ) : (
                  <Button className="bg-gray-800 text-gray-400 cursor-not-allowed" disabled>
                    Unavailable
                  </Button>
                )}
              </div>

              {selectedTeammates[teammate.id] > 0 && (
                <div className="mt-2 text-right text-sm text-gray-400">
                  Total:{" "}
                  <span className="font-medium text-green-500">
                    ${selectedTeammates[teammate.id] * teammate.pricePerGame}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        totalGames={getCheckoutData().totalGames}
        totalCost={getCheckoutData().totalCost}
        teammates={getCheckoutData().teammates}
      />
    </div>
  )
}
