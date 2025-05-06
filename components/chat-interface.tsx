"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SendIcon, XIcon, CheckIcon } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { sendMessage, markMessagesAsRead, closeChatRoom } from "@/lib/chat-actions"
import type { Database } from "@/lib/database.types"

type ChatMessage = {
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

type ChatRoom = {
  id: string
  order_id: string
  pro_id: string
  customer_id: string
  status: "active" | "closed"
  created_at: string
  updated_at: string
  pro?: {
    username: string | null
    avatar_url: string | null
  }
  customer?: {
    username: string | null
    avatar_url: string | null
  }
}

interface ChatInterfaceProps {
  chatRoom: ChatRoom
  initialMessages: ChatMessage[]
  currentUserId: string
  onClose?: () => void
  isAdmin?: boolean
}

export default function ChatInterface({
  chatRoom,
  initialMessages,
  currentUserId,
  onClose,
  isAdmin = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const isPro = currentUserId === chatRoom.pro_id
  const otherUser = isPro ? chatRoom.customer : chatRoom.pro

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat_room:${chatRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${chatRoom.id}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data } = await supabase
            .from("chat_messages")
            .select(`
              *,
              sender:sender_id(username, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as ChatMessage])

            // Mark message as read if it's not from current user
            if (data.sender_id !== currentUserId) {
              markMessagesAsRead(chatRoom.id, currentUserId)
            }
          }
        },
      )
      .subscribe()

    // Mark all messages as read when opening the chat
    markMessagesAsRead(chatRoom.id, currentUserId)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatRoom.id, currentUserId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    try {
      await sendMessage(chatRoom.id, currentUserId, newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleCloseChatRoom = async () => {
    if (window.confirm("Are you sure you want to close this chat? This cannot be undone.")) {
      await closeChatRoom(chatRoom.id)
      router.refresh()
      if (onClose) onClose()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Group messages by date
  const messagesByDate: { [date: string]: ChatMessage[] } = {}
  messages.forEach((message) => {
    const date = formatDate(message.created_at)
    if (!messagesByDate[date]) {
      messagesByDate[date] = []
    }
    messagesByDate[date].push(message)
  })

  return (
    <Card className="flex flex-col h-full border-gray-800 bg-gray-900/50">
      <CardHeader className="p-4 border-b border-gray-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-800 overflow-hidden">
            {otherUser?.avatar_url ? (
              <Image
                src={otherUser.avatar_url || "/placeholder.svg"}
                alt={otherUser.username || "User"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                {otherUser?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{otherUser?.username || "User"}</div>
            <div className="text-xs text-gray-400">
              Order #{chatRoom.order_id.substring(0, 8)}
              <Badge
                className={`ml-2 ${
                  chatRoom.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {chatRoom.status === "active" ? "Active" : "Closed"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {chatRoom.status === "active" && (isPro || isAdmin) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseChatRoom}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Close Chat
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {Object.entries(messagesByDate).map(([date, dateMessages]) => (
          <div key={date} className="space-y-3">
            <div className="text-center">
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">{date}</span>
            </div>

            {dateMessages.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId

              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                      {message.sender?.avatar_url ? (
                        <Image
                          src={message.sender.avatar_url || "/placeholder.svg"}
                          alt={message.sender.username || "User"}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          {message.sender?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      <div className="text-sm">{message.message}</div>
                      <div className="text-xs mt-1 opacity-70 flex items-center justify-end gap-1">
                        {formatTime(message.created_at)}
                        {isCurrentUser && message.read && <CheckIcon className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-center p-8">
            <div>
              <p>No messages yet.</p>
              <p className="text-sm mt-1">
                {chatRoom.status === "active"
                  ? "Send a message to start the conversation."
                  : "This chat has been closed."}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {chatRoom.status === "active" && (
        <CardFooter className="p-4 border-t border-gray-800">
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow bg-gray-800 border-gray-700"
              disabled={isSending}
            />
            <Button type="submit" disabled={!newMessage.trim() || isSending}>
              <SendIcon className="h-4 w-4 mr-1" />
              Send
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  )
}
