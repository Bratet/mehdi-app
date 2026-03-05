"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Gamepad2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { Session, Device } from "@/types"
import { cn } from "@/lib/utils"
import SessionCard from "./SessionCard"
import StartSessionModal from "./StartSessionModal"

type Tab = "active" | "completed"

export default function SessionsPage() {
  const [tab, setTab] = useState<Tab>("active")
  const [sessions, setSessions] = useState<Session[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchSessions = useCallback(async (status: Tab) => {
    try {
      setLoading(true)
      const data = await api.get<Session[]>(`/api/sessions?status=${status}`)
      setSessions(data)
    } catch (err) {
      console.error("Failed to fetch sessions:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDevices = useCallback(async () => {
    try {
      const data = await api.get<Device[]>("/api/devices")
      setDevices(data)
    } catch (err) {
      console.error("Failed to fetch devices:", err)
    }
  }, [])

  useEffect(() => {
    fetchSessions(tab)
    fetchDevices()
  }, [tab, fetchSessions, fetchDevices])

  const handleRefresh = () => {
    fetchSessions(tab)
    fetchDevices()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-text-secondary text-sm mt-1">
            {sessions.length} {tab} session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Desktop start button */}
        <button
          onClick={() => setModalOpen(true)}
          className="hidden md:flex items-center gap-2 bg-primary text-background px-4 h-11 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Start Session
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
        {(["active", "completed"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
              tab === t
                ? "bg-primary/20 text-primary"
                : "text-text-secondary hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <Gamepad2 className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {tab === "active"
              ? "No active sessions"
              : "No completed sessions"}
          </h3>
          <p className="text-text-secondary text-sm">
            {tab === "active"
              ? "No active sessions \u2014 time to game!"
              : "Completed sessions will appear here."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SessionCard session={session} onRefresh={handleRefresh} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-primary text-background rounded-full shadow-glow flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Start Session Modal */}
      <StartSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          handleRefresh()
        }}
        devices={devices}
      />
    </div>
  )
}
