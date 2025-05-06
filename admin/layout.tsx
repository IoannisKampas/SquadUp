import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Users, GamepadIcon, Star, BarChart3, Settings, LogOut, ShoppingCart } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard - SquadUp",
  description: "Manage users, games, sessions, and more",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <BarChart3 size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <Users size={18} />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <ShoppingCart size={18} />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/games"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                <GamepadIcon size={18} />
                <span>Games</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reviews"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
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
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
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
