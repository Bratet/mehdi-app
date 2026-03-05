"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Monitor, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { Device } from "@/types"
import { useAuth } from "@/context/AuthContext"
import DeviceCard from "./DeviceCard"
import AddDeviceModal from "./AddDeviceModal"

export default function DevicesPage() {
  const { isAdmin } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Device[]>("/api/devices")
      setDevices(data)
    } catch (err) {
      console.error("Failed to fetch devices:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const handleRefresh = () => {
    fetchDevices()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Devices</h1>
          <p className="text-text-secondary text-sm mt-1">
            {devices.length} device{devices.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Desktop Add Button */}
        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-primary text-background px-4 h-10 rounded-button font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : devices.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <Monitor className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No devices yet</h3>
          <p className="text-text-secondary text-sm">
            Add your first device to get started
          </p>
        </motion.div>
      ) : (
        /* Device Grid */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DeviceCard device={device} onRefresh={handleRefresh} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mobile FAB */}
      {isAdmin && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary text-background rounded-full shadow-glow flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Add Device Modal */}
      <AddDeviceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          handleRefresh()
        }}
      />
    </div>
  )
}
