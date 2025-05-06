"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, CheckCircle, XCircle, Calendar, User, Users, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSession()
  }, [])

  async function fetchSession() {
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("sessions")
        .select(`
          *,
          player:player_id(id, username, email, full_name, avatar_url),
          pro:pro_id(id, username, email, full_name, avatar_url),
          game:game_id(id, name, image_url)
        `)
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error fetching session:", error)
        throw error
      }

      console.log("Session data:", data)
      setSession(data)
    } catch (error) {
      console.error("Failed to fetch session:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateSessionStatus(status: string) {
    setUpdating(true)
    try {
      const supabase = createClient()

      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Add timestamp for completed or cancelled sessions
      if (status === "completed") {
        updates.completed_at = new Date().toISOString()
      } else if (status === "cancelled") {
        updates.cancelled_at = new Date().toISOString()
      }

      const { data, error } = await supabase.from("sessions").update(updates).eq("id", params.id).select().single()

      if (error) {
        console.error("Error updating session status:", error)
        throw error
      }

      setSession(data)
    } catch (error) {
      console.error("Failed to update session status:", error)
    } finally {
      setUpdating(false)
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Cancelled</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">Pending</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Scheduled</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">{status}</Badge>
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Session Not Found</h1>
        </div>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="pt-6">
            <p className="text-center py-8 text-gray-400">
              The session you are looking for does not exist or has been deleted.
            </p>
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link href="/admin/orders">Back to Sessions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Session Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Session #{session.id.substring(0, 8)}</span>
                {getStatusBadge(session.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Player</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium overflow-hidden">
                        {session.player?.avatar_url ? (
                          <Image
                            src={session.player.avatar_url || "/placeholder.svg"}
                            alt={session.player.username || "Player"}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{session.player?.username || "Unknown"}</p>
                        <p className="text-sm text-gray-400">{session.player?.email || "No email"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Pro</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium overflow-hidden">
                        {session.pro?.avatar_url ? (
                          <Image
                            src={session.pro.avatar_url || "/placeholder.svg"}
                            alt={session.pro.username || "Pro"}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{session.pro?.username || "Unknown"}</p>
                        <p className="text-sm text-gray-400">{session.pro?.email || "No email"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Game</h3>
                  <p>{session.game?.name || "Unknown Game"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Price</h3>
                    <p className="text-xl font-bold">{session.price ? formatPrice(session.price) : "$0.00"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Duration</h3>
                    <p>{session.duration_minutes} minutes</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Created</h3>
                    <p>{new Date(session.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Scheduled At</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p>{session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : "Not scheduled"}</p>
                    </div>
                  </div>

                  {session.status === "completed" && session.completed_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Completed</h3>
                      <p>{new Date(session.completed_at).toLocaleString()}</p>
                    </div>
                  )}

                  {session.status === "cancelled" && session.cancelled_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Cancelled</h3>
                      <p>{new Date(session.cancelled_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Notes</h3>
                    <p className="text-gray-300">{session.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(session.status === "pending" || session.status === "scheduled") && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateSessionStatus("completed")}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                      onClick={() => updateSessionStatus("cancelled")}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Cancel Session
                    </Button>
                  </>
                )}

                {session.status === "completed" && (
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => updateSessionStatus("scheduled")}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Revert to Scheduled
                  </Button>
                )}

                {session.status === "cancelled" && (
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => updateSessionStatus("pending")}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Revert to Pending
                  </Button>
                )}

                {session.chat_room_id && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    asChild
                  >
                    <Link href={`/admin/chats/${session.chat_room_id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Chat
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/orders">Back to Sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
