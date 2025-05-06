import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const games = [
  {
    id: "valorant",
    name: "Valorant",
    image: "/placeholder.svg?height=300&width=500&text=Valorant",
    playerCount: 1240,
    description: "Tactical 5v5 character-based shooter",
    active: true,
  },
  {
    id: "marvel-rivals",
    name: "Marvel Rivals",
    image: "/placeholder.svg?height=300&width=500&text=Marvel+Rivals",
    playerCount: 860,
    description: "Team-based superhero action game",
    active: false,
  },
]

export default function GameSelector() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {games.map((game) => (
        <div
          key={game.id}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 transition-all hover:border-gray-700",
            game.active && "ring-2 ring-green-500/50",
          )}
        >
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={game.image || "/placeholder.svg"}
              alt={game.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            {game.active && (
              <div className="absolute right-4 top-4 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                Popular
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{game.name}</h3>
              <div className="text-sm text-gray-400">
                <span className="font-medium text-green-500">{game.playerCount}</span> players online
              </div>
            </div>
            <p className="mb-6 text-gray-400">{game.description}</p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90">
                Find Teammates
              </Button>
              <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-gray-800" asChild>
                <Link href={`/games/${game.id}`}>Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
