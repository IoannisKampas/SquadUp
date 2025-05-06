"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GamepadIcon, Clock, Calendar, Star, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SessionsList() {
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [pastSessions, setPastSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const supabase = createClientComponentClient()

        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError("Not authenticated")
          setLoading(false)
          return
        }

        const userId = session.user.id

        // Fetch upcoming sessions (confirmed but not completed)
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("orders")
          .select(`
            *,
            games:game_id(*),
            pro:pro_id(id, username, avatar_url)
          `)
          .eq("customer_id", userId)
          .in("status", ["confirmed", "pending"])
          .order("created_at", { ascending: false })

        if (upcomingError) {
          console.error("Error fetching upcoming sessions:", upcomingError)
          setError(upcomingError.message)
        } else {
          console.log("Upcoming sessions:", upcomingData)
          setUpcomingSessions(upcomingData || [])
        }

        // Fetch past sessions (completed)
        const { data: pastData, error: pastError } = await supabase
          .from("orders")
          .select(`
            *,
            games:game_id(*),
            pro:pro_id(id, username, avatar_url),
            reviews(*)
          `)
          .eq("customer_id", userId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })

        if (pastError) {
          console.error("Error fetching past sessions:", pastError)
          setError(pastError.message)
        } else {
          console.log("Past sessions:", pastData)
          setPastSessions(pastData || [])
        }
      } catch (err) {
        console.error("Error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        <p>Error loading sessions: {error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
        <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
        <TabsTrigger value="past">Past Sessions</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <Card className="bg-gray-900/50 border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription className="text-gray-400">Your scheduled gaming sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="rounded-lg border border-gray-800 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md bg-gray-800 flex items-center justify-center">
                          <GamepadIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-medium">{session.games?.name || "Game"}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(session.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(session.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="h-4 w-4" />
                              <span>
                                {session.game_count || 1} game{session.game_count !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Image
                            src={session.pro?.avatar_url || "/placeholder.svg?height=40&width=40&text=PRO"}
                            alt={session.pro?.username || "Pro"}
                            width={40}
                            height={40}
                            className="rounded-full border border-gray-700"
                          />
                          <div>
                            <div className="font-medium">{session.pro?.username || "Pro"}</div>
                            <Badge className="bg-cyan-500/20 text-cyan-400">Pro</Badge>
                          </div>
                        </div>

                        <Badge
                          className={
                            session.status === "confirmed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {session.status === "confirmed" ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-gray-800">
                        View Details
                      </Button>
                      <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-gray-800">
                        Message Teammate
                      </Button>
                      <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        Cancel Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <GamepadIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No upcoming sessions</p>
                <Button className="mt-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90">
                  Find Teammates
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="past">
        <Card className="bg-gray-900/50 border-gray-800 text-white">
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
            <CardDescription className="text-gray-400">Your completed gaming sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {pastSessions.length > 0 ? (
              <div className="space-y-4">
                {pastSessions.map((session) => {
                  // Find the review for this session if it exists
                  const review = session.reviews && session.reviews.length > 0 ? session.reviews[0] : null

                  return (
                    <div key={session.id} className="rounded-lg border border-gray-800 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-md bg-gray-800 flex items-center justify-center">
                            <GamepadIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium">{session.games?.name || "Game"}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(session.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ShoppingBag className="h-4 w-4" />
                                <span>
                                  {session.game_count || 1} game{session.game_count !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Image
                              src={session.pro?.avatar_url || "/placeholder.svg?height=40&width=40&text=PRO"}
                              alt={session.pro?.username || "Pro"}
                              width={40}
                              height={40}
                              className="rounded-full border border-gray-700"
                            />
                            <div>
                              <div className="font-medium">{session.pro?.username || "Pro"}</div>
                              <Badge className="bg-cyan-500/20 text-cyan-400">Pro</Badge>
                            </div>
                          </div>

                          {review && (
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {review && review.comment && (
                        <div className="mt-4 rounded-lg bg-gray-800/50 p-3">
                          <p className="text-sm text-gray-300">
                            <span className="font-medium">Your review:</span> {review.comment}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="border-gray-700 bg-transparent text-white hover:bg-gray-800"
                        >
                          View Details
                        </Button>
                        <Button className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <GamepadIcon className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No past sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
