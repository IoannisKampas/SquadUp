"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createOrder } from "@/lib/order-actions"
import { useCart } from "@/contexts/cart-context"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalGames: number
  totalCost: number
  teammates: Array<{
    id: number | string
    name: string
    game: string
    pricePerGame: number
    count: number
    type?: string
    proName?: string
  }>
}

export function CheckoutModal({ open, onOpenChange, totalGames, totalCost, teammates }: CheckoutModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [discordUsername, setDiscordUsername] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [total, setTotal] = useState(0)
  const [validatedTeammates, setValidatedTeammates] = useState<any[]>([])
  const [createdOrders, setCreatedOrders] = useState<any[]>([])

  // Calculate totals and validate teammates
  useEffect(() => {
    try {
      // Calculate total (no service fee)
      const calculatedTotal = totalCost

      setTotal(calculatedTotal)

      // Validate teammates
      const validated = teammates.map((teammate) => {
        // Ensure all properties have valid values
        return {
          id: teammate.id || `temp-${Math.random().toString(36).substring(7)}`,
          name: teammate.name || "Unknown Game",
          game: teammate.game || "Unknown Game",
          pricePerGame: Number(teammate.pricePerGame) || 0,
          count: Number(teammate.count) || 1,
          type: teammate.type || "quick-match",
          proName: teammate.proName,
        }
      })

      setValidatedTeammates(validated)

      // Log for debugging
      console.log("Checkout modal initialized with:", {
        totalGames,
        totalCost,
        calculatedTotal,
        teammates,
        validated,
      })

      setDebugInfo("Checkout modal initialized successfully")
    } catch (err: any) {
      console.error("Error initializing checkout modal:", err)
      setError(`Error initializing checkout: ${err.message}`)
      setDebugInfo(`Error: ${err.message}`)
    }
  }, [totalGames, totalCost, teammates])

  // Helper function to determine if an order is a quick match
  const isQuickMatchOrder = (teammate: any) => {
    // Check if type is explicitly set to quick-match
    if (teammate.type === "quick-match") return true

    // Check if name contains "Quick Match"
    if (teammate.name && teammate.name.toLowerCase().includes("quick match")) return true

    // Check if proName is missing (quick matches don't have a specific pro)
    if (!teammate.proName && teammate.type !== "pro-teammate") return true

    return false
  }

  const handleCheckout = async () => {
    // Reset states
    setIsProcessing(true)
    setError(null)
    setDebugInfo("Starting checkout process...")
    setCreatedOrders([])

    // Show processing toast
    toast({
      title: "Processing payment...",
      description: "Please wait while we process your payment.",
    })

    try {
      console.log("Starting checkout with teammates:", validatedTeammates)

      // Validate discord username
      if (!discordUsername) {
        setError("Discord username is required")
        setDebugInfo((prev) => prev + "\nError: Discord username is required")
        setIsProcessing(false)
        return
      }

      const orders = []

      // Process each teammate one at a time
      for (let i = 0; i < validatedTeammates.length; i++) {
        const teammate = validatedTeammates[i]
        setDebugInfo(
          (prev) => prev + `\nProcessing teammate ${i + 1} of ${validatedTeammates.length}: ${teammate.name}`,
        )

        try {
          // Determine if this is a quick match order
          const isQuickMatch = isQuickMatchOrder(teammate)
          setDebugInfo((prev) => prev + `\nOrder type: ${isQuickMatch ? "Quick Match" : "Direct Booking"}`)

          // Set proId based on order type
          const proId = isQuickMatch ? null : teammate.id?.toString()

          // Create order data
          const orderData = {
            proId: proId,
            gameId: "", // We'll let the server action handle finding/creating the game
            gameName: teammate.game,
            gameCount: teammate.count,
            amount: teammate.pricePerGame * teammate.count,
            discordUsername: discordUsername,
            notes: notes,
            type: isQuickMatch ? "quick-match" : "direct-booking",
          }

          setDebugInfo((prev) => prev + `\nSending order data: ${JSON.stringify(orderData)}`)

          // Create the order
          const result = await createOrder(orderData)

          if (result.error) {
            throw new Error(result.error)
          }

          // Store the created order
          orders.push(result.order)

          setDebugInfo(
            (prev) => prev + `\nOrder ${i + 1} created successfully with order number: ${result.order.order_number}`,
          )
        } catch (error: any) {
          setDebugInfo((prev) => prev + `\nError creating order for ${teammate.name}: ${error.message}`)
          throw new Error(`Failed to create order for ${teammate.name}: ${error.message}`)
        }
      }

      // All orders created successfully
      setCreatedOrders(orders)
      setDebugInfo((prev) => prev + "\nAll orders created successfully!")

      // Get the order numbers to display in the success message
      const orderNumbers = orders.map((order) => order.order_number).join(", ")

      toast({
        title: "Order confirmed!",
        description: `Your order${orders.length > 1 ? "s" : ""} ${orderNumbers} ${orders.length > 1 ? "have" : "has"} been placed successfully.`,
        variant: "success",
      })

      // Store the created orders in session storage for the success page
      sessionStorage.setItem("createdOrders", JSON.stringify(orders))

      // Clear the cart
      clearCart()

      // Close modal and redirect
      onOpenChange(false)
      router.push("/dashboard/checkout/success")
    } catch (error: any) {
      console.error("Checkout error:", error)
      setError(error.message || "Something went wrong. Please try again.")
      setDebugInfo((prev) => prev + `\nCheckout failed: ${error.message}`)

      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isProcessing) return // Prevent closing while processing
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Booking</DialogTitle>
          <DialogDescription className="text-gray-400">
            You're booking {totalGames} game{totalGames !== 1 ? "s" : ""} with pro teammates.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="font-medium">Your Selected Games</h3>

              <div className="space-y-3">
                {validatedTeammates.map((teammate) => (
                  <div
                    key={teammate.id}
                    className="flex justify-between items-center rounded-lg border border-gray-800 p-3"
                  >
                    <div>
                      <div className="font-medium">{teammate.name}</div>
                      <div className="text-sm text-gray-400">
                        {teammate.game} • {teammate.count} game{teammate.count !== 1 ? "s" : ""}
                        {isQuickMatchOrder(teammate) && " • Quick Match"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${teammate.pricePerGame.toFixed(2)} × {teammate.count}
                      </div>
                      <div className="text-green-500">${(teammate.pricePerGame * teammate.count).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-gray-800 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Total</span>
                  <span className="text-green-500">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord">
                  Discord Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="discord"
                  placeholder="username#0000"
                  className="border-gray-700 bg-gray-800/50"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-400">We'll use this to connect you with your teammate</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Requests (Optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Any specific requirements or goals for your session..."
                  className="w-full min-h-[100px] rounded-md border border-gray-700 bg-gray-800/50 p-3 text-white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup defaultValue="card" className="space-y-3">
                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-3">
                  <RadioGroupItem value="card" id="card" className="border-gray-700" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-3">
                  <RadioGroupItem value="paypal" id="paypal" className="border-gray-700" />
                  <Label htmlFor="paypal" className="cursor-pointer">
                    PayPal
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-gray-800 p-3">
                  <RadioGroupItem value="crypto" id="crypto" className="border-gray-700" />
                  <Label htmlFor="crypto" className="cursor-pointer">
                    Cryptocurrency
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" className="border-gray-700 bg-gray-800/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" className="border-gray-700 bg-gray-800/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" className="border-gray-700 bg-gray-800/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" className="border-gray-700 bg-gray-800/50" />
            </div>
          </TabsContent>
        </Tabs>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug section */}
        <div className="mt-4 p-2 border border-gray-700 rounded-md">
          <p className="text-sm text-gray-400 mb-2">Debug Information:</p>
          <div className="max-h-32 overflow-y-auto bg-gray-800 p-2 rounded text-xs font-mono text-gray-300 whitespace-pre-wrap">
            {debugInfo || "No debug info yet"}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const debugData = validatedTeammates.map((t) => ({
                  name: t.name,
                  type: t.type,
                  isQuickMatch: isQuickMatchOrder(t),
                  id: t.id,
                  pricePerGame: t.pricePerGame,
                  count: t.count,
                }))
                console.log("Teammates with quick match detection:", debugData)
                setDebugInfo(JSON.stringify(debugData, null, 2))
              }}
            >
              Log Teammates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDebugInfo("")
              }}
            >
              Clear Debug
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-gray-700 bg-transparent text-white hover:bg-gray-800"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Processing...
              </>
            ) : (
              `Complete Booking ($${total.toFixed(2)})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
