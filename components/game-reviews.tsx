import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface GameReviewsProps {
  gameName: string
}

export default function GameReviews({ gameName }: GameReviewsProps) {
  // Mock reviews data
  const reviews = [
    {
      id: 1,
      user: {
        name: "Alex Chen",
        image: "/placeholder.svg?height=60&width=60&text=AC",
        level: "Gold 2",
      },
      rating: 5,
      date: "2 weeks ago",
      content:
        "Playing with a pro teammate completely changed my experience. I learned so many new strategies and improved my aim significantly. My rank has gone up two tiers since I started using SquadUp!",
    },
    {
      id: 2,
      user: {
        name: "Sarah Johnson",
        image: "/placeholder.svg?height=60&width=60&text=SJ",
        level: "Silver 3",
      },
      rating: 5,
      date: "1 month ago",
      content:
        "As a female gamer, I often face toxicity in random matches. SquadUp provided a safe and supportive environment where I could focus on improving my skills without dealing with harassment. My pro teammate was patient and taught me so much!",
    },
    {
      id: 3,
      user: {
        name: "Michael Wong",
        image: "/placeholder.svg?height=60&width=60&text=MW",
        level: "Platinum 1",
      },
      rating: 4,
      date: "3 weeks ago",
      content:
        "Even as a higher-ranked player, I found tremendous value in playing with a pro. They pointed out subtle mistakes in my gameplay that I never noticed before. The custom training plan they created for me has been incredibly helpful.",
    },
    {
      id: 4,
      user: {
        name: "Emily Rodriguez",
        image: "/placeholder.svg?height=60&width=60&text=ER",
        level: "Bronze 3",
      },
      rating: 5,
      date: "2 months ago",
      content:
        "I was stuck in Bronze for months before trying SquadUp. My pro teammate didn't just carry me - they actually taught me how to play better. Now I'm climbing steadily and enjoying the game so much more!",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Players Say</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Hear from players who have improved their {gameName} skills with our pro teammates.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-gray-900/50 border-gray-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.user.image || "/placeholder.svg"}
                      alt={review.user.name}
                      width={48}
                      height={48}
                      className="rounded-full border border-gray-700"
                    />
                    <div>
                      <h4 className="font-medium">{review.user.name}</h4>
                      <div className="text-sm text-gray-400">{review.user.level}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 ml-2">{review.date}</span>
                  </div>
                </div>
                <p className="text-gray-300">{review.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
