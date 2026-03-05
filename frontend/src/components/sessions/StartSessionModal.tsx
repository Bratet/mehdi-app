"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  User,
  Users,
  Loader2,
  Monitor,
  Gamepad2,
} from "lucide-react"
import { api } from "@/lib/api"
import { Device } from "@/types"
import { cn, formatCurrency } from "@/lib/utils"

interface StartSessionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  devices: Device[]
}

const QUICK_DURATIONS = [30, 60, 90, 120]

const deviceTypeIcons: Record<string, typeof Monitor> = {
  playstation: Gamepad2,
  xbox: Gamepad2,
  pc: Monitor,
  billiards: Monitor,
  ping_pong: Monitor,
  custom: Monitor,
}

export default function StartSessionModal({
  open,
  onClose,
  onSuccess,
  devices,
}: StartSessionModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null)
  const [mode, setMode] = useState<"single" | "multiplayer">("single")
  const [duration, setDuration] = useState(60)
  const [customDuration, setCustomDuration] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const availableDevices = useMemo(
    () => devices.filter((d) => d.status === "available"),
    [devices]
  )

  const selectedDeviceData = useMemo(
    () => devices.find((d) => d.id === selectedDevice),
    [devices, selectedDevice]
  )

  const effectiveDuration = customDuration ? parseInt(customDuration, 10) || 0 : duration

  const costPreview = useMemo(() => {
    if (!selectedDeviceData || effectiveDuration <= 0) return 0
    const rate =
      mode === "multiplayer"
        ? selectedDeviceData.hourly_rate_multi
        : selectedDeviceData.hourly_rate_single
    return (rate / 60) * effectiveDuration
  }, [selectedDeviceData, mode, effectiveDuration])

  const handleSubmit = async () => {
    if (!selectedDevice || effectiveDuration <= 0) return
    setSubmitting(true)
    try {
      await api.post("/api/sessions", {
        device_id: selectedDevice,
        mode,
        planned_duration_minutes: effectiveDuration,
      })
      // Reset form
      setSelectedDevice(null)
      setMode("single")
      setDuration(60)
      setCustomDuration("")
      onSuccess()
    } catch (err) {
      console.error("Failed to start session:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border w-full md:max-w-lg md:rounded-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-foreground font-bold text-lg">
                Start Session
              </h2>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select device */}
            <div className="mb-5">
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">
                Select Device
              </label>
              {availableDevices.length === 0 ? (
                <p className="text-text-secondary text-sm py-4 text-center">
                  No available devices right now.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableDevices.map((device) => {
                    const Icon = deviceTypeIcons[device.device_type] || Monitor
                    return (
                      <button
                        key={device.id}
                        onClick={() => setSelectedDevice(device.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border text-left transition-colors",
                          selectedDevice === device.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-text-secondary"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            selectedDevice === device.id
                              ? "text-primary"
                              : "text-text-secondary"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">
                            {device.name}
                          </p>
                          <p className="text-text-secondary text-[11px] capitalize">
                            {device.device_type.replace("_", " ")}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Mode */}
            <div className="mb-5">
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">
                Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("single")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-colors",
                    mode === "single"
                      ? "border-secondary bg-secondary/15 text-secondary"
                      : "border-border bg-card text-text-secondary hover:text-foreground"
                  )}
                >
                  <User className="w-4 h-4" />
                  Single
                </button>
                <button
                  onClick={() => setMode("multiplayer")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-colors",
                    mode === "multiplayer"
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card text-text-secondary hover:text-foreground"
                  )}
                >
                  <Users className="w-4 h-4" />
                  Multiplayer
                </button>
              </div>
            </div>

            {/* Step 3: Duration */}
            <div className="mb-5">
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">
                Duration
              </label>
              <div className="flex gap-2 mb-3">
                {QUICK_DURATIONS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setDuration(mins)
                      setCustomDuration("")
                    }}
                    className={cn(
                      "flex-1 h-10 rounded-xl border text-sm font-semibold transition-colors",
                      !customDuration && duration === mins
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-text-secondary hover:text-foreground"
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Custom minutes..."
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  min={1}
                  className="w-full h-10 rounded-xl bg-card border border-border px-3 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Cost preview */}
            {selectedDeviceData && effectiveDuration > 0 && (
              <div className="mb-5 bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  Estimated cost
                </span>
                <span className="text-primary font-bold text-lg">
                  {formatCurrency(costPreview)}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedDevice || effectiveDuration <= 0 || submitting}
              className="w-full h-11 bg-primary text-background rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Start Session"
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
