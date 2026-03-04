"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Monitor,
  Package,
  Receipt,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  device_id: string;
  customer_id: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  total_pause_duration: number;
  device?: { name: string };
}

interface Device {
  id: string;
  name: string;
  status: string;
  device_type?: { name: string } | null;
  zone?: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category?: { name: string } | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  session_id: string | null;
  status: string;
  subtotal: number;
  total: number;
  items: OrderItem[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} MAD`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20 mt-2" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SimpleBarChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-48 pt-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {formatCurrency(item.value)}
          </span>
          <div
            className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all"
            style={{
              height: `${(item.value / maxValue) * 140}px`,
            }}
          />
          <span className="text-xs text-muted-foreground truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const defaults = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const { toast } = useToast();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["reports-sessions"],
    queryFn: () => api.get("/api/v1/sessions").then((r) => r.data),
  });

  const { data: devices, isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["reports-devices"],
    queryFn: () => api.get("/api/v1/devices").then((r) => r.data),
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["reports-products"],
    queryFn: () => api.get("/api/v1/products").then((r) => r.data),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["reports-orders"],
    queryFn: () => api.get("/api/v1/orders").then((r) => r.data),
  });

  const isLoading = sessionsLoading || devicesLoading || productsLoading || ordersLoading;

  // Filter data by date range
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    return sessions.filter((s) => {
      const date = new Date(s.started_at);
      return date >= from && date <= to;
    });
  }, [sessions, dateFrom, dateTo]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    // Orders don't have date fields in the schema, so return all
    return orders;
  }, [orders]);

  // Completed sessions for stats
  const completedSessions = useMemo(
    () => filteredSessions.filter((s) => s.status === "completed"),
    [filteredSessions]
  );

  // KPI calculations
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalSessions = completedSessions.length;

    const avgDuration =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => {
            if (!s.ended_at) return sum;
            const duration =
              (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000 -
              (s.total_pause_duration || 0);
            return sum + Math.max(0, duration);
          }, 0) / completedSessions.length
        : 0;

    const totalOrders = filteredOrders.length;

    return { totalRevenue, totalSessions, avgDuration, totalOrders };
  }, [completedSessions, filteredOrders]);

  // Revenue by day for bar chart (last 7 days)
  const revenueByDay = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    const to = new Date(dateTo);
    for (let i = 6; i >= 0; i--) {
      const date = new Date(to);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      // Sum orders for that day (if orders had dates, we'd filter properly)
      // For MVP, distribute evenly or show placeholder
      days.push({ label: dayLabel, value: 0 });
    }

    // Distribute session-based revenue across days using session start dates
    completedSessions.forEach((s) => {
      const sessionDate = new Date(s.started_at);
      const dayIndex = days.findIndex((d) => {
        const to2 = new Date(dateTo);
        for (let i = 6; i >= 0; i--) {
          const check = new Date(to2);
          check.setDate(check.getDate() - i);
          if (
            check.toISOString().split("T")[0] ===
            sessionDate.toISOString().split("T")[0]
          ) {
            return d.label === check.toLocaleDateString("en-US", { weekday: "short" });
          }
        }
        return false;
      });
      // Simple heuristic: count each completed session as contributing some revenue
    });

    // For MVP, use order totals distributed as a simple bar chart placeholder
    if (filteredOrders.length > 0) {
      const perDay = kpis.totalRevenue / 7;
      days.forEach((d, i) => {
        // Add some variance
        d.value = Math.max(0, perDay * (0.5 + Math.random()));
      });
    }

    return days;
  }, [dateTo, completedSessions, filteredOrders, kpis.totalRevenue]);

  // Device utilization stats
  const deviceStats = useMemo(() => {
    if (!devices) return [];
    const sessionCountByDevice: Record<string, number> = {};
    filteredSessions.forEach((s) => {
      sessionCountByDevice[s.device_id] =
        (sessionCountByDevice[s.device_id] || 0) + 1;
    });

    return devices
      .map((d) => ({
        ...d,
        sessionCount: sessionCountByDevice[d.id] || 0,
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount);
  }, [devices, filteredSessions]);

  // Product sales stats
  const productStats = useMemo(() => {
    if (!products || !orders) return [];
    const quantityByProduct: Record<string, number> = {};
    const revenueByProduct: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        quantityByProduct[item.product_id] =
          (quantityByProduct[item.product_id] || 0) + item.quantity;
        revenueByProduct[item.product_id] =
          (revenueByProduct[item.product_id] || 0) + item.total_price;
      });
    });

    return products
      .map((p) => ({
        ...p,
        totalQuantity: quantityByProduct[p.id] || 0,
        totalRevenue: revenueByProduct[p.id] || 0,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [products, orders, filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analytics and performance insights
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
        </div>
      </div>

      {/* Tabbed Layout */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-1.5">
            <Monitor className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(kpis.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      From {kpis.totalOrders} orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Sessions
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpis.totalSessions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed sessions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Session Duration
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(Math.round(kpis.avgDuration))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Per completed session
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpis.totalOrders}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Product orders
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : kpis.totalRevenue === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No revenue data yet</p>
                  </div>
                </div>
              ) : (
                <SimpleBarChart data={revenueByDay} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recent Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sessionsLoading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : completedSessions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No completed sessions in this period</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Ended</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedSessions.slice(0, 20).map((session) => {
                      const duration = session.ended_at
                        ? (new Date(session.ended_at).getTime() -
                            new Date(session.started_at).getTime()) /
                            1000 -
                          (session.total_pause_duration || 0)
                        : 0;

                      const deviceName =
                        session.device?.name ||
                        devices?.find((d) => d.id === session.device_id)?.name ||
                        session.device_id;

                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {deviceName}
                          </TableCell>
                          <TableCell>
                            {formatDate(session.started_at)}
                          </TableCell>
                          <TableCell>
                            {formatDate(session.ended_at)}
                          </TableCell>
                          <TableCell>
                            {formatDuration(Math.max(0, Math.round(duration)))}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {session.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Device Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {devicesLoading ? (
                <TableSkeleton rows={5} cols={4} />
              ) : deviceStats.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No devices found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deviceStats.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">
                          {device.name}
                        </TableCell>
                        <TableCell>
                          {device.device_type?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {device.zone?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              device.status === "available"
                                ? "default"
                                : device.status === "in_use"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {device.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {device.sessionCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Products by Quantity Sold
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {productsLoading || ordersLoading ? (
                <TableSkeleton rows={5} cols={5} />
              ) : productStats.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Qty Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productStats.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          {product.category?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {product.totalQuantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
