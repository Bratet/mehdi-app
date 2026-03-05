"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Users, User, Square, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Session } from "@/types"
import { cn, formatCurrency } from "@/lib/utils"
import SessionTimer from "./SessionTimer"

interface SessionCardProps {
  session: Session
  onRefresh: () => void
}

export default function SessionCard({ session, onRefresh }: SessionCardProps) {
  const router = useRouter()
  const [ending, setEnding] = useState(false)
  const [extending, setExtending] = useState(false)

  const handleEnd = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (ending) return
    setEnding(true)
    try {
      await api.post(`/api/sessions/${session.id}/end`, {
        payment_method: "cash",
      })
      onRefresh()
    } catch (err) {
      console.error("Failed to end session:", err)
    } finally {
      setEnding(false)
    }
  }

  const handleExtend = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (extending) return
    setExtending(true)
    try {
      await api.post(`/api/sessions/${session.id}/extend`, {
        additional_minutes: 15,
      })
      onRefresh()
    } catch (err) {
      console.error("Failed to extend session:", err)
    } finally {
      setExtending(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/sessions/${session.id}`)}
      className={cn(
        "bg-card border border-border rounded-card p-4 cursor-pointer",
        "hover:shadow-card-hover transition-shadow",
        session.status === "active" && "breathing-glow"
      )}
    >
      {/* Header: device name + mode badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground font-semibold text-sm truncate">
          {session.device?.name ?? `Device #${session.device_id}`}
        </h3>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
            session.mode === "multiplayer"
              ? "bg-primary/15 text-primary"
              : "bg-secondary/15 text-secondary"
          )}
        >
          {session.mode === "multiplayer" ? (
            <Users className="w-3 h-3" />
          ) : (
            <User className="w-3 h-3" />
          )}
          {session.mode === "multiplayer" ? "Multi" : "Single"}
        </span>
      </div>

      {/* Timer */}
      <div className="flex justify-center my-2">
        <SessionTimer
          startTime={session.start_time}
          plannedMinutes={session.planned_duration_minutes}
          extendedMinutes={session.extended_minutes}
          size="sm"
        />
      </div>

      {/* Cost */}
      <p className="text-center text-text-secondary text-xs mt-2">
        <Clock className="w-3 h-3 inline mr-1" />
        {formatCurrency(session.total_cost)} so far
      </p>

      {/* Quick actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleEnd}
          disabled={ending}
          className="flex-1 flex items-center justify-center gap-1 h-9 rounded-xl bg-danger/15 text-danger text-xs font-semibold hover:bg-danger/25 transition-colors disabled:opacity-50"
        >
          {ending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
          End
        </button>
        <button
          onClick={handleExtend}
          disabled={extending}
          className="flex-1 flex items-center justify-center gap-1 h-9 rounded-xl bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors disabled:opacity-50"
        >
          {extending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          +15 min
        </button>
      </div>
    </motion.div>
  )
}
