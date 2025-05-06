"use server"

import { createAdminClient } from "./supabase/admin"
import { v4 as uuidv4 } from "uuid"

export type NotificationType = "order_accepted" | "new_message" | "order_completed"

// Check if notifications table exists
async function checkNotificationsTable() {
  const supabase = createAdminClient()

  try {
    // Check if the table exists
    const { data, error } = await supabase.from("notifications").select("id").limit(1)

    if (error && error.code === "42P01") {
      // PostgreSQL code for undefined_table
      console.error("Notifications table doesn't exist. Please create it first.")
      return false
    }

    return true
  } catch (err) {
    console.error("Error checking notifications table:", err)
    return false
  }
}

// Create a new notification
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
}) {
  // Validate user ID
  if (!userId || userId === "00000000-0000-0000-0000-000000000000") {
    console.error("Invalid user ID provided")
    return { error: "Invalid user ID provided. Please use a valid user ID." }
  }

  const supabase = createAdminClient()

  try {
    // Ensure the notifications table exists
    const tableExists = await checkNotificationsTable()
    if (!tableExists) {
      return {
        error: "Notifications table does not exist. Please create it first using the instructions on the test page.",
      }
    }

    // Create notification object
    const notificationData = {
      id: uuidv4(),
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
    }

    console.log("Creating notification:", notificationData)

    // Insert the notification
    const { data: notification, error } = await supabase.from("notifications").insert(notificationData).select()

    if (error) {
      console.error("Error creating notification:", error)
      return { error: error.message || "Failed to create notification" }
    }

    console.log("Notification created successfully:", notification)
    return { notification }
  } catch (err: any) {
    console.error("Unexpected error in createNotification:", err)
    return { error: err.message || "An unexpected error occurred" }
  }
}

// Create an order accepted notification
export async function notifyOrderAccepted({
  userId,
  orderId,
  gameName,
  proName,
}: {
  userId: string
  orderId: string
  gameName: string
  proName: string
}) {
  return createNotification({
    userId,
    type: "order_accepted",
    title: "Order Accepted!",
    message: `Your ${gameName} session with ${proName} has been accepted.`,
    data: { orderId },
  })
}

// Create a new message notification
export async function notifyNewMessage({
  userId,
  senderId,
  senderName,
  chatRoomId,
  messagePreview,
}: {
  userId: string
  senderId: string
  senderName: string
  chatRoomId: string
  messagePreview: string
}) {
  return createNotification({
    userId,
    type: "new_message",
    title: "New Message",
    message: `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? "..." : ""}`,
    data: { senderId, chatRoomId },
  })
}

// Create an order completed notification
export async function notifyOrderCompleted({
  userId,
  orderId,
  gameName,
}: {
  userId: string
  orderId: string
  gameName: string
}) {
  return createNotification({
    userId,
    type: "order_completed",
    title: "Order Completed",
    message: `Your ${gameName} session has been completed. Please leave a review!`,
    data: { orderId },
  })
}
