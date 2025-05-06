"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, UserCheck, UserX, Search, Filter, CheckCircle, XCircle, Clock } from "lucide-react"
import { UserDetailsModal } from "@/components/user-details-modal"

export default function UsersManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching users:", error)
      } else {
        setUsers(data || [])
        setFilteredUsers(data || [])
      }

      setIsLoading(false)
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    // Filter users based on active tab and search query
    let filtered = users

    // Filter by tab
    if (activeTab === "players") {
      filtered = filtered.filter((user) => user.account_type === "player")
    } else if (activeTab === "pros") {
      filtered = filtered.filter((user) => user.account_type === "pro")
    } else if (activeTab === "pending") {
      filtered = filtered.filter((user) => user.account_type === "pro" && user.application_status === "pending")
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          (user.username && user.username.toLowerCase().includes(query)) ||
          (user.full_name && user.full_name.toLowerCase().includes(query)),
      )
    }

    setFilteredUsers(filtered)
  }, [activeTab, searchQuery, users])

  const handleApproveUser = async (userId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        application_status: "approved",
        is_verified: true,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error approving user:", error)
    } else {
      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, application_status: "approved", is_verified: true } : user,
        ),
      )
    }
  }

  const handleRejectUser = async (userId: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("profiles").update({ application_status: "rejected" }).eq("id", userId)

    if (error) {
      console.error("Error rejecting user:", error)
    } else {
      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, application_status: "rejected" } : user)))
    }
  }

  const openUserDetails = (userId: string) => {
    setSelectedUserId(userId)
    setIsUserDetailsModalOpen(true)
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-400">Manage users and applications</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10 border-gray-700 bg-gray-800/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-gray-700 bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <h3 className="text-2xl font-bold">{users.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Players</p>
                <h3 className="text-2xl font-bold">{users.filter((user) => user.account_type === "player").length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pro Teammates</p>
                <h3 className="text-2xl font-bold">
                  {users.filter((user) => user.account_type === "pro" && user.application_status === "approved").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Applications</p>
                <h3 className="text-2xl font-bold">
                  {users.filter((user) => user.account_type === "pro" && user.application_status === "pending").length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription className="text-gray-400">View and manage all users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6 bg-gray-700">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="pros">Pro Teammates</TabsTrigger>
              <TabsTrigger value="pending">Pending Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderUserList(filteredUsers, handleApproveUser, handleRejectUser, isLoading, openUserDetails)}
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              {renderUserList(filteredUsers, handleApproveUser, handleRejectUser, isLoading, openUserDetails)}
            </TabsContent>

            <TabsContent value="pros" className="space-y-4">
              {renderUserList(filteredUsers, handleApproveUser, handleRejectUser, isLoading, openUserDetails)}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {renderUserList(filteredUsers, handleApproveUser, handleRejectUser, isLoading, openUserDetails)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isUserDetailsModalOpen}
        onClose={() => setIsUserDetailsModalOpen(false)}
        onApprove={handleApproveUser}
        onReject={handleRejectUser}
      />
    </div>
  )
}

function renderUserList(
  users: any[],
  handleApproveUser: (id: string) => void,
  handleRejectUser: (id: string) => void,
  isLoading: boolean,
  openUserDetails: (id: string) => void,
) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No users found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 font-medium text-gray-400">User</th>
            <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-400">Joined</th>
            <th className="text-right py-3 px-4 font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/30">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-medium">{user.username || "Anonymous"}</p>
                    <p className="text-sm text-gray-400">{user.full_name || ""}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={
                    user.account_type === "pro"
                      ? "bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-xs"
                      : user.account_type === "admin"
                        ? "bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs"
                        : "bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs"
                  }
                >
                  {user.account_type === "pro" ? "Pro Teammate" : user.account_type === "admin" ? "Admin" : "Player"}
                </span>
              </td>
              <td className="py-3 px-4">
                {user.account_type === "pro" ? (
                  <div className="flex items-center gap-2">
                    {user.application_status === "approved" ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Approved</span>
                      </>
                    ) : user.application_status === "rejected" ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">Rejected</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-500">Pending</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Active</span>
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-right">
                {user.account_type === "pro" && user.application_status === "pending" && (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 bg-transparent text-white hover:bg-gray-700"
                      onClick={() => openUserDetails(user.id)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      onClick={() => handleApproveUser(user.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      onClick={() => handleRejectUser(user.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {(user.account_type !== "pro" || user.application_status !== "pending") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-700 bg-transparent text-white hover:bg-gray-700"
                    onClick={() => openUserDetails(user.id)}
                  >
                    View Details
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
