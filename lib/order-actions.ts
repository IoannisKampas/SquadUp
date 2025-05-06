"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

interface OrderData {
  proId: string | null
  gameId?: string
  gameName: string
  gameCount: number
  amount: number
  discordUsername: string
  notes?: string
  type?: string
  price_per_game?: number
}

export async function createOrder(data: OrderData) {
  console.log("createOrder called with data:", JSON.stringify(data, null, 2))

  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log("Current user:", user?.id)

  if (userError || !user) {
    console.error("Error getting user:", userError)
    return { error: "You must be logged in to create an order" }
  }

  try {
    // Find the game by name if gameId is not provided
    let gameId = data.gameId
    if (!gameId && data.gameName) {
      console.log(`Looking up game by name: "${data.gameName}"`)
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("id")
        .ilike("name", data.gameName)
        .limit(1)
        .single()

      if (gameError) {
        console.error("Error finding game:", gameError)
        // If game not found, create a new one
        const newGameId = uuidv4()
        console.log(`Creating new game with ID: ${newGameId}, name: ${data.gameName}`)
        const { error: createGameError } = await supabase.from("games").insert({
          id: newGameId,
          name: data.gameName,
          slug: data.gameName.toLowerCase().replace(/\s+/g, "-"),
        })

        if (createGameError) {
          console.error("Error creating game:", createGameError)
          return { error: "Failed to create game" }
        }

        gameId = newGameId
      } else {
        console.log(`Found existing game with ID: ${gameData.id}`)
        gameId = gameData.id
      }
    }

    // Generate a unique order number with a consistent format
    // Format: ORD-XXXXXX where X is a random digit
    const orderNumber = `ORD-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`

    console.log(`Generated order number: ${orderNumber}`)

    // Determine the order type
    const orderType = data.type || (data.proId ? "direct-booking" : "quick-match")
    console.log(`Order type determined as: ${orderType}`)

    // Ensure numeric values are valid
    const gameCount = Number(data.gameCount) || 1
    const amount = Number(data.amount) || 0
    const pricePerGame = Number(data.price_per_game) || amount / gameCount || 0

    // Create the order object
    const orderObject = {
      id: uuidv4(),
      order_number: orderNumber,
      customer_id: user.id,
      game_id: gameId,
      status: "pending",
      amount: amount,
      price_per_game: pricePerGame,
      total_price: amount,
      game_count: gameCount,
      discord_username: data.discordUsername,
      notes: data.notes || "",
      type: orderType,
      pro_id: data.proId || null, // Explicitly set to null if not provided
    }

    console.log("Final order object to insert:", JSON.stringify(orderObject, null, 2))

    // Create the order
    console.log("Sending insert request to Supabase...")
    const { data: order, error: orderError } = await supabase.from("orders").insert(orderObject).select()

    console.log("Supabase response:", {
      data: order ? "Order data received" : "No data returned",
      error: orderError ? orderError.message : "No error",
    })

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { error: `Failed to create order: ${orderError.message}` }
    }

    if (!order || order.length === 0) {
      console.error("Order created but no data returned")
      return { error: "Order created but no data returned" }
    }

    console.log("Order created successfully:", order[0].id)
    console.log("Order number in database:", order[0].order_number)

    // Create a notification for the pro (only if pro_id is not null)
    if (data.proId) {
      try {
        await supabase.from("notifications").insert({
          id: uuidv4(),
          user_id: data.proId,
          type: "new_order",
          title: "New Order Received",
          message: `You have received a new order: ${orderNumber}`,
          data: { order_id: order[0].id, order_number: orderNumber },
          read: false,
        })
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError)
        // Don't fail the order if notification creation fails
      }
    }

    // Create a notification for all pros if this is a quick match order
    if (orderType === "quick-match") {
      try {
        // Get all pro users
        const { data: pros, error: prosError } = await supabase.from("profiles").select("id").eq("account_type", "pro")

        if (!prosError && pros) {
          // Create a notification for each pro
          const notifications = pros.map((pro) => ({
            id: uuidv4(),
            user_id: pro.id,
            type: "new_quick_match",
            title: "New Quick Match Available",
            message: `A new quick match order is available: ${orderNumber}`,
            data: { order_id: order[0].id, order_number: orderNumber },
            read: false,
            created_at: new Date().toISOString(),
          }))

          if (notifications.length > 0) {
            await supabase.from("notifications").insert(notifications)
          }
        }
      } catch (notificationError) {
        console.error("Error creating quick match notifications:", notificationError)
        // Don't fail the order if notification creation fails
      }
    }

    // Create a notification for the customer
    try {
      await supabase.from("notifications").insert({
        id: uuidv4(),
        user_id: user.id,
        type: "order_created",
        title: "Order Created",
        message: `Your order ${orderNumber} has been created successfully.`,
        data: { order_id: order[0].id, order_number: orderNumber },
        read: false,
      })
    } catch (notificationError) {
      console.error("Error creating customer notification:", notificationError)
      // Don't fail the order if notification creation fails
    }

    return { success: true, order: order[0] }
  } catch (error: any) {
    console.error("Error in createOrder:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function getUserOrders() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error getting user:", userError)
    redirect("/auth/sign-in")
  }

  // Get the user's profile to determine their account type
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Error getting profile:", profileError)
    return { error: "Failed to get user profile" }
  }

  let query = supabase.from("orders").select(`
    *,
    customer:customer_id(id, username, avatar_url),
    pro:pro_id(id, username, avatar_url),
    game:game_id(id, name, image_url)
  `)

  // Filter orders based on account type
  if (profile.account_type === "customer") {
    query = query.eq("customer_id", user.id)
  } else if (profile.account_type === "pro") {
    query = query.eq("pro_id", user.id)
  } else {
    // For admins, return all orders
  }

  // Order by created_at, newest first
  query = query.order("created_at", { ascending: false })

  const { data: orders, error: ordersError } = await query

  if (ordersError) {
    console.error("Error getting orders:", ordersError)
    return { error: "Failed to get orders" }
  }

  return { orders }
}

