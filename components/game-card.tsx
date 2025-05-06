import Image from "next/image"
import { cn } from "@/lib/utils"

interface GameCardProps {
  name: string
  image: string
  teammates: number
  sessions: number
  active?: boolean
}

export default function GameCard({ name, image, teammates, sessions, active = false }: GameCardProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 overflow-hidden rounded-lg border-2 border-transparent transition-all",
        active && "border-[#c1ff00]",
      )}
    >
      <div className="relative h-[200px] w-[200px]">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-4 text-center">
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <div className="mt-1 text-xs text-gray-300">
            <div>{teammates} teammates</div>
            <div>{sessions} recent sessions</div>
          </div>
        </div>
      </div>
    </div>
  )
}
