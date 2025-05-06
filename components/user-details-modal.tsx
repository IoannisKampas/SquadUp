"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import {
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  User,
  MapPin,
  Calendar,
  GamepadIcon as GameController,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserDetailsModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
  onApprove: (userId: string) => void
  onReject: (userId: string) => void
}

export function UserDetailsModal({ userId, isOpen, onClose, onApprove, onReject }: UserDetailsModalProps) {
  const [user, setUser] = useState<any>(null)
  const [gameProfiles, setGameProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails(userId)
    } else {
      setUser(null)
      setGameProfiles([])
    }
  }, [userId, isOpen])

  const fetchUserDetails = async (id: string) => {
    setIsLoading(true)
    const supabase = createClient()

    // Fetch user profile
    const { data: userData, error: userError } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      setIsLoading(false)
      return
    }

    // Fetch user's game profiles
    const { data: gameData, error: gameError } = await supabase
      .from("game_profiles")
      .select(`
        *,
        games:game_id(*)
      `)
      .eq("profile_id", id)

    if (gameError) {
      console.error("Error fetching game profiles:", gameError)
    }

    setUser(userData)
    setGameProfiles(gameData || [])
    setIsLoading(false)
  }

  const handleApprove = async () => {
    if (!userId) return
    setIsProcessing(true)
    await onApprove(userId)
    setIsProcessing(false)
    onClose()
  }

  const handleReject = async () => {
    if (!userId) return
    setIsProcessing(true)
    await onReject(userId)
    setIsProcessing(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription className="text-gray-400">
            Review the user's profile and application details
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-medium">
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.username || "Anonymous"}</h3>
                <p className="text-gray-400">{user.full_name || ""}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={
                      user.account_type === "pro"
                        ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                        : user.account_type === "admin"
                          ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }
                  >
                    {user.account_type === "pro" ? "Pro Teammate" : user.account_type === "admin" ? "Admin" : "Player"}
                  </Badge>
                  {user.account_type === "pro" && (
                    <Badge
                      className={
                        user.application_status === "approved"
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : user.application_status === "rejected"
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      }
                    >
                      {user.application_status === "approved"
                        ? "Approved"
                        : user.application_status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* User details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Discord:</span>
                <span>{user.discord_username || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Location:</span>
                <span>{user.location || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Joined:</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Bio</h4>
              <p className="bg-gray-700/50 p-3 rounded-md">{user.bio || "No bio provided"}</p>
            </div>

            {/* Game profiles */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Game Profiles</h4>
              {gameProfiles.length > 0 ? (
                <div className="space-y-3">
                  {gameProfiles.map((profile) => (
                    <div key={profile.id} className="bg-gray-700/50 p-3 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GameController className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{profile.games?.name || "Unknown Game"}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              <span>{profile.rank || "Unranked"}</span>
                            </div>
                            <div>Role: {profile.role || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{profile.hours_played || 0} hours</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="bg-gray-700/50 p-3 rounded-md text-gray-400">No game profiles found</p>
              )}
            </div>

            {/* Actions */}
            {user.account_type === "pro" && user.application_status === "pending" && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  className="border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Application
                </Button>
                <Button
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Application
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>User not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
