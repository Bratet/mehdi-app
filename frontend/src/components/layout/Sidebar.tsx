"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  { path: "", labelKey: "dashboard", icon: LayoutDashboard },
  { path: "/devices", labelKey: "devices", icon: Monitor },
  { path: "/sessions", labelKey: "sessions", icon: Timer },
  { path: "/products", labelKey: "products", icon: Coffee },
  { path: "/orders", labelKey: "orders", icon: ShoppingCart },
  { path: "/billing", labelKey: "billing", icon: Receipt },
  { path: "/reports", labelKey: "reports", icon: BarChart3 },
  { path: "/bookings", labelKey: "bookings", icon: Calendar },
  { path: "/loyalty", labelKey: "loyalty", icon: Award },
  { path: "/expenses", labelKey: "expenses", icon: Wallet },
  { path: "/users", labelKey: "users", icon: Users },
  { path: "/establishments", labelKey: "establishments", icon: Building2 },
  { path: "/settings", labelKey: "settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
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
            const href = item.path === "" ? `/${locale}` : `/${locale}${item.path}`;
            const isActive =
              item.path === ""
                ? pathname === `/${locale}`
                : pathname.startsWith(`/${locale}${item.path}`);
            return (
              <Link key={item.path} href={href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive &&
                      "bg-primary/10 text-primary border-l-2 border-primary rounded-l-none"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
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
