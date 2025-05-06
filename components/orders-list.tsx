"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, CheckCircle, XCircle, GamepadIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Order = {
  id: string
  order_number: string
  status: string
  amount: number | string
  created_at: string
  completed_at?: string
  cancelled_at?: string
  customer?: {
    username?: string
    avatar_url?: string
  }
  pro?: {
    username?: string
    avatar_url?: string
  }
  game?: {
    name?: string
    image_url?: string
  }
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  const [activeTab, setActiveTab] = useState("all")

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return order.status === "pending"
    if (activeTab === "accepted") return order.status === "accepted"
    if (activeTab === "completed") return order.status === "completed"
    if (activeTab === "cancelled") return order.status === "cancelled"
    return true
  })

  // Get counts for each status
  const counts = {
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    accepted: orders.filter((order) => order.status === "accepted").length,
    completed: orders.filter((order) => order.status === "completed").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
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

  // Function to render status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "accepted":
        return <Clock className="h-4 w-4 text-blue-400" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Format price
  const formatPrice = (price: number | string | null | undefined) => {
    const numPrice = Number(price) || 0
    return numPrice.toFixed(2)
  }

  return (
    <div>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="all">
            All
            <Badge variant="outline" className="ml-2">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="outline" className="ml-2">
              {counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            <Badge variant="outline" className="ml-2">
              {counts.accepted}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="outline" className="ml-2">
              {counts.completed}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            <Badge variant="outline" className="ml-2">
              {counts.cancelled}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="bg-gray-900/50 border-gray-800 text-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">Order #{order.order_number}</h3>
                              {getStatusBadge(order.status)}
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
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-400">Amount</div>
                            <div className="text-xl font-bold text-green-500">${formatPrice(order.amount)}</div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-800 overflow-hidden">
                            {order.pro?.avatar_url ? (
                              <Image
                                src={order.pro.avatar_url || "/placeholder.svg"}
                                width={32}
                                height={32}
                                alt="Pro avatar"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                {order.pro?.username?.charAt(0) || "P"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{order.pro?.username || "Unknown Pro"}</div>
                            <div className="text-sm text-gray-400">Pro Teammate</div>
                          </div>
                        </div>

                        {order.status === "completed" && order.completed_at && (
                          <div className="mt-4 text-sm text-gray-400">
                            Completed on {new Date(order.completed_at).toLocaleDateString()}
                          </div>
                        )}

                        {order.status === "cancelled" && order.cancelled_at && (
                          <div className="mt-4 text-sm text-gray-400">
                            Cancelled on {new Date(order.cancelled_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex md:flex-col justify-end border-t md:border-t-0 md:border-l border-gray-800 bg-gray-900/30">
                        <Button
                          asChild
                          className="flex-1 rounded-none bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
                        >
                          <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
