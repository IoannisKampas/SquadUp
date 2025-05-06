"use server"

import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getAllOrders(options: {
  status?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}) {
  const { status, limit = 10, offset = 0, sortBy = "created_at", sortOrder = "desc" } = options

  try {
    const supabase = createClient()

    // Fetch orders without using relationships
    let query = supabase
      .from("orders")
      .select("*")
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1)
      .limit(limit)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: ordersData, error, count } = await query

    if (error) {
      console.error("Error fetching orders:", error)
      return { error: error.message }
    }

    // If we have orders, fetch the related data separately
    if (ordersData && ordersData.length > 0) {
      // Get unique IDs
      const customerIds = [...new Set(ordersData.map((order) => order.customer_id))]
      const proIds = [...new Set(ordersData.map((order) => order.pro_id))]
      const gameIds = [...new Set(ordersData.map((order) => order.game_id))]

      // Fetch profiles for customers
      const { data: customers } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", customerIds)

      // Fetch profiles for pros
      const { data: pros } = await supabase.from("profiles").select("id, username, avatar_url").in("id", proIds)

      // Fetch games
      const { data: games } = await supabase.from("games").select("id, name").in("id", gameIds)

      // Create lookup maps
      const customerMap =
        customers?.reduce((acc, customer) => {
          acc[customer.id] = customer
          return acc
        }, {}) || {}

      const proMap =
        pros?.reduce((acc, pro) => {
          acc[pro.id] = pro
          return acc
        }, {}) || {}

      const gameMap =
        games?.reduce((acc, game) => {
          acc[game.id] = game
          return acc
        }, {}) || {}

      // Combine data
      const enrichedOrders = ordersData.map((order) => ({
        ...order,
        customer: customerMap[order.customer_id] || { username: "Unknown" },
        pro: proMap[order.pro_id] || { username: "Unknown" },
        game: gameMap[order.game_id] || { name: "Unknown" },
      }))

      return { data: enrichedOrders, count }
    }

    return { data: ordersData, count }
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return { error: error.message }
  }
}

export async function getOrderById(id: string) {
  try {
    const supabase = createClient()

    // Fetch the order
    const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching order:", error)
      return { error: error.message }
    }

    // Fetch related data
    const { data: customer } = await supabase.from("profiles").select("*").eq("id", order.customer_id).single()

    const { data: pro } = await supabase.from("profiles").select("*").eq("id", order.pro_id).single()

    const { data: game } = await supabase.from("games").select("*").eq("id", order.game_id).single()

    // Combine data
    return {
      data: {
        ...order,
        customer,
        pro,
        game,
      },
    }
  } catch (error: any) {
    console.error("Error fetching order:", error)
    return { error: error.message }
  }
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createClient()

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

  const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating order status:", error)
    throw new Error(`Failed to update order status: ${error.message}`)
  }

  return data
}

// Function to create mock orders for testing
export async function createMockOrders() {
  try {
    const supabase = createClient()

    // Get some users to use as customers and pros
    const { data: customers } = await supabase.from("profiles").select("id").eq("account_type", "player").limit(3)

    const { data: pros } = await supabase.from("profiles").select("id").eq("account_type", "pro").limit(3)

    const { data: games } = await supabase.from("games").select("id, name").limit(3)

    if (!customers?.length || !pros?.length || !games?.length) {
      return { error: "Not enough users or games to create mock orders" }
    }

    const mockOrders = []

    // Create 10 mock orders
    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const pro = pros[Math.floor(Math.random() * pros.length)]
      const game = games[Math.floor(Math.random() * games.length)]

      const gameCount = Math.floor(Math.random() * 3) + 1
      const pricePerGame = Math.floor(Math.random() * 5) + 3
      const totalPrice = gameCount * pricePerGame

      const orderType = Math.random() > 0.5 ? "quick-match" : "direct-booking"

      // Random status weighted towards pending and completed
      const statusRandom = Math.random()
      let status
      if (statusRandom < 0.4) {
        status = "pending"
      } else if (statusRandom < 0.8) {
        status = "completed"
      } else {
        status = "cancelled"
      }

      const order = {
        id: uuidv4(),
        order_number: `ORD-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,
        customer_id: customer.id,
        pro_id: pro.id,
        game_id: game.id,
        type: orderType,
        status,
        game_count: gameCount,
        price_per_game: pricePerGame,
        total_price: totalPrice,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
        notes: Math.random() > 0.5 ? "Looking forward to improving my skills!" : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockOrders.push(order)
    }

    // Insert the mock orders
    const { data, error } = await supabase.from("orders").insert(mockOrders).select()

    if (error) {
      console.error("Error creating mock orders:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("Error creating mock orders:", error)
    return { error: error.message }
  }
}

export async function getPendingOrders() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles!customer_id(*), games(*)")
    .or(`status.eq.pending,status.eq.open`)
    .is("pro_id", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending orders:", error)
    return []
  }

  return data || []
}
