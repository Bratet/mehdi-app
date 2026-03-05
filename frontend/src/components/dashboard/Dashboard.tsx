"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { DollarSign, Timer, Activity, TrendingUp } from "lucide-react"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { DashboardSummary, RevenueData } from "@/types"

type Period = "daily" | "weekly" | "monthly"

const periodLabels: Record<Period, string> = {
  daily: "Day",
  weekly: "Week",
  monthly: "Month",
}

const kpiConfig = [
  {
    key: "today_revenue" as const,
    label: "Today's Revenue",
    icon: DollarSign,
    color: "primary",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "active_sessions" as const,
    label: "Active Sessions",
    icon: Timer,
    color: "secondary",
    format: (v: number) => String(v),
  },
  {
    key: "total_sessions_today" as const,
    label: "Sessions Today",
    icon: Activity,
    color: "warning",
    format: (v: number) => String(v),
  },
  {
    key: "net_profit" as const,
    label: "Net Profit",
    icon: TrendingUp,
    color: "secondary",
    format: (v: number) => formatCurrency(v),
  },
] as const

const colorMap: Record<string, { bg: string; text: string; cssVar: string }> = {
  primary: {
    bg: "bg-[rgba(0,212,255,0.15)]",
    text: "text-primary",
    cssVar: "var(--primary)",
  },
  secondary: {
    bg: "bg-[rgba(0,255,136,0.15)]",
    text: "text-secondary",
    cssVar: "var(--secondary)",
  },
  warning: {
    bg: "bg-[rgba(255,184,0,0.15)]",
    text: "text-warning",
    cssVar: "var(--warning)",
  },
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-text-secondary text-xs mb-1">{label}</p>
      <p className="text-foreground text-sm font-semibold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-card p-4 lg:p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-border" />
        <div className="h-3 w-24 rounded bg-border" />
      </div>
      <div className="h-7 w-28 rounded bg-border" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="bg-card border border-border rounded-card p-4 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-36 rounded bg-border" />
        <div className="flex gap-2">
          <div className="h-8 w-14 rounded-lg bg-border" />
          <div className="h-8 w-14 rounded-lg bg-border" />
          <div className="h-8 w-14 rounded-lg bg-border" />
        </div>
      </div>
      <div className="h-[300px] w-full rounded bg-border/50" />
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [period, setPeriod] = useState<Period>("daily")
  const [loading, setLoading] = useState(true)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchInitialData() {
      setLoading(true)
      setError(null)

      try {
        const [summaryRes, revenueRes] = await Promise.all([
          api.get<DashboardSummary>("/api/reports/summary"),
          api.get<RevenueData[]>("/api/reports/revenue?period=daily"),
        ])

        if (!cancelled) {
          setSummary(summaryRes)
          setRevenueData(revenueRes)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard data"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchInitialData()
    return () => {
      cancelled = true
    }
  }, [])

  const fetchRevenue = useCallback(async (newPeriod: Period) => {
    setPeriod(newPeriod)
    setRevenueLoading(true)

    try {
      const data = await api.get<RevenueData[]>(
        `/api/reports/revenue?period=${newPeriod}`
      )
      setRevenueData(data)
    } catch {
      // Keep existing data on period switch failure
    } finally {
      setRevenueLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-card border border-danger/30 rounded-card p-6 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-danger/15 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-danger" />
          </div>
          <h3 className="text-foreground font-semibold mb-2">
            Failed to load dashboard
          </h3>
          <p className="text-text-secondary text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary/15 text-primary rounded-button text-sm font-medium hover:bg-primary/25 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {kpiConfig.map((kpi) => {
          const colors = colorMap[kpi.color]
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.key}
              variants={cardVariants}
              className="bg-card border border-border rounded-card p-4 lg:p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-[18px] h-[18px] ${colors.text}`} />
                </div>
                <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                  {kpi.label}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {kpi.format(summary[kpi.key])}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
        className="bg-card border border-border rounded-card p-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-foreground font-semibold text-base">
            Revenue Overview
          </h2>
          <div className="flex gap-1 bg-surface rounded-lg p-1">
            {(Object.entries(periodLabels) as [Period, string][]).map(
              ([value, label]) => (
                <button
                  key={value}
                  onClick={() => fetchRevenue(value)}
                  disabled={revenueLoading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    period === value
                      ? "bg-primary/20 text-primary"
                      : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div
          className={`h-[300px] transition-opacity ${
            revenueLoading ? "opacity-50" : "opacity-100"
          }`}
        >
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                  tickFormatter={(v: number) => `${v}`}
                  dx={-4}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "var(--primary)",
                    stroke: "var(--card)",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-text-secondary text-sm">
                No revenue data available
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
