"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getUserChatRooms } from "@/lib/chat-actions"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import OrderChat from "@/components/order-chat"
import { MessageSquare, User, ShoppingBag } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"

type ChatRoom = {
  id: string
  order_id: string
  pro_id: string
  customer_id: string
  status: string
  created_at: string
  updated_at: string
  pro?: {
    username: string | null
    avatar_url: string | null
  }
  customer?: {
    username: string | null
    avatar_url: string | null
  }
  unread_count?: number
}

export default function CustomerDashboardChats() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading: profileLoading } = useProfile()
  const [supabase, setSupabase] = useState<any>(null)

  // Initialize Supabase client
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Fetch chat rooms when user is available
  useEffect(() => {
    const fetchChatRooms = async () => {
      if (profileLoading || !isAuthenticated || !user || !supabase) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get chat rooms
        const rooms = await getUserChatRooms(user.id)

        // Add unread count for each room
        const roomsWithUnreadCount = await Promise.all(
          rooms.map(async (room) => {
            const { data, error: countError } = await supabase
              .from("chat_messages")
              .select("id", { count: "exact" })
              .eq("chat_room_id", room.id)
              .eq("read", false)
              .neq("sender_id", user.id)

            return {
              ...room,
              unread_count: data?.length || 0,
            }
          }),
        )

        setChatRooms(roomsWithUnreadCount)
      } catch (err: any) {
        console.error("Error fetching chats:", err)
        setError(err.message)
        toast({
          title: "Error",
          description: `Failed to load chats: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChatRooms()
  }, [user, isAuthenticated, profileLoading, supabase, toast])

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user?.id || !supabase) return

    const subscription = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as any

          // Update unread count for the relevant chat room
          setChatRooms((prevRooms) =>
            prevRooms.map((room) => {
              if (room.id === newMessage.chat_room_id && newMessage.sender_id !== user.id) {
                return {
                  ...room,
                  unread_count: (room.unread_count || 0) + 1,
                  updated_at: new Date().toISOString(), // Update the timestamp to move it to the top
                }
              }
              return room
            }),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, supabase])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }

    // Otherwise show full date
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
  }

  if (profileLoading || loading) {
    return (
      <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
        <p className="text-gray-400">Loading chats...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
        <p className="text-red-400">You must be logged in to view chats</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  if (chatRooms.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-600 mb-4" />
        <p className="text-gray-400">No active chats</p>
        <p className="text-gray-500 text-sm mt-2">Chat rooms will appear here when you place orders with pros</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <Card className="bg-gray-900/50 border-gray-800 text-white overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Chat list sidebar */}
            <div className="border-r border-gray-800 overflow-y-auto">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-medium">Your Conversations</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {chatRooms
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((room) => (
                    <div
                      key={room.id}
                      className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                        selectedChatId === room.id ? "bg-gray-800" : ""
                      }`}
                      onClick={() => setSelectedChatId(room.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {room.pro?.username || "Pro Player"}
                              {room.status === "closed" && <span className="ml-2 text-xs text-gray-500">(Closed)</span>}
                            </p>
                            <p className="text-sm text-gray-400 flex items-center">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              Order #{room.order_id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                        {room.unread_count ? (
                          <span className="bg-green-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {room.unread_count}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chat content area */}
            <div className="col-span-2 flex flex-col">
              {selectedChatId ? (
                user?.id ? (
                  <OrderChat chatRoomId={selectedChatId} currentUserId={user.id} userType="customer" />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">User not authenticated</p>
                  </div>
                )
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                    <p className="text-gray-400">Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
