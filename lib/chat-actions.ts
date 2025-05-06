"use server"

import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function createChatRoom(orderId: string, proId: string, customerId: string) {
  try {
    const supabase = createClient()

    // Check if a chat room already exists for this order
    const { data: existingRoom, error: checkError } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("order_id", orderId)
      .single()

    if (!checkError && existingRoom) {
      console.log("Chat room already exists for order:", orderId)
      return { id: existingRoom.id }
    }

    // Create a new chat room
    const chatRoomId = uuidv4()
    const { error } = await supabase.from("chat_rooms").insert({
      id: chatRoomId,
      order_id: orderId,
      pro_id: proId,
      customer_id: customerId,
      status: "active",
    })

    if (error) {
      console.error("Error creating chat room:", error)
      return { error: error.message || "Failed to create chat room" }
    }

    // Create a welcome message
    const welcomeMessageId = uuidv4()
    const { error: messageError } = await supabase.from("chat_messages").insert({
      id: welcomeMessageId,
      chat_room_id: chatRoomId,
      sender_id: proId, // System message sent as the pro
      message: "Welcome to your order chat! You can use this chat to communicate about your order.",
      read: false,
    })

    if (messageError) {
      console.error("Error creating welcome message:", messageError)
      // Don't fail the chat room creation if the welcome message fails
    }

    return { id: chatRoomId }
  } catch (error: any) {
    console.error("Error in createChatRoom:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function closeChatRoom(chatRoomId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("chat_rooms").update({ status: "closed" }).eq("id", chatRoomId)

    if (error) {
      console.error("Error closing chat room:", error)
      return { error: error.message || "Failed to close chat room" }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in closeChatRoom:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function sendMessage(chatRoomId: string, message: string) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      return { error: "You must be logged in to send a message" }
    }

    // Check if the user is part of this chat room
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .select("pro_id, customer_id")
      .eq("id", chatRoomId)
      .single()

    if (chatRoomError) {
      console.error("Error getting chat room:", chatRoomError)
      return { error: "Chat room not found" }
    }

    if (chatRoom.pro_id !== user.id && chatRoom.customer_id !== user.id) {
      return { error: "You are not authorized to send messages in this chat room" }
    }

    // Create the message
    const messageId = uuidv4()
    const { error: messageError } = await supabase.from("chat_messages").insert({
      id: messageId,
      chat_room_id: chatRoomId,
      sender_id: user.id,
      message,
      read: false,
    })

    if (messageError) {
      console.error("Error sending message:", messageError)
      return { error: messageError.message || "Failed to send message" }
    }

    // Update the chat room's updated_at timestamp
    await supabase
      .from("chat_rooms")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatRoomId)
      .then(({ error }) => {
        if (error) {
          console.warn("Warning: Could not update chat room timestamp:", error)
          // Don't fail the message send if this update fails
        }
      })

    return { success: true, messageId }
  } catch (error: any) {
    console.error("Error in sendMessage:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function markMessagesAsRead(chatRoomId: string) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      return { error: "You must be logged in to mark messages as read" }
    }

    // Check if the user is part of this chat room
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .select("pro_id, customer_id")
      .eq("id", chatRoomId)
      .single()

    if (chatRoomError) {
      console.error("Error getting chat room:", chatRoomError)
      return { error: "Chat room not found" }
    }

    if (chatRoom.pro_id !== user.id && chatRoom.customer_id !== user.id) {
      return { error: "You are not authorized to mark messages as read in this chat room" }
    }

    // Mark all messages from the other user as read
    const senderId = chatRoom.pro_id === user.id ? chatRoom.customer_id : chatRoom.pro_id
    const { error: updateError } = await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("chat_room_id", chatRoomId)
      .eq("sender_id", senderId)
      .eq("read", false)

    if (updateError) {
      console.error("Error marking messages as read:", updateError)
      return { error: updateError.message || "Failed to mark messages as read" }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in markMessagesAsRead:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function getChatRoomForOrder(orderId: string) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      return { error: "You must be logged in to access chat rooms" }
    }

    // Get the chat room for this order
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (chatRoomError) {
      if (chatRoomError.code === "PGRST116") {
        // No chat room found
        return { chatRoom: null }
      }
      console.error("Error getting chat room:", chatRoomError)
      return { error: chatRoomError.message || "Failed to get chat room" }
    }

    // Check if the user is part of this chat room
    if (chatRoom.pro_id !== user.id && chatRoom.customer_id !== user.id) {
      return { error: "You are not authorized to access this chat room" }
    }

    return { chatRoom }
  } catch (error: any) {
    console.error("Error in getChatRoomForOrder:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
