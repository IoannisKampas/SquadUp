"use client"

import type React from "react"
import Link from "next/link"
import { Users, GamepadIcon, Star, ShoppingCart, BarChart3, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 opacity-80 blur-sm"></div>
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-black text-xl font-bold">
                S
              </div>
            </div>
            <div className="text-xl font-bold">
              Squad<span className="text-green-500">Up</span> Admin
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white",
                  pathname === "/admin" ? "bg-gray-800" : "hover:bg-gray-800/50",
                )}
              >
                <BarChart3 size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white",
                  pathname === "/admin/users" ? "bg-gray-800" : "hover:bg-gray-800/50",
                )}
              >
                <Users size={18} />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white",
                  pathname === "/admin/orders" ? "bg-gray-800" : "hover:bg-gray-800/50",
                )}
              >
                <ShoppingCart size={18} />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/games"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white",
                  pathname === "/admin/games" ? "bg-gray-800" : "hover:bg-gray-800/50",
                )}
              >
                <GamepadIcon size={18} />
                <span>Games</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reviews"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white",
                  pathname === "/admin/reviews" ? "bg-gray-800" : "hover:bg-gray-800/50",
                )}
              >
                <Star size={18} />
                <span>Reviews</span>
              </Link>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-gray-700">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white",
                    pathname === "/admin/settings" ? "bg-gray-800" : "hover:bg-gray-800/50",
                  )}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-red-400">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
