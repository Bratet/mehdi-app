"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Monitor, Timer, Coffee, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Monitor },
  { href: "/sessions", label: "Sessions", icon: Timer },
  { href: "/cafe", label: "Café", icon: Coffee },
]

interface BottomNavProps {
  onMenuOpen: () => void
}

export default function BottomNav({ onMenuOpen }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden glass border-t border-border/50">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all min-w-[56px]",
                active ? "text-primary" : "text-text-secondary"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  active && "bg-primary/10 shadow-glow"
                )}
              >
                <tab.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-text-secondary min-w-[56px]"
        >
          <div className="p-1">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  )
}
