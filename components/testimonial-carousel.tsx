"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    game: "Valorant",
    rank: "Gold 2",
    image: "/placeholder.svg?height=80&width=80&text=AC",
    content:
      "Playing with a pro teammate completely changed my experience. I learned so many new strategies and improved my aim significantly. My rank has gone up two tiers since I started using SquadUp!",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    game: "Marvel Rivals",
    rank: "Silver 3",
    image: "/placeholder.svg?height=80&width=80&text=SJ",
    content:
      "As a female gamer, I often face toxicity in random matches. SquadUp provided a safe and supportive environment where I could focus on improving my skills without dealing with harassment. My pro teammate was patient and taught me so much!",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Wong",
    game: "Valorant",
    rank: "Platinum 1",
    image: "/placeholder.svg?height=80&width=80&text=MW",
    content:
      "Even as a higher-ranked player, I found tremendous value in playing with a pro. They pointed out subtle mistakes in my gameplay that I never noticed before. The custom training plan they created for me has been incredibly helpful.",
    rating: 4,
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    game: "Marvel Rivals",
    rank: "Bronze 3",
    image: "/placeholder.svg?height=80&width=80&text=ER",
    content:
      "I was stuck in Bronze for months before trying SquadUp. My pro teammate didn't just carry me - they actually taught me how to play better. Now I'm climbing steadily and enjoying the game so much more!",
    rating: 5,
  },
  {
    id: 5,
    name: "Jason Park",
    game: "Valorant",
    rank: "Diamond 1",
    image: "/placeholder.svg?height=80&width=80&text=JP",
    content:
      "The pros on SquadUp aren't just skilled players, they're excellent teachers. My coach analyzed my gameplay and gave me specific drills to improve my weaknesses. Worth every penny!",
    rating: 5,
  },
]

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  // Handle automatic rotation
  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  // Pause autoplay when user interacts with carousel
  const handleManualNavigation = (index: number) => {
    setAutoplay(false)
    setActiveIndex(index)

    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setAutoplay(true), 10000)
  }

  const nextTestimonial = () => {
    handleManualNavigation((activeIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    handleManualNavigation((activeIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative">
      <div className="mx-auto max-w-4xl">
        <Card className="bg-gray-900/50 border-gray-800 text-white overflow-hidden">
          <CardContent className="p-0">
            <div className="relative min-h-[400px] md:min-h-[300px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`absolute inset-0 transition-opacity duration-500 p-8 ${
                    index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-green-500">
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-1">
                          <div className="bg-gradient-to-r from-green-500 to-cyan-500 rounded-full p-1">
                            <GameIcon className="h-4 w-4 text-black" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{testimonial.name}</h3>
                          <div className="text-sm text-gray-400">
                            {testimonial.game} • {testimonial.rank}
                          </div>
                        </div>
                        <div className="flex justify-center md:justify-start mt-2 md:mt-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-lg italic text-gray-300">"{testimonial.content}"</blockquote>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full border-gray-700 bg-gray-900/80 text-white hover:bg-gray-800"
        onClick={prevTestimonial}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full border-gray-700 bg-gray-900/80 text-white hover:bg-gray-800"
        onClick={nextTestimonial}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots indicator */}
      <div className="flex justify-center mt-4 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === activeIndex ? "bg-green-500 w-6" : "bg-gray-600 hover:bg-gray-500"
            }`}
            onClick={() => handleManualNavigation(index)}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function GameIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  )
}
