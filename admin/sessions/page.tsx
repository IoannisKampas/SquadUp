"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

export default function SessionsManagement() {
  const [sessions, setSessions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          player:player_id(username),
          pro:pro_id(username),
          game:game_id(name)
        `)
        .order("scheduled_at", { ascending: false })

      if (error) {
        console.error("Error fetching sessions:", error)
      } else {
        setSessions(data || [])
      }

      setIsLoading(false)
    }

    fetchSessions()
  }, [])

  const filteredSessions = sessions.filter(
    (session) =>
      (session.player?.username && session.player.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (session.pro?.username && session.pro.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (session.game?.name && session.game.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sessions Management</h1>
          <p className="text-gray-400">Manage coaching sessions</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sessions..."
              className="pl-10 border-gray-700 bg-gray-800/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-gray-700 bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Sessions List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Game</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Player</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Pro Teammate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Scheduled</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Duration</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-3 px-4">{session.game?.name || "Unknown Game"}</td>
                      <td className="py-3 px-4">{session.player?.username || "Unknown Player"}</td>
                      <td className="py-3 px-4">{session.pro?.username || "Unknown Pro"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {session.status === "completed" ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Completed</span>
                            </>
                          ) : session.status === "cancelled" ? (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">Cancelled</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-yellow-500">Scheduled</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{new Date(session.scheduled_at).toLocaleString()}</td>
                      <td className="py-3 px-4">{session.duration_minutes} minutes</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 bg-transparent text-white hover:bg-gray-700"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
