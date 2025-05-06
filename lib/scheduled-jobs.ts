"use server"

import { createAdminClient } from "./supabase/admin"

// Function to archive messages older than 30 days from closed chat rooms
export async function archiveOldMessages() {
  const supabase = createAdminClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 30) // 30 days retention

  try {
    const { error } = await supabase.rpc("archive_old_messages", {
      cutoff_date: cutoffDate.toISOString(),
    })

    if (error) {
      console.error("Error archiving messages:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Old messages archived successfully" }
  } catch (err: any) {
    console.error("Unexpected error in archiveOldMessages:", err)
    return { success: false, error: err.message }
  }
}
