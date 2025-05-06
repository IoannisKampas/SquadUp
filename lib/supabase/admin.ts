import { createClient } from "@supabase/supabase-js"
import type { Database } from "../database.types"

// Create a Supabase client with the service role key to bypass RLS
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Try different environment variable names for the service role key
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.jlxodjsatbsqrtybbzgj_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase URL or service role key", {
      url: supabaseUrl ? "✓" : "✗",
      key: supabaseServiceRoleKey ? "✓" : "✗",
    })
    throw new Error("Missing Supabase URL or service role key")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
