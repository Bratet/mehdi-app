"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Menu, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Monitor, Timer, Coffee, ShoppingCart, Receipt,
  BarChart3, Calendar, Award, Wallet, Users, Building2, Settings,
} from "lucide-react";

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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex items-center gap-2 px-4 h-16 border-b">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Game Center</span>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-1 p-2">
            {navItems.map((item) => {
              const href = item.path === "" ? `/${locale}` : `/${locale}${item.path}`;
              const isActive =
                item.path === ""
                  ? pathname === `/${locale}`
                  : pathname.startsWith(`/${locale}${item.path}`);
              return (
                <Link key={item.path} href={href} onClick={() => setOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{t(item.labelKey)}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
