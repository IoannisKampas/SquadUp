"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BellIcon } from "lucide-react"
import { useRouter } from "next/navigation"

interface NewOrderNotificationProps {
  count: number
  onDismiss?: () => void
}

export default function NewOrderNotification({ count, onDismiss }: NewOrderNotificationProps) {
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, 10000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  const handleViewOrders = () => {
    router.push("/pro-dashboard/pending-orders")
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-green-500/30 bg-gray-900/95 p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-10">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
          <BellIcon className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-medium">New Order Alert!</h3>
          <p className="text-sm text-gray-400">
            You have {count} new order{count !== 1 ? "s" : ""} to review
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-700 bg-transparent text-white hover:bg-gray-800"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-black hover:opacity-90"
          onClick={handleViewOrders}
        >
          View Orders
        </Button>
      </div>
    </div>
  )
}
