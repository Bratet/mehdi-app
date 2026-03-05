"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { TrendingUp, BarChart3, PieChart as PieChartIcon, AlertCircle, RefreshCw } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { api } from "@/lib/api"
import { RevenueData, ProductSales, DeviceUsage } from "@/types"
import { cn, formatCurrency } from "@/lib/utils"

const CHART_COLORS = {
  primary: "#00D4FF",
  secondary: "#00FF88",
  warning: "#FFB800",
  danger: "#FF4757",
}

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  "#A855F7",
  "#EC4899",
]

type Period = "daily" | "weekly" | "monthly"

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "daily", label: "Day" },
  { key: "weekly", label: "Week" },
  { key: "monthly", label: "Month" },
]

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("daily")
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [bestSelling, setBestSelling] = useState<ProductSales[]>([])
  const [deviceUsage, setDeviceUsage] = useState<DeviceUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [rev, products, devices] = await Promise.all([
        api.get<RevenueData[]>(`/api/reports/revenue?period=${period}`),
        api.get<ProductSales[]>("/api/reports/products/best-selling"),
        api.get<DeviceUsage[]>("/api/reports/devices/most-used"),
      ])
      setRevenueData(rev)
      setBestSelling(products)
      setDeviceUsage(devices)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="h-8 w-40 bg-border/50 rounded-lg animate-pulse" />
        <div className="bg-border/50 rounded-[16px] h-80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-border/50 rounded-[16px] h-64 animate-pulse" />
          <div className="bg-border/50 rounded-[16px] h-64 animate-pulse" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load reports</h3>
        <p className="text-text-secondary text-sm mb-4">{error}</p>
        <button onClick={fetchAll} className="bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-text-secondary text-sm mt-1">Analytics and insights</p>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-[16px] p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Revenue</h2>
          </div>
          <div className="flex gap-1 bg-background rounded-lg p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  period === opt.key
                    ? "bg-primary text-background"
                    : "text-text-secondary hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-60 text-text-secondary text-sm">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#888" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#888" }}
                tickFormatter={(v) => `${v} DH`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-[16px] p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold">Best Selling Products</h2>
          </div>

          {bestSelling.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-text-secondary text-sm">
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bestSelling} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#888" }} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#888" }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} sold`, "Quantity"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="total_sold" fill={CHART_COLORS.secondary} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Most Used Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-[16px] p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Most Used Devices</h2>
          </div>

          {deviceUsage.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-text-secondary text-sm">
              No device usage data available
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={deviceUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="total_sessions"
                    nameKey="device_name"
                    paddingAngle={3}
                  >
                    {deviceUsage.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} sessions`, name]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="shrink-0 space-y-2">
                {deviceUsage.map((device, i) => (
                  <div key={device.device_name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {device.device_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
