"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, LogOut, Settings, User, MessageSquare } from "lucide-react"
import { getUnreadMessageCount } from "@/lib/chat-actions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ProDashboardHeader() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Get current user and unread message count
  useEffect(() => {
    const fetchUserAndUnreadCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        const count = await getUnreadMessageCount(user.id)
        setUnreadCount(count)
      }
    }

    fetchUserAndUnreadCount()
  }, [supabase])

  // Subscribe to new messages
  useEffect(() => {
    if (!userId) return

    const subscription = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as any

          // If the message is not from the current user, increment unread count
          if (newMessage.sender_id !== userId) {
            setUnreadCount((prev) => prev + 1)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, supabase])

  // Reset unread count when user views messages
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        window.location.pathname.includes("/pro-dashboard") &&
        window.location.hash === "#chats"
      ) {
        setUnreadCount(0)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 opacity-80 blur-sm"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-black text-xl font-bold">
              S
            </div>
          </div>
          <div className="text-xl font-bold">
            Squad<span className="text-green-500">Up</span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>

          <Link href="/pro-dashboard#chats">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>My Account</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem className="hover:bg-gray-700">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700 text-red-400 hover:text-red-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
