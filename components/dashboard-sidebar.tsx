"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  ShoppingBag,
  Settings,
  CreditCard,
  MessageSquare,
  Trophy,
  Gamepad2,
  LayoutDashboard,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const pathname = usePathname()

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Find Teammates",
      href: "/dashboard/find-teammates",
      icon: Users,
    },
    {
      name: "My Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      name: "Chats",
      href: "/dashboard/chats",
      icon: MessageSquare,
    },
    {
      name: "Stats",
      href: "/dashboard/stats",
      icon: BarChart3,
    },
    {
      name: "Achievements",
      href: "/dashboard/achievements",
      icon: Trophy,
    },
    {
      name: "My Games",
      href: "/dashboard/games",
      icon: Gamepad2,
    },
    {
      name: "Wallet",
      href: "/dashboard/wallet",
      icon: CreditCard,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="hidden md:block w-64 border-r border-gray-800 bg-black/50 p-6">
      <nav className="space-y-2">
        {links.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 bg-transparent text-white hover:bg-gray-800",
              pathname === link.href && "bg-gray-800",
            )}
            asChild
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  )
}
