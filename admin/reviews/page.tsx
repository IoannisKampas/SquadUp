"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Star, Trash2 } from "lucide-react"

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:reviewer_id(username),
          reviewee:reviewee_id(username),
          order:order_id(
            id,
            game:game_id(name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reviews:", error)
      } else {
        setReviews(data || [])
      }

      setIsLoading(false)
    }

    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter(
    (review) =>
      (review.reviewer?.username && review.reviewer.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (review.reviewee?.username && review.reviewee.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (review.order?.game?.name && review.order.game.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (review.comment && review.comment.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleDeleteReview = async (reviewId: string) => {
    const supabase = createClient()

    const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

    if (error) {
      console.error("Error deleting review:", error)
    } else {
      // Update local state
      setReviews(reviews.filter((review) => review.id !== reviewId))
    }
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-gray-400">Manage user reviews</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reviews..."
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

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-300">{review.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-400">Game: {review.order?.game?.name || "Unknown"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium">
                          {review.reviewer?.username ? review.reviewer.username.charAt(0).toUpperCase() : "U"}
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">{review.reviewer?.username || "Unknown"}</span>
                          <span className="text-gray-400"> reviewed </span>
                          <span className="font-medium">{review.reviewee?.username || "Unknown"}</span>
                        </p>
                      </div>

                      {review.comment && <div className="bg-gray-800 p-3 rounded text-sm">"{review.comment}"</div>}
                    </div>

                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
