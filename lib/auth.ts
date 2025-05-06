"use server"

import { createActionClient } from "./supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: {
  email: string
  password: string
  username: string
  accountType: "player" | "pro"
}) {
  const supabase = createActionClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
        account_type: formData.accountType,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: formData.username,
      account_type: formData.accountType,
      is_verified: formData.accountType === "player",
      application_status: formData.accountType === "pro" ? "pending" : null,
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  return { success: true, user: data.user }
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = createActionClient()

  // Clear any existing session
  await supabase.auth.signOut()

  // Sign in with the provided credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    console.error("Sign in error:", error.message)
    return { error: error.message }
  }

  if (!data.user) {
    return { error: "No user returned from sign in" }
  }

  // Get user profile to determine redirect
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", data.user.id)
    .single()

  if (profileError) {
    console.error("Profile fetch error:", profileError.message)
    return { error: "Error fetching user profile" }
  }

  let redirectPath = "/dashboard"

  if (profile?.account_type === "pro") {
    redirectPath = "/pro-dashboard"
  } else if (profile?.account_type === "admin" || profile?.account_type === "head_admin") {
    redirectPath = "/admin"
  }

  console.log("Sign in successful, redirecting to:", redirectPath)

  return {
    success: true,
    user: data.user,
    redirectPath,
    accountType: profile?.account_type,
  }
}

export async function signOut() {
  const supabase = createActionClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/")
}

export async function resetPassword(email: string) {
  const supabase = createActionClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = createActionClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getSession() {
  const supabase = createActionClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile() {
  const supabase = createActionClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return null
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return data
}
