import { useNotifications } from "@/contexts/notification-context"

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications()

  if (unreadCount === 0) return null

  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ${className || ""}`}
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )
}
