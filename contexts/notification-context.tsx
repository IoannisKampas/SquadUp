"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type NotificationType = "order_accepted" | "new_message" | "order_completed"

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
  createdAt?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClientComponentClient()
  const channelRef = useRef<any>(null)

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    try {
      console.log("Fetching notifications...")
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        console.log("No user session found")
        return
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.session.user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching notifications:", error)
        return
      }

      console.log(`Fetched ${data?.length || 0} notifications`)
      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length || 0)
    } catch (error) {
      console.error("Error in fetchNotifications:", error)
    }
  }

  // Set up real-time subscription for notifications
  const setupRealtimeSubscription = async () => {
    try {
      console.log("Setting up realtime subscription...")
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        console.log("No user session found for subscription")
        return
      }

      // Clean up previous subscription if it exists
      if (channelRef.current) {
        console.log("Removing existing channel")
        await supabase.removeChannel(channelRef.current)
      }

      // Create a new subscription with better error handling
      const channel = supabase
        .channel(`notifications-channel-${Math.random().toString(36).substring(2, 9)}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${session.session.user.id}`,
          },
          (payload) => {
            console.log("New notification received:", payload)

            // Add the new notification to the state
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            // Play notification sound
            try {
              const audio = new Audio("/sounds/notification.mp3")
              audio.volume = 0.5 // Lower volume for better user experience
              audio.play().catch((e) => console.error("Error playing sound:", e))
            } catch (e) {
              console.error("Error with notification sound:", e)
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${session.session.user.id}`,
          },
          (payload) => {
            console.log("Notification updated:", payload)

            // Update the notification in the state
            setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n)))

            // Update unread count if read status changed
            if (!payload.old.read && payload.new.read) {
              setUnreadCount((prev) => Math.max(0, prev - 1))
            }
          },
        )
        .subscribe((status) => {
          console.log("Notification subscription status:", status)
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to notifications")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to notification channel")
            // Try to reconnect after a delay
            setTimeout(() => {
              console.log("Attempting to reconnect notification subscription...")
              setupRealtimeSubscription()
            }, 5000)
          }
        })

      // Store the channel reference for cleanup
      channelRef.current = channel
      console.log("Realtime subscription set up successfully")

      return () => {
        console.log("Cleaning up notification subscription")
        supabase.removeChannel(channel)
      }
    } catch (error) {
      console.error("Error setting up realtime subscription:", error)
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log("Attempting to reconnect after error...")
        setupRealtimeSubscription()
      }, 5000)
    }
  }

  // Initialize notifications and subscription
  useEffect(() => {
    console.log("Notification context initialized")
    fetchNotifications()
    const cleanup = setupRealtimeSubscription()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)
      if (event === "SIGNED_IN") {
        console.log("User signed in, refreshing notifications")
        fetchNotifications()
        setupRealtimeSubscription()
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing notifications")
        setNotifications([])
        setUnreadCount(0)
      }
    })

    return () => {
      cleanup?.then((fn) => fn && fn())
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      console.log("Marking notification as read:", id)
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

      if (error) {
        console.error("Error marking notification as read:", error)
        return
      }

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error in markAsRead:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read")
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) return

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", session.session.user.id)
        .eq("read", false)

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return
      }

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error in markAllAsRead:", error)
    }
  }

  // Refresh notifications
  const refreshNotifications = async () => {
    console.log("Manually refreshing notifications")
    await fetchNotifications()
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
