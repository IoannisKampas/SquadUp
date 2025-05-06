"use server"

import { createActionClient } from "./supabase/server"
import type { Database } from "./database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Game = Database["public"]["Tables"]["games"]["Row"]
type Session = Database["public"]["Tables"]["sessions"]["Row"]
type Review = Database["public"]["Tables"]["reviews"]["Row"]
type GameProfile = Database["public"]["Tables"]["game_profiles"]["Row"]

// Profile functions
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(id: string, profile: Partial<Profile>) {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("profiles").update(profile).eq("id", id).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  return { data }
}

// Game functions
export async function getAllGames(): Promise<Game[]> {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("games").select("*").order("name")

  if (error) {
    console.error("Error fetching games:", error)
    return []
  }

  return data || []
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("games").select("*").eq("slug", slug).single()

  if (error) {
    console.error("Error fetching game:", error)
    return null
  }

  return data
}

// Session functions
export async function createSession(session: Database["public"]["Tables"]["sessions"]["Insert"]) {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("sessions").insert(session).select().single()

  if (error) {
    console.error("Error creating session:", error)
    return { error: error.message }
  }

  return { data }
}

export async function getSessionsByCustomerId(customerId: string): Promise<Session[]> {
  const supabase = createActionClient()
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      games:game_id(*),
      pro:pro_id(id, username, avatar_url)
    `)
    .eq("customer_id", customerId)
    .order("scheduled_at", { ascending: false })

  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }

  return data || []
}

export async function getSessionsByProId(proId: string): Promise<Session[]> {
  const supabase = createActionClient()
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      games:game_id(*),
      customer:customer_id(id, username, avatar_url)
    `)
    .eq("pro_id", proId)
    .order("scheduled_at", { ascending: false })

  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }

  return data || []
}

// Review functions
export async function createReview(review: Database["public"]["Tables"]["reviews"]["Insert"]) {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("reviews").insert(review).select().single()

  if (error) {
    console.error("Error creating review:", error)
    return { error: error.message }
  }

  return { data }
}

export async function getReviewsByRevieweeId(revieweeId: string): Promise<Review[]> {
  const supabase = createActionClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:reviewer_id(id, username, avatar_url)
    `)
    .eq("reviewee_id", revieweeId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  return data || []
}

// Game Profile functions
export async function getGameProfilesByUserId(userId: string): Promise<GameProfile[]> {
  const supabase = createActionClient()
  const { data, error } = await supabase
    .from("game_profiles")
    .select(`
      *,
      games:game_id(*)
    `)
    .eq("profile_id", userId)

  if (error) {
    console.error("Error fetching game profiles:", error)
    return []
  }

  return data || []
}

export async function updateGameProfile(
  profileId: string,
  gameId: string,
  updates: Partial<Database["public"]["Tables"]["game_profiles"]["Update"]>,
) {
  const supabase = createActionClient()
  const { data, error } = await supabase
    .from("game_profiles")
    .update(updates)
    .eq("profile_id", profileId)
    .eq("game_id", gameId)
    .select()
    .single()

  if (error) {
    console.error("Error updating game profile:", error)
    return { error: error.message }
  }

  return { data }
}

// Admin functions
export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createActionClient()
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }

  return data || []
}

export async function updateProfileStatus(profileId: string, status: "approved" | "rejected") {
  const supabase = createActionClient()
  const { data, error } = await supabase
    .from("profiles")
    .update({
      application_status: status,
      is_verified: status === "approved",
    })
    .eq("id", profileId)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile status:", error)
    return { error: error.message }
  }

  return { data }
}
