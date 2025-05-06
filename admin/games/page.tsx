"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, GamepadIcon } from "lucide-react"

export default function GamesManagement() {
  const [games, setGames] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.from("games").select("*").order("name")

      if (error) {
        console.error("Error fetching games:", error)
      } else {
        setGames(data || [])
      }

      setIsLoading(false)
    }

    fetchGames()
  }, [])

  const filteredGames = games.filter(
    (game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Games Management</h1>
          <p className="text-gray-400">Manage games available on the platform</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search games..."
              className="pl-10 border-gray-700 bg-gray-800/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Games List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <GamepadIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No games found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="bg-gray-700 border-gray-600">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    {game.image_url ? (
                      <img
                        src={game.image_url || "/placeholder.svg"}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <GamepadIcon className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">Slug: {game.slug}</p>
                    {game.description && <p className="text-sm text-gray-300 mb-4 line-clamp-2">{game.description}</p>}
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="border-gray-600 bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
