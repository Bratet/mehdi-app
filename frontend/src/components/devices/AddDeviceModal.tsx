"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { Device } from "@/types"
import { cn } from "@/lib/utils"

interface AddDeviceModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  device?: Device
}

const deviceTypeOptions = [
  { value: "playstation", label: "PlayStation" },
  { value: "pc", label: "PC" },
  { value: "xbox", label: "Xbox" },
  { value: "billiards", label: "Billiards" },
  { value: "ping_pong", label: "Ping Pong" },
  { value: "custom", label: "Custom" },
]

export default function AddDeviceModal({
  open,
  onClose,
  onSuccess,
  device,
}: AddDeviceModalProps) {
  const isEdit = !!device
  const [name, setName] = useState("")
  const [deviceType, setDeviceType] = useState("playstation")
  const [hourlyRateSingle, setHourlyRateSingle] = useState("")
  const [hourlyRateMulti, setHourlyRateMulti] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (device) {
      setName(device.name)
      setDeviceType(device.device_type)
      setHourlyRateSingle(device.hourly_rate_single.toString())
      setHourlyRateMulti(device.hourly_rate_multi.toString())
    } else {
      setName("")
      setDeviceType("playstation")
      setHourlyRateSingle("")
      setHourlyRateMulti("")
    }
    setError("")
  }, [device, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Device name is required")
      return
    }

    const rateSingle = parseFloat(hourlyRateSingle)
    const rateMulti = parseFloat(hourlyRateMulti)

    if (isNaN(rateSingle) || rateSingle <= 0) {
      setError("Valid single rate is required")
      return
    }

    if (isNaN(rateMulti) || rateMulti <= 0) {
      setError("Valid multi rate is required")
      return
    }

    const payload = {
      name: name.trim(),
      device_type: deviceType,
      hourly_rate_single: rateSingle,
      hourly_rate_multi: rateMulti,
    }

    try {
      setSubmitting(true)
      if (isEdit && device) {
        await api.put(`/api/devices/${device.id}`, payload)
      } else {
        await api.post("/api/devices", payload)
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative z-10 w-full bg-surface border border-border",
              // Desktop: centered rounded modal
              "md:max-w-md md:mx-4 md:rounded-2xl",
              // Mobile: bottom sheet
              "max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:rounded-t-3xl max-md:max-h-[85vh] max-md:overflow-y-auto"
            )}
          >
            {/* Drag Handle (mobile) */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-lg font-bold">
                {isEdit ? "Edit Device" : "Add Device"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
              {/* Error */}
              {error && (
                <div className="bg-danger/10 text-danger text-sm px-3 py-2 rounded-xl">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Device Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. PS5 - Station 1"
                  className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm outline-none focus:border-primary transition-colors placeholder:text-text-secondary/50"
                />
              </div>

              {/* Device Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Device Type
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  {deviceTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    Rate (Single)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={hourlyRateSingle}
                    onChange={(e) => setHourlyRateSingle(e.target.value)}
                    placeholder="DH/h"
                    className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm outline-none focus:border-primary transition-colors placeholder:text-text-secondary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    Rate (Multi)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={hourlyRateMulti}
                    onChange={(e) => setHourlyRateMulti(e.target.value)}
                    placeholder="DH/h"
                    className="w-full bg-background border border-border rounded-xl h-11 px-4 text-sm outline-none focus:border-primary transition-colors placeholder:text-text-secondary/50"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-background rounded-xl h-11 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Update Device" : "Add Device"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
