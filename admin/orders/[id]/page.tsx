"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Users,
  MessageSquare,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

// Define types to improve performance and type safety
interface OrderData {
  id: string
  status: string
  total_price?: number
  game_count?: number
  created_at: string
  completed_at?: string
  cancelled_at?: string
  notes?: string
  chat_room_id?: string
  customer?: {
    id?: string
    username?: string
    avatar_url?: string
    email?: string
    full_name?: string
  }
  pro?: {
    id?: string
    username?: string
    avatar_url?: string
    email?: string
    full_name?: string
  }
  game?: {
    id?: string
    name?: string
    image_url?: string
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  // Use useCallback to prevent recreation of function on each render
  const fetchOrder = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNotFound(false)

    try {
      // First try the server-side admin API with a timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      try {
        const response = await fetch(`/api/admin/get-order?id=${params.id}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true)
            setLoading(false)
            return
          }
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        setOrder(result.order)
        setLoading(false)
        return
      } catch (apiError: any) {
        // If aborted due to timeout or other API error, fall back to client-side
        console.log(
          "API fetch failed, falling back to client-side:",
          apiError.name === "AbortError" ? "timeout" : apiError.message,
        )
      }

      // Fall back to client-side fetching
      const supabase = createClient()
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*, customer:player_id(*), pro:pro_id(*), game:game_id(*)")
        .eq("id", params.id)
        .single()

      if (orderError) {
        if (orderError.code === "PGRST116") {
          setNotFound(true)
        } else {
          throw new Error(`Could not fetch order: ${orderError.message}`)
        }
      } else if (orderData) {
        setOrder(orderData as unknown as OrderData)
      }
    } catch (err: any) {
      console.error("Failed to fetch order:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  // Use useCallback for updateOrderStatus to prevent recreation on each render
  const updateOrderStatus = useCallback(
    async (status: string) => {
      if (updating) return // Prevent multiple simultaneous updates

      setUpdating(true)
      try {
        // Try to update via API first
        const response = await fetch(`/api/admin/update-order-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: params.id,
            status,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update order status")
        }

        // Refresh the order data
        await fetchOrder()
      } catch (apiError) {
        console.error("API error:", apiError)

        // Fall back to client-side update
        try {
          const supabase = createClient()

          const updates: any = {
            status,
            updated_at: new Date().toISOString(),
          }

          // Add timestamp for completed or cancelled orders
          if (status === "completed") {
            updates.completed_at = new Date().toISOString()
          } else if (status === "cancelled") {
            updates.cancelled_at = new Date().toISOString()
          }

          const { error } = await supabase.from("orders").update(updates).eq("id", params.id)

          if (error) {
            throw error
          }

          // Refresh the order data
          await fetchOrder()
        } catch (error: any) {
          console.error("Failed to update order status:", error)
          setError(`Failed to update status: ${error.message}`)
        }
      } finally {
        setUpdating(false)
      }
    },
    [params.id, updating, fetchOrder],
  )

  // Fetch order data on component mount
  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Memoize status badge to prevent unnecessary re-renders
  const getStatusBadge = useMemo(() => {
    if (!order) return null

    switch (order.status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">Cancelled</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30">Pending</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Scheduled</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">{order.status}</Badge>
    }
  }, [order?.status, order])

  // Format price only when needed
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Order Not Found</h1>
        </div>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">The requested order could not be found</p>
                <p className="text-sm text-gray-300 mt-1">
                  Order with ID <span className="font-mono text-amber-300">{params.id}</span> does not exist or has been
                  deleted.
                </p>
                <div className="flex gap-3 mt-6">
                  <Button asChild variant="default">
                    <Link href="/admin/orders">View All Orders</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/create-order">Create New Order</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Error</h1>
        </div>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error loading order</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-400 hover:bg-red-950"
                    onClick={fetchOrder}
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Try Again
                  </Button>
                  <Button asChild>
                    <Link href="/admin/orders">Back to Orders</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Order Not Found</h1>
        </div>
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="pt-6">
            <p className="text-center py-8 text-gray-400">
              The order you are looking for does not exist or has been deleted.
            </p>
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link href="/admin/orders">Back to Orders</Link>
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
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Order #{order.id.substring(0, 8)}</span>
                {getStatusBadge}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Customer</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium overflow-hidden">
                        {order.customer?.avatar_url ? (
                          <Image
                            src={order.customer.avatar_url || "/placeholder.svg"}
                            alt={order.customer.username || "Customer"}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{order.customer?.username || "Unknown"}</p>
                        <p className="text-sm text-gray-400">{order.customer?.email || "No email provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Pro</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium overflow-hidden">
                        {order.pro?.avatar_url ? (
                          <Image
                            src={order.pro.avatar_url || "/placeholder.svg"}
                            alt={order.pro.username || "Pro"}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{order.pro?.username || "Unknown"}</p>
                        <p className="text-sm text-gray-400">{order.pro?.email || "No email provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Game</h3>
                  <p>{order.game?.name || "Unknown Game"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Price</h3>
                    <p className="text-xl font-bold">{order.total_price ? formatPrice(order.total_price) : "$0.00"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Game Count</h3>
                    <p>{order.game_count || 1}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Created</h3>
                    <p>{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.status === "completed" && order.completed_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Completed</h3>
                      <p>{new Date(order.completed_at).toLocaleString()}</p>
                    </div>
                  )}

                  {order.status === "cancelled" && order.cancelled_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Cancelled</h3>
                      <p>{new Date(order.cancelled_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Notes</h3>
                    <p className="text-gray-300">{order.notes}</p>
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
                {(order.status === "pending" || order.status === "scheduled") && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateOrderStatus("completed")}
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
                      onClick={() => updateOrderStatus("cancelled")}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Cancel Order
                    </Button>
                  </>
                )}

                {order.status === "completed" && (
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => updateOrderStatus("pending")}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Revert to Pending
                  </Button>
                )}

                {order.status === "cancelled" && (
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => updateOrderStatus("pending")}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Revert to Pending
                  </Button>
                )}

                {order.chat_room_id && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    asChild
                  >
                    <Link href={`/admin/chats/${order.chat_room_id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Chat
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/orders">Back to Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