export async function getOrderById(orderId: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error getting user:", userError)
    return { error: "You must be logged in to view an order" }
  }

  // Get the order with related data
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customer_id(id, username, avatar_url, email),
      pro:pro_id(id, username, avatar_url, email),
      game:game_id(id, name, image_url)
    `)
    .eq("id", orderId)
    .single()

  if (orderError) {
    console.error("Error getting order:", orderError)
    return { error: "Failed to get order" }
  }

  // Add the current user ID to the order object for permission checks
  order.currentUserId = user.id

  return { order }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error getting user:", userError)
    return { error: "You must be logged in to update an order" }
  }

  // Get the order to check permissions
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("customer_id, pro_id, order_number")
    .eq("id", orderId)
    .single()

  if (orderError) {
    console.error("Error getting order:", orderError)
    return { error: "Failed to get order" }
  }

  // Check if the user has permission to update this order
  if (order.pro_id !== user.id) {
    // Get the user's profile to check if they're an admin
    const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single()

    if (!profile || profile.account_type !== "admin") {
      return { error: "You don't have permission to update this order" }
    }
  }

  // Update the order status
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  // Add timestamp for completed or cancelled orders
  if (status === "completed") {
    updates.completed_at = new Date().toISOString()
  } else if (status === "cancelled") {
    updates.cancelled_at = new Date().toISOString()
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .single()

  if (updateError) {
    console.error("Error updating order:", updateError)
    return { error: "Failed to update order status" }
  }

  // Create a notification for the customer
  if (status === "accepted" || status === "completed" || status === "cancelled") {
    const notificationType =
      status === "accepted" ? "order_accepted" : status === "completed" ? "order_completed" : "order_cancelled"

    const notificationTitle =
      status === "accepted" ? "Order Accepted" : status === "completed" ? "Order Completed" : "Order Cancelled"

    const notificationMessage =
      status === "accepted"
        ? "Your order has been accepted by the pro"
        : status === "completed"
          ? "Your order has been marked as completed"
          : "Your order has been cancelled"

    try {
      await supabase.from("notifications").insert({
        id: uuidv4(),
        user_id: order.customer_id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        data: { order_id: orderId, order_number: order.order_number },
        read: false,
      })
    } catch (error) {
      console.error("Error creating notification:", error)
      // Don't fail the request if notification creation fails
    }
  }

  return { order: updatedOrder }
}
