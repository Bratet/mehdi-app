"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Gamepad2 } from "lucide-react"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import HamburgerMenu from "./HamburgerMenu"
import { useAuth } from "@/context/AuthContext"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/devices": "Devices",
  "/sessions": "Sessions",
  "/cafe": "Café",
  "/billing": "Billing",
  "/reports": "Reports",
  "/expenses": "Expenses",
  "/settings": "Settings",
}

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
            <Gamepad2 className="w-7 h-7 text-primary" />
          </div>
          <div className="w-24 h-1 rounded-full bg-surface overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full animate-[slide-in-left_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    if (pathname !== "/login") {
      router.push("/login")
      return null
    }
    return <>{children}</>
  }

  const title = pageTitles[pathname] || "Game Center"

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-20 lg:hidden glass border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold">{title}</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {/* Desktop page title */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {children}
        </div>
      </main>

      <BottomNav onMenuOpen={() => setMenuOpen(true)} />
    </div>
  )
}
