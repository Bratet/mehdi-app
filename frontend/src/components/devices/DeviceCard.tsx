"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gamepad2,
  Monitor,
  CircleDot,
  Activity,
  Gamepad,
  Box,
  Play,
  Trash2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"
import { api } from "@/lib/api"
import { Device } from "@/types"
import { cn, formatCurrency } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface DeviceCardProps {
  device: Device
  onRefresh: () => void
}

const deviceIcons: Record<string, React.ElementType> = {
  playstation: Gamepad2,
  pc: Monitor,
  billiards: CircleDot,
  ping_pong: Activity,
  xbox: Gamepad,
  custom: Box,
}

const deviceTypeLabels: Record<string, string> = {
  playstation: "PlayStation",
  pc: "PC",
  billiards: "Billiards",
  ping_pong: "Ping Pong",
  xbox: "Xbox",
  custom: "Custom",
}

const statusConfig: Record<string, { label: string; dotClass: string }> = {
  available: { label: "Available", dotClass: "bg-available" },
  busy: { label: "Busy", dotClass: "bg-busy" },
  maintenance: { label: "Maintenance", dotClass: "bg-maintenance" },
}

export default function DeviceCard({ device, onRefresh }: DeviceCardProps) {
  const { isAdmin } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [updating, setUpdating] = useState(false)

  const IconComponent = deviceIcons[device.device_type] || Box
  const status = statusConfig[device.status] || statusConfig.available

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await api.patch(`/api/devices/${device.id}/status`, { status: newStatus })
      onRefresh()
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setUpdating(false)
      setStatusDropdownOpen(false)
    }
  }

  const handleDelete = async () => {
    try {
      setUpdating(true)
      await api.delete(`/api/devices/${device.id}`)
      onRefresh()
    } catch (err) {
      console.error("Failed to delete device:", err)
    } finally {
      setUpdating(false)
      setConfirmDelete(false)
    }
  }

  const handleQuickStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Quick Start session for device:", device.id, device.name)
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "bg-card border border-border rounded-card p-4 hover:border-primary/30 transition-all cursor-pointer",
        device.status === "busy" && "breathing-glow"
      )}
    >
      {/* Top Row: Icon + Name + Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              device.status === "available" && "bg-available/10 text-available",
              device.status === "busy" && "bg-busy/10 text-busy",
              device.status === "maintenance" && "bg-maintenance/10 text-maintenance"
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{device.name}</h3>
            <p className="text-text-secondary text-xs">
              {deviceTypeLabels[device.device_type] || device.device_type}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface text-xs">
          <span className={cn("w-2 h-2 rounded-full", status.dotClass)} />
          <span className="text-text-secondary">{status.label}</span>
        </div>
      </div>

      {/* Rates */}
      <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
        <span>
          Single: <span className="text-foreground font-medium">{formatCurrency(device.hourly_rate_single)}/h</span>
        </span>
        <span>
          Multi: <span className="text-foreground font-medium">{formatCurrency(device.hourly_rate_multi)}/h</span>
        </span>
      </div>

      {/* Quick Start Button (only for available devices) */}
      {device.status === "available" && (
        <button
          onClick={handleQuickStart}
          className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary h-9 rounded-button text-xs font-semibold hover:bg-primary/20 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Quick Start
        </button>
      )}

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border space-y-3">
              {/* Device Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface rounded-xl p-2.5">
                  <p className="text-text-secondary mb-0.5">Type</p>
                  <p className="font-medium">
                    {deviceTypeLabels[device.device_type] || device.device_type}
                  </p>
                </div>
                <div className="bg-surface rounded-xl p-2.5">
                  <p className="text-text-secondary mb-0.5">Status</p>
                  <p className="font-medium">{status.label}</p>
                </div>
                <div className="bg-surface rounded-xl p-2.5">
                  <p className="text-text-secondary mb-0.5">Rate (Single)</p>
                  <p className="font-medium">{formatCurrency(device.hourly_rate_single)}/h</p>
                </div>
                <div className="bg-surface rounded-xl p-2.5">
                  <p className="text-text-secondary mb-0.5">Rate (Multi)</p>
                  <p className="font-medium">{formatCurrency(device.hourly_rate_multi)}/h</p>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setStatusDropdownOpen(!statusDropdownOpen)
                  }}
                  disabled={updating}
                  className="w-full flex items-center justify-between bg-surface border border-border rounded-xl h-9 px-3 text-xs font-medium hover:border-primary/30 transition-colors"
                >
                  <span>Change Status</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-text-secondary transition-transform",
                      statusDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {statusDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl overflow-hidden z-10 shadow-card"
                    >
                      {(["available", "busy", "maintenance"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(s)
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-hover transition-colors text-left",
                            device.status === s && "opacity-50 pointer-events-none"
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              statusConfig[s].dotClass
                            )}
                          />
                          {statusConfig[s].label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delete Button (Admin Only) */}
              {isAdmin && (
                <>
                  {!confirmDelete ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDelete(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 text-danger bg-danger/10 h-9 rounded-button text-xs font-semibold hover:bg-danger/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Device
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-warning flex-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Confirm?</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                        }}
                        disabled={updating}
                        className="bg-danger text-white px-3 h-8 rounded-button text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        {updating ? "..." : "Yes, Delete"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(false)
                        }}
                        className="bg-surface border border-border px-3 h-8 rounded-button text-xs font-medium hover:border-primary/30 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
