"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Check, MessageSquare, Package, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Toggle dropdown
  const toggleDropdown = () => {
    console.log("Toggle dropdown, current state:", isOpen)
    setIsOpen(!isOpen)
  }

  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  // Mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_accepted":
        return <Package className="h-5 w-5 text-green-500" />
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "order_completed":
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-800" onClick={toggleDropdown}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white hover:bg-gray-800"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-400">No notifications</div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "rounded-md p-3 hover:bg-gray-800",
                        notification.read ? "bg-gray-800/50" : "bg-gray-800",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-400">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(notification.created_at || notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
