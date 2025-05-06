import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Calendar, ArrowDownToLine } from "lucide-react"

// Mock earnings data
const earningsData = [
  { id: 1, date: "Apr 30, 2025", orderId: "ORD-004", game: "Valorant", amount: 4 },
  { id: 2, date: "Apr 29, 2025", orderId: "ORD-005", game: "Marvel Rivals", amount: 28 },
  { id: 3, date: "Apr 27, 2025", orderId: "ORD-006", game: "Valorant", amount: 16 },
  { id: 4, date: "Apr 25, 2025", orderId: "ORD-007", game: "Marvel Rivals", amount: 12 },
  { id: 5, date: "Apr 23, 2025", orderId: "ORD-008", game: "Valorant", amount: 8 },
]

export default function ProDashboardEarnings() {
  const totalEarnings = earningsData.reduce((sum, item) => sum + item.amount, 0)
  const availableBalance = totalEarnings - 20 // Assuming $20 has been withdrawn

  return (
    <div className="mt-4 grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gray-900/50 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${availableBalance.toFixed(2)}</div>
            <div className="mt-4">
              <Button className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90 w-full">
                Withdraw Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Earnings Overview</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">This Week</span>
              <span className="font-medium">$48.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">This Month</span>
              <span className="font-medium">$248.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">All Time</span>
              <span className="font-medium">${totalEarnings.toFixed(2)}</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="border-gray-700 bg-transparent text-white hover:bg-gray-800 w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Earnings</CardTitle>
          <Button variant="outline" size="sm" className="border-gray-700 bg-transparent text-white hover:bg-gray-800">
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-800">
            <div className="grid grid-cols-4 border-b border-gray-800 bg-gray-900/50 p-3 text-sm font-medium">
              <div>Date</div>
              <div>Order ID</div>
              <div>Game</div>
              <div className="text-right">Amount</div>
            </div>
            {earningsData.map((item) => (
              <div key={item.id} className="grid grid-cols-4 border-b border-gray-800 p-3 text-sm last:border-0">
                <div className="text-gray-400">{item.date}</div>
                <div>{item.orderId}</div>
                <div>{item.game}</div>
                <div className="text-right font-medium text-green-500">${item.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
