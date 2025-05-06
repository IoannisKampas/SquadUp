"use client"

import { useState } from "react"
import { useNotifications } from "@/contexts/notification-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, MessageSquare, Package, CheckCircle, Trash2, Check } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function NotificationList() {
  const { notifications, markAsRead, loading } = useNotifications()
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_accepted":
        return <Package className="h-5 w-5 text-green-500" />
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "order_completed":
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const deleteNotification = async (id: string) => {
    setDeletingIds((prev) => [...prev, id])

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id)

      if (error) {
        console.error("Error deleting notification:", error)
        toast({
          title: "Error",
          description: "Failed to delete notification",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (error) {
      console.error("Error in deleteNotification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    } finally {
      setDeletingIds((prev) => prev.filter((item) => item !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No notifications</h3>
        <p className="text-gray-500">
          You don't have any notifications yet. They'll appear here when you receive them.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`p-4 ${!notification.read ? "bg-gray-50 dark:bg-gray-900" : ""}`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)} className="h-8">
                      <Check className="h-4 w-4 mr-1" />
                      Mark as read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    disabled={deletingIds.includes(notification.id)}
                    className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {deletingIds.includes(notification.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
