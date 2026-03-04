"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
              const isActive =
                item.href === "/en"
                  ? pathname === "/en"
                  : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
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
