"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, XIcon, Clock, CalendarIcon, GamepadIcon, ShoppingBag, AlertCircle } from "lucide-react"
import { createChatRoom, closeChatRoom } from "@/lib/chat-actions"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

type Order = {
  id: string
  order_number: string
  type: string
  status: string
  game_count: number
  price_per_game: number
  total_price: number
  created_at: string
  game: {
    id: string
    name: string
  }
  customer: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export default function ProDashboardOrders({ status }: { status: "pending" | "upcoming" | "completed" }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const { toast } = useToast()
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [status])

  async function fetchOrders() {
    setLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      // Get the current user's session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/sign-in")
        return
      }

      const userId = session.user.id

      // First, check if there are any pending orders with null pro_id
      const { data: pendingOrders, error: pendingOrdersError } = await supabase
        .from("orders")
        .select("id, status, pro_id")
        .eq("status", "pending")

      if (pendingOrdersError) {
        console.error("Error checking pending orders:", pendingOrdersError)
        setDebugInfo(`Error checking pending orders: ${pendingOrdersError.message}`)
      } else {
        const pendingWithNullPro = pendingOrders?.filter((o) => o.pro_id === null).length || 0
        const pendingWithPro = pendingOrders?.filter((o) => o.pro_id !== null).length || 0

        setDebugInfo(
          `All pending orders: ${pendingOrders?.length || 0}\n` +
            `Pending with null pro_id: ${pendingWithNullPro}\n` +
            `Pending with assigned pro: ${pendingWithPro}`,
        )
      }

      // Also check orders assigned to this pro
      const { data: proOrders, error: proOrdersError } = await supabase
        .from("orders")
        .select("id, status")
        .eq("pro_id", userId)

      if (proOrdersError) {
        console.error("Error checking pro orders:", proOrdersError)
      } else if (proOrders) {
        const orderCounts = {
          total: proOrders.length,
          pending: proOrders.filter((o) => o.status === "pending").length,
          accepted: proOrders.filter((o) => o.status === "accepted").length,
          completed: proOrders.filter((o) => o.status === "completed").length,
        }
        setDebugInfo((prev) => `${prev || ""}\nOrders assigned to pro: ${JSON.stringify(orderCounts)}`)
      }

      let data
      let error

      if (status === "pending") {
        // For pending tab, show orders with null pro_id and status = pending
        const { data: pendingData, error: pendingError } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            type,
            status,
            game_count,
            price_per_game,
            total_price,
            created_at,
            game:game_id(id, name),
            customer:customer_id(id, username, avatar_url)
          `)
          .eq("status", "pending")
          .is("pro_id", null)
          .order("created_at", { ascending: false })

        data = pendingData
        error = pendingError

        // Log the raw query for debugging
        console.log("Fetching pending orders with null pro_id")
        setDebugInfo(
          (prev) =>
            `${prev || ""}\nSQL Query: SELECT * FROM orders WHERE status = 'pending' AND pro_id IS NULL ORDER BY created_at DESC`,
        )
      } else if (status === "upcoming") {
        // For upcoming tab, show orders assigned to this pro with status = accepted
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            type,
            status,
            game_count,
            price_per_game,
            total_price,
            created_at,
            game:game_id(id, name),
            customer:customer_id(id, username, avatar_url)
          `)
          .eq("pro_id", userId)
          .eq("status", "accepted")
          .order("created_at", { ascending: false })

        data = upcomingData
        error = upcomingError
        console.log(`Fetching accepted orders for pro: ${userId}`)
      } else if (status === "completed") {
        // For completed tab, show orders assigned to this pro with status = completed
        const { data: completedData, error: completedError } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            type,
            status,
            game_count,
            price_per_game,
            total_price,
            created_at,
            game:game_id(id, name),
            customer:customer_id(id, username, avatar_url)
          `)
          .eq("pro_id", userId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })

        data = completedData
        error = completedError
        console.log(`Fetching completed orders for pro: ${userId}`)
      }

      if (error) {
        console.error(`Error fetching ${status} orders:`, error)
        setError(`Failed to load orders: ${error.message || "Unknown error"}`)
        return
      }

      // Handle null or undefined data
      if (!data) {
        setOrders([])
        return
      }

      console.log(`Found ${data.length} orders for the ${status} tab`)
      setDebugInfo((prev) => `${prev || ""}\nQuery results for ${status} tab: ${data.length} orders`)

      // Process the data to ensure all required fields are present
      const processedOrders = data.map((order) => ({
        ...order,
        price_per_game: order.price_per_game || 0,
        total_price: order.total_price || 0,
        game_count: order.game_count || 1,
        game: order.game || { id: "", name: "Unknown Game" },
        customer: order.customer || { id: "", username: "Unknown User", avatar_url: null },
      }))

      setOrders(processedOrders)
    } catch (err: any) {
      console.error(`Error fetching ${status} orders:`, err)
      setError(`Failed to load orders: ${err?.message || "An unexpected error occurred"}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to check if a chat room exists for an order
  async function checkChatRoomExists(orderId: string) {
    try {
      const { data, error } = await supabase.from("chat_rooms").select("id").eq("order_id", orderId).single()

      if (error) {
        console.log("No chat room found for order:", orderId)
        return null
      }

      return data.id
    } catch (err) {
      console.error("Error checking chat room:", err)
      return null
    }
  }

  const handleAccept = async (orderId: string) => {
    setProcessingOrderId(orderId)

    try {
      // Find the order to get customer info
      const order = orders.find((o) => o.id === orderId)
      if (!order) {
        toast({
          title: "Error",
          description: "Order not found. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      // Get the current user's session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/sign-in")
        return
      }

      const proId = session.user.id

      // Update the order status to accepted and assign it to this pro
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "accepted",
          pro_id: proId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .is("pro_id", null) // Only update if pro_id is still null

      if (updateError) {
        console.error("Error updating order status:", updateError)
        throw new Error(updateError.message || "Failed to update order status")
      }

      // Check if a chat room already exists for this order
      const existingChatRoomId = await checkChatRoomExists(orderId)

      if (!existingChatRoomId) {
        // Create a chat room between the pro and customer
        const result = await createChatRoom(orderId, proId, order.customer.id)

        if (result.error) {
          console.error("Error creating chat room:", result.error)
          // Don't throw an error here, just log it and continue
          // The order has been accepted, which is the primary action
          toast({
            title: "Order Accepted",
            description: `You've accepted order ${order.order_number}, but there was an issue creating the chat room.`,
          })
        } else {
          toast({
            title: "Order Accepted",
            description: `You've accepted order ${order.order_number}. A chat room has been created.`,
          })
        }
      } else {
        toast({
          title: "Order Accepted",
          description: `You've accepted order ${order.order_number}. You can chat with the customer in the existing chat room.`,
        })
      }

      // Create a notification for the customer
      try {
        await supabase.from("notifications").insert({
          id: uuidv4(),
          user_id: order.customer.id,
          type: "order_accepted",
          title: "Order Accepted",
          message: `Your order ${order.order_number} has been accepted by a pro.`,
          data: { order_id: orderId, order_number: order.order_number },
          read: false,
        })
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError)
        // Don't fail the order if notification creation fails
      }

      // Refresh the orders list
      fetchOrders()
    } catch (error: any) {
      console.error("Error accepting order:", error)
      toast({
        title: "Error",
        description: error?.message || "There was an error accepting the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleDecline = async (orderId: string) => {
    setProcessingOrderId(orderId)

    try {
      // Find the order to get customer info
      const order = orders.find((o) => o.id === orderId)
      if (!order) {
        toast({
          title: "Error",
          description: "Order not found. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      // Get the current user's session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/sign-in")
        return
      }

      // For pending orders, we don't actually cancel them, we just remove them from this pro's view
      // This allows other pros to still accept the order
      // We'll use a separate table to track declined orders per pro

      // Check if a declined_orders table exists, if not, this is a soft decline
      const { data: tableExists } = await supabase
        .from("declined_orders")
        .select("count")
        .limit(1)
        .single()
        .catch(() => ({ data: null }))

      if (tableExists !== null) {
        // If the table exists, record this pro's decline
        await supabase.from("declined_orders").insert({
          order_id: orderId,
          pro_id: session.user.id,
          declined_at: new Date().toISOString(),
        })
      }

      toast({
        title: "Order Declined",
        description: `You've declined order ${order.order_number}. It will no longer appear in your pending orders.`,
      })

      // Remove this order from the local state
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId))
    } catch (error: any) {
      console.error("Error declining order:", error)
      toast({
        title: "Error",
        description: error?.message || "There was an error declining the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleComplete = async (orderId: string) => {
    setProcessingOrderId(orderId)

    try {
      // Find the order
      const order = orders.find((o) => o.id === orderId)
      if (!order) {
        toast({
          title: "Order Not Found",
          description: "Could not find this order. Please refresh and try again.",
          variant: "destructive",
        })
        return
      }

      // Update the order status to completed
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("Error completing order:", updateError)
        throw new Error(updateError.message || "Failed to complete order")
      }

      // Check if a chat room exists for this order
      const chatRoomId = await checkChatRoomExists(orderId)

      // Close the chat room if it exists
      if (chatRoomId) {
        const result = await closeChatRoom(chatRoomId)

        if (result.error) {
          console.warn("Warning: Could not close chat room:", result.error)
          // Continue anyway as the order completion is more important
        }
      }

      // Create a notification for the customer
      try {
        await supabase.from("notifications").insert({
          id: uuidv4(),
          user_id: order.customer.id,
          type: "order_completed",
          title: "Order Completed",
          message: `Your order ${order.order_number} has been marked as complete.`,
          data: { order_id: orderId, order_number: order.order_number },
          read: false,
        })
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError)
        // Don't fail the order if notification creation fails
      }

      toast({
        title: "Order Completed",
        description: `Order ${order.order_number} has been marked as complete.`,
      })

      // Refresh the orders list
      fetchOrders()
    } catch (error: any) {
      console.error("Error completing order:", error)
      toast({
        title: "Error",
        description: error?.message || "There was an error completing the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
        <Clock className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-400">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <Button
          variant="outline"
          className="mt-4 border-red-800 text-red-400 hover:bg-red-900/50"
          onClick={() => fetchOrders()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4 grid gap-4">
      {debugInfo && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/20 p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400">Debug Information</h4>
              <p className="text-sm text-yellow-300/80 whitespace-pre-line">{debugInfo}</p>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
          <p className="text-gray-400">No {status} orders at the moment.</p>
          <Button
            variant="outline"
            className="mt-4 border-gray-700 text-gray-400 hover:bg-gray-800"
            onClick={() => fetchOrders()}
          >
            Refresh
          </Button>
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="bg-gray-900/50 border-gray-800 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{order.order_number}</h3>
                        <Badge
                          className={
                            order.type === "quick-match"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-cyan-500/20 text-cyan-400"
                          }
                        >
                          {order.type === "quick-match" ? "Quick Match" : "Direct Booking"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1 text-sm">
                          <GamepadIcon className="h-4 w-4 text-gray-400" />
                          <span>{order.game?.name || "Unknown Game"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <ShoppingBag className="h-4 w-4 text-gray-400" />
                          <span>
                            {order.game_count} game{order.game_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-400">${order.price_per_game} per game</div>
                      <div className="text-xl font-bold text-green-500">${order.total_price}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-800 overflow-hidden">
                      {order.customer?.avatar_url ? (
                        <Image
                          src={order.customer.avatar_url || "/placeholder.svg"}
                          width={32}
                          height={32}
                          alt="Customer avatar"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-700 text-sm font-medium text-white">
                          {order.customer?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{order.customer?.username || "Unknown User"}</div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-end border-t md:border-t-0 md:border-l border-gray-800 bg-gray-900/30">
                  {status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleAccept(order.id)}
                        disabled={processingOrderId === order.id}
                        className="flex-1 rounded-none bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300"
                      >
                        {processingOrderId === order.id ? (
                          <>
                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="mr-2 h-4 w-4" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDecline(order.id)}
                        disabled={processingOrderId === order.id}
                        variant="ghost"
                        className="flex-1 rounded-none text-gray-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <XIcon className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </>
                  )}

                  {status === "upcoming" && (
                    <Button
                      onClick={() => handleComplete(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex-1 rounded-none bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
                    >
                      {processingOrderId === order.id ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  )}

                  {status === "completed" && (
                    <div className="flex items-center justify-center p-4 text-center">
                      <div className="text-sm text-green-500">
                        <CheckIcon className="mx-auto mb-1 h-5 w-5" />
                        Completed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
