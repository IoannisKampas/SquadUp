"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { markMessagesAsRead, sendMessage, getChatMessages, getChatMessageCount } from "@/lib/chat-actions"
import { useToast } from "@/components/ui/use-toast"
import { Send, Loader2, Bell, BellOff, RefreshCw, Archive, ChevronUp } from "lucide-react"
import { playNotificationSound, requestNotificationPermission, showNotification } from "@/lib/notification-utils"

type Message = {
  id: string
  sender_id: string
  message: string
  created_at: string
  read: boolean
  sender?: {
    username: string | null
    avatar_url: string | null
  }
}

export default function OrderChat({
  chatRoomId,
  currentUserId,
  userType = "customer",
}: {
  chatRoomId: string
  currentUserId: string
  userType?: "customer" | "pro"
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsPermission, setNotificationsPermission] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [totalMessageCount, setTotalMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [supabase, setSupabase] = useState<any>(null)
  const isVisibleRef = useRef(true)
  const isActiveTabRef = useRef(true)
  const pageSize = 50

  // Initialize Supabase client
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Check notification permission
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await requestNotificationPermission()
      setNotificationsPermission(hasPermission)
    }

    checkPermission()
  }, [])

  // Track visibility and focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible"
    }

    const handleFocus = () => {
      isActiveTabRef.current = true
    }

    const handleBlur = () => {
      isActiveTabRef.current = false
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    }
  }, [])

  // Get total message count
  useEffect(() => {
    if (!chatRoomId) return

    const getMessageCount = async () => {
      const count = await getChatMessageCount(chatRoomId, true)
      setTotalMessageCount(count)
      setHasMoreMessages(count > pageSize)
    }

    getMessageCount()
  }, [chatRoomId])

  // Fetch messages using server action
  const fetchMessages = async (resetPage = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentPage = resetPage ? 1 : page

      // Use server action to get messages with pagination
      const messagesData = await getChatMessages(chatRoomId, {
        page: currentPage,
        pageSize,
        includeArchived,
      })

      if (messagesData) {
        if (resetPage || currentPage === 1) {
          setMessages(messagesData)
        } else {
          // Prepend older messages
          setMessages((prev) => [...messagesData, ...prev])
        }
      }

      // Update pagination state
      if (resetPage) {
        setPage(1)
      }

      // Check if there are more messages to load
      setHasMoreMessages(currentPage * pageSize < totalMessageCount)

      // Mark messages as read
      await markMessagesAsRead(chatRoomId, currentUserId)
    } catch (err: any) {
      console.error("Error fetching messages:", err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (!chatRoomId) return
    fetchMessages(true)
  }, [chatRoomId, currentUserId, includeArchived])

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!supabase || !chatRoomId) return

    console.log("Setting up real-time subscription for chat room:", chatRoomId)

    const channel = supabase
      .channel(`chat_messages_${chatRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload: any) => {
          console.log("Received new message:", payload)
          // Refresh messages when a new one arrives
          fetchMessages(true)

          const newMsg = payload.new

          // Play sound notification if enabled and message is from other user
          if (soundEnabled && newMsg.sender_id !== currentUserId) {
            playNotificationSound()
          }

          // Show browser notification if permission granted and tab not visible/active
          if (notificationsPermission && (!isVisibleRef.current || !isActiveTabRef.current)) {
            showNotification(`New message`, {
              body: newMsg.message,
              icon: "/placeholder-icon.png",
            })
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      console.log("Cleaning up subscription")
      supabase.removeChannel(channel)
    }
  }, [chatRoomId, currentUserId, supabase, soundEnabled, notificationsPermission])

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only auto-scroll when new messages are added at the end (not when loading older messages)
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, page])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatRoomId) return

    try {
      setSending(true)

      // Use the server action instead of direct database insertion
      const result = await sendMessage({
        chatRoomId,
        senderId: currentUserId,
        message: newMessage.trim(),
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setNewMessage("")

      // Manually refresh messages after sending
      await fetchMessages(true)
    } catch (err: any) {
      console.error("Error sending message:", err)
      toast({
        title: "Error",
        description: `Failed to send message: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast({
      title: soundEnabled ? "Sound notifications disabled" : "Sound notifications enabled",
      duration: 2000,
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchMessages(true)
  }

  const loadMoreMessages = async () => {
    if (hasMoreMessages) {
      setPage((prev) => prev + 1)
      await fetchMessages(false)
    }
  }

  const toggleArchived = () => {
    setIncludeArchived((prev) => !prev)
    toast({
      title: includeArchived ? "Showing recent messages only" : "Including archived messages",
      duration: 2000,
    })
  }

  if (loading && !refreshing && page === 1) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-medium">{userType === "customer" ? "Chat with Pro" : "Chat with Customer"}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleArchived}
            title={includeArchived ? "Hide archived messages" : "Show archived messages"}
          >
            <Archive className={`h-4 w-4 ${includeArchived ? "text-green-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing} title="Refresh messages">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            title={soundEnabled ? "Disable sound notifications" : "Enable sound notifications"}
          >
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Load more button */}
      {hasMoreMessages && (
        <div className="flex justify-center p-2 border-b border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMoreMessages}
            disabled={loading}
            className="text-xs flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronUp className="h-3 w-3" />}
            Load older messages
          </Button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No messages yet</p>
            <p className="text-gray-500 text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.sender_id === currentUserId
            const isSystemMessage = msg.sender_id === "system"
            const isArchived = "archived" in msg && msg.archived === true

            return (
              <div
                key={msg.id}
                className={`flex ${isSystemMessage ? "justify-center" : isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`${isSystemMessage ? "max-w-[90%] bg-gray-700" : "max-w-[70%]"} rounded-lg px-4 py-2 ${
                    isSystemMessage
                      ? "bg-gray-700 text-gray-300 italic"
                      : isCurrentUser
                        ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black"
                        : "bg-gray-800 text-white"
                  } ${isArchived ? "opacity-70" : ""}`}
                >
                  {!isSystemMessage && (
                    <div className="text-xs opacity-70 mb-1">
                      {isCurrentUser ? "You" : msg.sender?.username || "User"}
                    </div>
                  )}
                  <p className="break-words">{msg.message}</p>
                  {!isSystemMessage && (
                    <div className="text-xs opacity-70 text-right mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isCurrentUser && <span className="ml-1">{msg.read ? "✓✓" : "✓"}</span>}
                      {isArchived && <span className="ml-1">(archived)</span>}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none bg-gray-800 border-gray-700"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
