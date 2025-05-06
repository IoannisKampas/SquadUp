"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, DollarSign, Users, Calendar } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ProDashboardStats() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    upcomingGames: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        const userId = session.user.id

        // Fetch pending orders count
        const { count: pendingCount, error: pendingError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("pro_id", userId)
          .eq("status", "pending")

        // Fetch confirmed (upcoming) orders count
        const { count: upcomingCount, error: upcomingError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("pro_id", userId)
          .eq("status", "confirmed")

        // Fetch completed orders and calculate earnings
        const { data: completedOrders, error: completedError } = await supabase
          .from("orders")
          .select("total_price")
          .eq("pro_id", userId)
          .eq("status", "completed")

        if (pendingError || upcomingError || completedError) {
          console.error("Error fetching stats:", { pendingError, upcomingError, completedError })
          return
        }

        // Calculate total earnings
        const totalEarnings = completedOrders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0

        setStats({
          pendingOrders: pendingCount || 0,
          upcomingGames: upcomingCount || 0,
          completedOrders: completedOrders?.length || 0,
          totalEarnings,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Pending Orders",
      value: loading ? "..." : stats.pendingOrders,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      color: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      title: "Upcoming Games",
      value: loading ? "..." : stats.upcomingGames,
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Completed Orders",
      value: loading ? "..." : stats.completedOrders,
      icon: <Users className="h-5 w-5 text-green-500" />,
      color: "bg-green-500/10 border-green-500/20",
    },
    {
      title: "Total Earnings",
      value: loading ? "..." : `$${stats.totalEarnings.toFixed(2)}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index} className={`border ${card.color}`}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-400">{card.title}</p>
              <p className="mt-2 text-3xl font-bold">{card.value}</p>
            </div>
            <div className="rounded-full p-2 bg-gray-800">{card.icon}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
