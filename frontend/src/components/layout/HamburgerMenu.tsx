"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Monitor,
  Timer,
  Coffee,
  Receipt,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
  Gamepad2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Monitor },
  { href: "/sessions", label: "Sessions", icon: Timer },
  { href: "/cafe", label: "Café", icon: Coffee },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { href: "/expenses", label: "Expenses", icon: Wallet, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface HamburgerMenuProps {
  open: boolean
  onClose: () => void
}

export default function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-surface z-50 transform transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold neon-text">Game Center</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary uppercase">
              {user?.username?.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-border space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-secondary hover:text-foreground hover:bg-surface-hover w-full transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-danger hover:bg-danger/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
