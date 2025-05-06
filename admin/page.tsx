"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  // const [stats, setStats] = useState({
  //   totalUsers: 0,
  //   players: 0,
  //   pros: 0,
  //   admins: 0,
  //   headAdmins: 0,
  //   pendingApplications: 0,
  //   totalGames: 0,
  //   totalOrders: 0,
  //   pendingOrders: 0,
  //   completedOrders: 0,
  //   totalReviews: 0,
  // })
  // const [loading, setLoading] = useState(true)
  // const [recentUsers, setRecentUsers] = useState<any[]>([])
  // const [recentOrders, setRecentOrders] = useState<any[]>([])

  // useEffect(() => {
  //   async function fetchDashboardData() {
  //     try {
  //       const supabase = createClient()

  //       // Fetch basic stats
  //       const [
  //         { count: totalUsers },
  //         { count: players },
  //         { count: pros },
  //         { count: admins },
  //         { count: headAdmins },
  //         { count: pendingApplications },
  //         { count: totalGames },
  //         { count: totalOrders },
  //         { count: pendingOrders },
  //         { count: completedOrders },
  //         { count: totalReviews },
  //       ] = await Promise.all([
  //         supabase.from("profiles").select("*", { count: "exact", head: true }),
  //         supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_type", "player"),
  //         supabase
  //           .from("profiles")
  //           .select("*", { count: "exact", head: true })
  //           .eq("account_type", "pro")
  //           .eq("application_status", "approved"),
  //         supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_type", "admin"),
  //         supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_type", "head_admin"),
  //         supabase
  //           .from("profiles")
  //           .select("*", { count: "exact", head: true })
  //           .eq("account_type", "pro")
  //           .eq("application_status", "pending"),
  //         supabase.from("games").select("*", { count: "exact", head: true }),
  //         supabase.from("orders").select("*", { count: "exact", head: true }),
  //         supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
  //         supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
  //         supabase.from("reviews").select("*", { count: "exact", head: true }),
  //       ])

  //       setStats({
  //         totalUsers: totalUsers || 0,
  //         players: players || 0,
  //         pros: pros || 0,
  //         admins: admins || 0,
  //         headAdmins: headAdmins || 0,
  //         pendingApplications: pendingApplications || 0,
  //         totalGames: totalGames || 0,
  //         totalOrders: totalOrders || 0,
  //         pendingOrders: pendingOrders || 0,
  //         completedOrders: completedOrders || 0,
  //         totalReviews: totalReviews || 0,
  //       })

  //       // Fetch recent users
  //       const { data: recentUsersData } = await supabase
  //         .from("profiles")
  //         .select("*")
  //         .order("created_at", { ascending: false })
  //         .limit(5)

  //       if (recentUsersData) {
  //         setRecentUsers(recentUsersData)
  //       }

  //       // Fetch recent orders
  //       const { data: recentOrdersData } = await supabase
  //         .from("orders")
  //         .select(`
  //           *,
  //           player:player_id(username),
  //           pro:pro_id(username),
  //           game:game_id(name)
  //         `)
  //         .order("created_at", { ascending: false })
  //         .limit(5)

  //       if (recentOrdersData) {
  //         setRecentOrders(recentOrdersData)
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchDashboardData()
  // }, [])

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
  //     </div>
  //   )
  // }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Button className="w-full h-24 text-lg">Manage Users</Button>
        </Link>

        <Link href="/admin/games">
          <Button className="w-full h-24 text-lg">Manage Games</Button>
        </Link>

        <Link href="/admin/orders">
          <Button className="w-full h-24 text-lg">Manage Orders</Button>
        </Link>

        <Link href="/admin/sessions">
          <Button className="w-full h-24 text-lg">Manage Sessions</Button>
        </Link>

        <Link href="/admin/reviews">
          <Button className="w-full h-24 text-lg">Manage Reviews</Button>
        </Link>

        <Link href="/simulation/order-flow">
          <Button className="w-full h-24 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Order Flow Simulation
          </Button>
        </Link>
      </div>
    </div>
  )
}
