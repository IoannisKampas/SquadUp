"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SetupOrdersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const setupOrdersSystem = async () => {
    setIsLoading(true)
    setStatus("loading")
    setMessage("Setting up orders system...")

    try {
      const response = await fetch("/api/create-orders-table", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create orders table")
      }

      // Create sample data
      await createSampleData()

      setStatus("success")
      setMessage("Orders system has been set up successfully!")
    } catch (error: any) {
      console.error("Error setting up orders system:", error)
      setStatus("error")
      setMessage(`Error: ${error.message || "Something went wrong"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const createSampleData = async () => {
    const supabase = createClient()

    // Get some players and pros
    const { data: players } = await supabase.from("profiles").select("id").eq("account_type", "player").limit(3)

    const { data: pros } = await supabase.from("profiles").select("id").eq("account_type", "pro").limit(3)

    const { data: games } = await supabase.from("games").select("id").limit(3)

    if (!players?.length || !pros?.length || !games?.length) {
      throw new Error("Could not find players, pros, or games to create sample orders")
    }

    // Create sample orders
    const sampleOrders = [
      {
        customer_id: players[0].id,
        pro_id: pros[0].id,
        game_id: games[0].id,
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "completed",
        amount: 25.99,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      },
      {
        customer_id: players[1].id,
        pro_id: pros[1].id,
        game_id: games[1].id,
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "pending",
        amount: 19.99,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        customer_id: players[2].id,
        pro_id: pros[2].id,
        game_id: games[2].id,
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "cancelled",
        amount: 15.99,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        customer_id: players[0].id,
        pro_id: pros[1].id,
        game_id: games[0].id,
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "completed",
        amount: 29.99,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      },
      {
        customer_id: players[1].id,
        pro_id: pros[0].id,
        game_id: games[1].id,
        order_number: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        status: "pending",
        amount: 22.99,
        created_at: new Date().toISOString(), // today
      },
    ]

    const { error } = await supabase.from("orders").insert(sampleOrders)

    if (error) {
      throw new Error(`Failed to create sample orders: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Setup Orders System</h1>

      <Card className="bg-gray-800 border-gray-700 text-white max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Orders System Setup</CardTitle>
          <CardDescription className="text-gray-400">
            This will create the necessary database tables for the orders system and add some sample data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-900 p-4 border border-gray-700">
              <h3 className="font-medium mb-2">What will be created:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Orders table with necessary fields</li>
                <li>Sample orders with different statuses</li>
                <li>Relationships between customers, pros, and games</li>
              </ul>
            </div>

            {status === "success" && (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-4 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{message}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin">Cancel</Link>
          </Button>
          <Button
            onClick={setupOrdersSystem}
            disabled={isLoading || status === "success"}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : (
              "Setup Orders System"
            )}
          </Button>
        </CardFooter>
      </Card>

      {status === "success" && (
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/admin/orders">Go to Orders Dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
