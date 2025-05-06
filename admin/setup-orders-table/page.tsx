"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SetupOrdersTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  async function setupOrdersTable() {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-orders-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up orders table")
      }

      setResult({
        success: true,
        message: data.message || "Orders table set up successfully",
      })
    } catch (error: any) {
      console.error("Error setting up orders table:", error)
      setResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Up Orders Table</CardTitle>
          <CardDescription>Create or update the orders table with all required columns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">
            This will create the orders table if it doesn't exist, or add any missing columns if it does. The table will
            have the following structure:
          </p>

          <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-64 mb-4">
            <pre className="text-xs">
              {`
id (UUID, primary key)
order_number (TEXT)
customer_id (UUID)
pro_id (UUID)
game_id (UUID)
type (TEXT) - for order type like "quick-match" or "direct-booking"
status (TEXT)
game_count (INTEGER)
price_per_game (NUMERIC)
total_price (NUMERIC)
amount (NUMERIC) - for backward compatibility
scheduled_at (TIMESTAMP WITH TIME ZONE)
completed_at (TIMESTAMP WITH TIME ZONE)
cancelled_at (TIMESTAMP WITH TIME ZONE)
notes (TEXT)
created_at (TIMESTAMP WITH TIME ZONE)
updated_at (TIMESTAMP WITH TIME ZONE)
payment_id (UUID)
              `}
            </pre>
          </div>

          {result && (
            <div
              className={`mb-4 p-4 rounded-md flex items-start gap-3 ${
                result.success
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
                <p className="text-sm mt-1">{result.success ? result.message : result.error}</p>
                {result.success && (
                  <div className="mt-2">
                    <Link href="/admin/orders" className="text-green-600 hover:text-green-800 underline text-sm">
                      Go to Orders Admin
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Admin</Link>
          </Button>
          <Button onClick={setupOrdersTable} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              "Set Up Orders Table"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
