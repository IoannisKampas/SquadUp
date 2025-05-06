"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { updateOrderStatus } from "@/lib/order-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type OrderDetailsProps = {
  order: any // Using any for now, but should be properly typed
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Function to handle order status updates
  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true)
    try {
      const result = await updateOrderStatus(order.id, status)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Order status updated to ${status}`,
        })
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
      case "accepted":
        return <Badge className="bg-blue-500/20 text-blue-400">Accepted</Badge>
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Format price
  const formatPrice = (price: number | string | null | undefined) => {
    const numPrice = Number(price) || 0
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numPrice)
  }

  // Determine if the current user is the pro for this order
  const isPro = order.pro?.id === order.currentUserId

  // Ensure amount is a valid number
  const orderAmount = Number(order.amount) || 0

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gray-900/50 border-gray-800 text-white">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Order #{order.order_number}</span>
                {getStatusBadge(order.status)}
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
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            {order.customer?.username?.charAt(0) || "C"}
                          </div>
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
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            {order.pro?.username?.charAt(0) || "P"}
                          </div>
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
                    <p className="text-xl font-bold">{formatPrice(orderAmount)}</p>
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
          <Card className="bg-gray-900/50 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isPro && order.status === "pending" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate("accepted")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Accept Order
                  </Button>
                )}

                {isPro && (order.status === "pending" || order.status === "accepted") && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Mark as Completed
                  </Button>
                )}

                {isPro && (order.status === "pending" || order.status === "accepted") && (
                  <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancel Order
                  </Button>
                )}

                {order.chat_room_id && (
                  <Button
                    variant="outline"
                    className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    asChild
                  >
                    <Link href={`/dashboard/chats/${order.chat_room_id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Chat
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/orders">Back to Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
