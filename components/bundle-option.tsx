import Image from "next/image"
import { cn } from "@/lib/utils"

interface BundleOptionProps {
  title: string
  description: string
  waitTime: string
  selected?: boolean
}

export default function BundleOption({ title, description, waitTime, selected = false }: BundleOptionProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-gray-700",
        selected && "border-[#c1ff00] bg-[#0f1a00]/30",
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700">
        {selected && <div className="h-3 w-3 rounded-full bg-[#c1ff00]"></div>}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gray-800">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="Game icon"
              className="h-8 w-8"
            />
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-clock"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {waitTime} away
      </div>
    </div>
  )
}
