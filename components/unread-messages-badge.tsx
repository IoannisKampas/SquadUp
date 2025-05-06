"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { getUnreadMessageCount } from "@/lib/chat-actions"
import { useProfile } from "@/contexts/profile-context"

export default function UnreadMessagesBadge({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [supabase, setSupabase] = useState<any>(null)
  const { user } = useProfile()

  // Initialize Supabase client
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Get the actual user ID from context if available
  const actualUserId = user?.id || userId

  // Get initial unread count
  useEffect(() => {
    if (!actualUserId) return

    const fetchUnreadCount = async () => {
      const count = await getUnreadMessageCount(actualUserId)
      setUnreadCount(count)
    }

    fetchUnreadCount()
  }, [actualUserId])

  // Subscribe to new messages
  useEffect(() => {
    if (!supabase || !actualUserId) return

    const channel = supabase
      .channel("unread_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload: any) => {
          // If the message is not from the current user, increment the unread count
          if (payload.new.sender_id !== actualUserId) {
            setUnreadCount((prev) => prev + 1)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `read=eq.true`,
        },
        async () => {
          // Refresh unread count when messages are marked as read
          const count = await getUnreadMessageCount(actualUserId)
          setUnreadCount(count)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [actualUserId, supabase])

  if (unreadCount === 0) {
    return null
  }

  return <Badge className="absolute -right-1 -top-1 bg-red-500 text-white">{unreadCount}</Badge>
}
