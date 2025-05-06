"use server"

import { createAdminClient } from "./supabase/admin"

export async function ensureNotificationsTableExists() {
  const supabase = createAdminClient()

  try {
    // Check if the table exists
    const { error: checkError } = await supabase.from("notifications").select("id").limit(1)

    if (checkError && checkError.code === "42P01") {
      // Table doesn't exist, create it
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.notifications (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          data JSONB DEFAULT '{}'::jsonb,
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
      `

      const { error: createError } = await supabase.rpc("exec_sql", { sql: createTableSQL })

      if (createError) {
        console.error("Error creating notifications table:", createError)
        return { error: createError.message }
      }

      return { success: true, message: "Notifications table created successfully" }
    }

    return { success: true, message: "Notifications table already exists" }
  } catch (error: any) {
    console.error("Error checking/creating notifications table:", error)
    return { error: error.message }
  }
}
