"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Monitor, Timer, Coffee, ShoppingCart, Receipt,
  BarChart3, Calendar, Award, Wallet, Users, Building2, Settings,
  ChevronLeft, ChevronRight, Gamepad2,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/en", label: "Dashboard", icon: LayoutDashboard },
  { href: "/en/devices", label: "Devices", icon: Monitor },
  { href: "/en/sessions", label: "Sessions", icon: Timer },
  { href: "/en/products", label: "Products", icon: Coffee },
  { href: "/en/orders", label: "Orders", icon: ShoppingCart },
  { href: "/en/billing", label: "Billing", icon: Receipt },
  { href: "/en/reports", label: "Reports", icon: BarChart3 },
  { href: "/en/bookings", label: "Bookings", icon: Calendar },
  { href: "/en/loyalty", label: "Loyalty", icon: Award },
  { href: "/en/expenses", label: "Expenses", icon: Wallet },
  { href: "/en/users", label: "Users", icon: Users },
  { href: "/en/establishments", label: "Establishments", icon: Building2 },
  { href: "/en/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b">
        <Gamepad2 className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-bold text-lg">Game Center</span>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/en"
                ? pathname === "/en"
                : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive &&
                      "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
