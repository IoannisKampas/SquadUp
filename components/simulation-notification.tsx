"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export function SimulationNotification() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [notificationData, setNotificationData] = useState({
    userId: "",
    type: "new_order",
    title: "New Order",
    message: "You have received a new order",
  })

  const handleCreateNotification = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Notification created successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/simulation/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: "Test Customer",
          customer_email: "test@example.com",
          product_name: "Test Product",
          quantity: 1,
          shipping_address: "123 Test St",
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Order created successfully: ${data.order.order_number}`,
        })
        setOrderNumber(data.order.order_number)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async () => {
    if (!orderNumber) {
      toast({
        title: "Error",
        description: "Please enter an order number",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/simulation/accept-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Order ${orderNumber} accepted successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Notification Simulation</CardTitle>
        <CardDescription>Test the notification system with simulated events</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notification">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notification">Notification</TabsTrigger>
            <TabsTrigger value="order">Create Order</TabsTrigger>
            <TabsTrigger value="accept">Accept Order</TabsTrigger>
          </TabsList>
          <TabsContent value="notification" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={notificationData.userId}
                onChange={(e) => setNotificationData({ ...notificationData, userId: e.target.value })}
                placeholder="Enter user ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={notificationData.type}
                onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value })}
                placeholder="Notification type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={notificationData.title}
                onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                placeholder="Notification title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={notificationData.message}
                onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                placeholder="Notification message"
              />
            </div>
          </TabsContent>
          <TabsContent value="order" className="space-y-4">
            <p className="text-sm text-gray-500">
              This will create a test order and send a notification to a pro user.
            </p>
          </TabsContent>
          <TabsContent value="accept" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={loading}>
          Cancel
        </Button>
        <Tabs.Root defaultValue="notification">
          <Tabs.Content value="notification">
            <Button onClick={handleCreateNotification} disabled={loading}>
              {loading ? "Creating..." : "Create Notification"}
            </Button>
          </Tabs.Content>
          <Tabs.Content value="order">
            <Button onClick={handleCreateOrder} disabled={loading}>
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </Tabs.Content>
          <Tabs.Content value="accept">
            <Button onClick={handleAcceptOrder} disabled={loading}>
              {loading ? "Accepting..." : "Accept Order"}
            </Button>
          </Tabs.Content>
        </Tabs.Root>
      </CardFooter>
    </Card>
  )
}
