"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Timer, Calendar, DollarSign, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: () => api.get("/api/v1/devices").then((r) => r.data),
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions-active"],
    queryFn: () => api.get("/api/v1/sessions/active").then((r) => r.data),
  });

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.get("/api/v1/bookings").then((r) => r.data),
  });

  const availableDevices = devices?.filter((d: any) => d.status === "available").length ?? 0;
  const totalDevices = devices?.length ?? 0;
  const activeSessions = sessions?.length ?? 0;
  const pendingBookings = bookings?.filter((b: any) => b.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/en/sessions">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Session
            </Button>
          </Link>
          <Link href="/en/orders">
            <Button size="sm" variant="outline">
              <ShoppingCart className="h-4 w-4 mr-1" /> New Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Devices</CardTitle>
            <Monitor className="h-4 w-4 text-status-available" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableDevices}/{totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">devices ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <Timer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-status-maintenance" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-status-available" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">MAD</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {!sessions ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sessions</p>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{s.device?.name || "Device"}</p>
                      <p className="text-xs text-muted-foreground">
                        Started {new Date(s.started_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Occupied</span>
                <span className="font-medium">{totalDevices - availableDevices} devices</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className="font-medium text-status-available">{availableDevices} devices</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active sessions</span>
                <span className="font-medium">{activeSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending bookings</span>
                <span className="font-medium">{pendingBookings}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
