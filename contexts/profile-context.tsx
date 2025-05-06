"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

type ProfileContextType = {
  user: any | null
  profile: any | null
  isLoading: boolean
  isHeadAdmin: boolean
  isAdmin: boolean
  isProUser: boolean
  isPlayer: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
  error: string | null
}

const ProfileContext = createContext<ProfileContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isHeadAdmin: false,
  isAdmin: false,
  isProUser: false,
  isPlayer: false,
  isAuthenticated: false,
  refreshProfile: async () => {},
  error: null,
})

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase, setSupabase] = useState<any>(null)

  // Initialize Supabase client
  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err)
      setError("Failed to initialize authentication. Please check your configuration.")
      setIsLoading(false)
    }
  }, [])

  const refreshProfile = async () => {
    if (!supabase) {
      setError("Authentication service is not available")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      if (!session) {
        setUser(null)
        setProfile(null)
        return
      }

      setUser(session.user)

      // Get user profile
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        // Don't throw here, we still have the user
      } else {
        setProfile(data)
      }
    } catch (err: any) {
      console.error("Error refreshing profile:", err)
      setError(err.message || "Failed to load user profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh profile when Supabase client is available
  useEffect(() => {
    if (supabase) {
      refreshProfile()

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          setUser(session.user)
          await refreshProfile()
        } else {
          setUser(null)
          setProfile(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  const isHeadAdmin = profile?.account_type === "head_admin"
  const isAdmin = profile?.account_type === "admin"
  const isProUser = profile?.account_type === "pro"
  const isPlayer = profile?.account_type === "player"
  const isAuthenticated = !!user

  return (
    <ProfileContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isHeadAdmin,
        isAdmin,
        isProUser,
        isPlayer,
        isAuthenticated,
        refreshProfile,
        error,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
