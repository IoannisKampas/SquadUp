"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Calendar, CheckCircle, XCircle, Clock, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type OrderStatus = "all" | "pending" | "in_progress" | "completed" | "cancelled"

interface OrderCountsType {
  all: number
  pending: number
  in_progress: number
  completed: number
  cancelled: number
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all")
  const [totalCount, setTotalCount] = useState<OrderCountsType>({
    all: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  })

  // Use debounced search to prevent excessive filtering
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to fetch via API first with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      try {
        const response = await fetch(`/api/admin/list-orders?status=${statusFilter}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
          setTotalCount(
            data.counts || {
              all: data.orders?.length || 0,
              pending: 0,
              in_progress: 0,
              completed: 0,
              cancelled: 0,
            },
          )
          setIsLoading(false)
          return
        }
      } catch (apiError) {
        console.log("API fetch failed, falling back to client-side")
      }

      // Fall back to client-side fetching
      const supabase = createClient()

      // Fetch orders with the selected status filter
      let query = supabase
        .from("orders")
        .select(
          `
          id, 
          status, 
          created_at,
          player:player_id(username),
          pro:pro_id(username),
          game:game_id(name)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .limit(50) // Limit to 50 orders for better performance

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Could not fetch orders: ${error.message}`)
      }

      setOrders(data || [])

      // Get counts for each status
      const { data: allOrders, error: countError } = await supabase.from("orders").select("status", { count: "exact" })

      if (!countError && allOrders) {
        const counts = {
          all: allOrders.length,
          pending: allOrders.filter((o) => o.status === "pending").length,
          in_progress: allOrders.filter((o) => o.status === "in_progress").length,
          completed: allOrders.filter((o) => o.status === "completed").length,
          cancelled: allOrders.filter((o) => o.status === "cancelled").length,
        }
        setTotalCount(counts)
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Memoize filtered orders to prevent recalculation on every render
  const filteredOrders = useMemo(() => {
    if (!debouncedSearch) return orders

    return orders.filter(
      (order) =>
        (order.player?.username && order.player.username.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (order.pro?.username && order.pro.username.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (order.game?.name && order.game.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
    )
  }, [orders, debouncedSearch])

  // Memoize status badge renderer
  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-600">Completed</Badge>
        )
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-600">Cancelled</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-600">In Progress</Badge>
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-600">Pending</Badge>
        )
    }
  }, [])

  // Memoize status icon renderer
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-500" />
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }, [])

  // Memoize status label renderer
  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-green-500">Completed</span>
      case "cancelled":
        return <span className="text-red-500">Cancelled</span>
      case "in_progress":
        return <span className="text-blue-500">In Progress</span>
      case "pending":
      default:
        return <span className="text-yellow-500">Pending</span>
    }
  }, [])

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <p className="text-gray-400">Manage coaching orders</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              className="pl-10 border-gray-700 bg-gray-800/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "all"
                  ? "All Orders"
                  : statusFilter === "in_progress"
                    ? "In Progress"
                    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={`${statusFilter === "all" ? "bg-gray-700" : ""} focus:bg-gray-700`}
                  onClick={() => setStatusFilter("all")}
                >
                  All Orders
                  <Badge className="ml-auto bg-gray-700">{totalCount.all}</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${statusFilter === "pending" ? "bg-gray-700" : ""} focus:bg-gray-700`}
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                  <Badge className="ml-auto bg-yellow-500/20 text-yellow-500 border-yellow-600">
                    {totalCount.pending}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${statusFilter === "in_progress" ? "bg-gray-700" : ""} focus:bg-gray-700`}
                  onClick={() => setStatusFilter("in_progress")}
                >
                  In Progress
                  <Badge className="ml-auto bg-blue-500/20 text-blue-500 border-blue-600">
                    {totalCount.in_progress}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${statusFilter === "completed" ? "bg-gray-700" : ""} focus:bg-gray-700`}
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                  <Badge className="ml-auto bg-green-500/20 text-green-500 border-green-600">
                    {totalCount.completed}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`${statusFilter === "cancelled" ? "bg-gray-700" : ""} focus:bg-gray-700`}
                  onClick={() => setStatusFilter("cancelled")}
                >
                  Cancelled
                  <Badge className="ml-auto bg-red-500/20 text-red-500 border-red-600">{totalCount.cancelled}</Badge>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="border-gray-700 bg-transparent" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-700 text-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error loading orders</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-500 text-red-400 hover:bg-red-950"
                  onClick={fetchOrders}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">All Orders</p>
              <p className="text-2xl font-bold">{totalCount.all}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{totalCount.pending}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-blue-500">{totalCount.in_progress}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-500">{totalCount.completed}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>
            {statusFilter === "all"
              ? "All Orders"
              : statusFilter === "in_progress"
                ? "In Progress Orders"
                : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found</p>
              {statusFilter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-gray-700"
                  onClick={() => setStatusFilter("all")}
                >
                  View All Orders
                </Button>
              )}
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
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Created</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-3 px-4">{order.game?.name || "Unknown Game"}</td>
                      <td className="py-3 px-4">{order.player?.username || "Unknown Player"}</td>
                      <td className="py-3 px-4">{order.pro?.username || "Unknown Pro"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </td>
                      <td className="py-3 px-4">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 bg-transparent text-white hover:bg-gray-700"
                          asChild
                        >
                          <Link href={`/admin/orders/${order.id}`}>View Details</Link>
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
