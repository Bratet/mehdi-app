"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Clock,
  Users,
  User,
  Plus,
  Shuffle,
  ArrowRightLeft,
  Square,
  Loader2,
  ShoppingBag,
  X,
  CreditCard,
  Banknote,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Session, Product, Device } from "@/types"
import { cn, formatCurrency, formatDuration } from "@/lib/utils"
import SessionTimer from "./SessionTimer"

interface SessionDetailProps {
  sessionId: number
}

type Overlay = null | "extend" | "product" | "transfer" | "end"

export default function SessionDetail({ sessionId }: SessionDetailProps) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Data for overlays
  const [products, setProducts] = useState<Product[]>([])
  const [availableDevices, setAvailableDevices] = useState<Device[]>([])

  const fetchSession = useCallback(async () => {
    try {
      const data = await api.get<Session>(`/api/sessions/${sessionId}`)
      setSession(data)
    } catch (err) {
      console.error("Failed to fetch session:", err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // --- Actions ---

  const handleExtend = async (minutes: number) => {
    setActionLoading(true)
    try {
      await api.post(`/api/sessions/${sessionId}/extend`, {
        additional_minutes: minutes,
      })
      await fetchSession()
      setOverlay(null)
    } catch (err) {
      console.error("Failed to extend:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddProduct = async (productId: number) => {
    setActionLoading(true)
    try {
      await api.post(`/api/sessions/${sessionId}/add-product`, {
        product_id: productId,
        quantity: 1,
      })
      await fetchSession()
      setOverlay(null)
    } catch (err) {
      console.error("Failed to add product:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSwitchMode = async () => {
    setActionLoading(true)
    try {
      await api.post(`/api/sessions/${sessionId}/switch-mode`)
      await fetchSession()
    } catch (err) {
      console.error("Failed to switch mode:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleTransfer = async (deviceId: number) => {
    setActionLoading(true)
    try {
      await api.post(`/api/sessions/${sessionId}/transfer`, {
        target_device_id: deviceId,
      })
      await fetchSession()
      setOverlay(null)
    } catch (err) {
      console.error("Failed to transfer:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnd = async (paymentMethod: string) => {
    setActionLoading(true)
    try {
      await api.post(`/api/sessions/${sessionId}/end`, {
        payment_method: paymentMethod,
      })
      router.push("/sessions")
    } catch (err) {
      console.error("Failed to end session:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Fetch overlay data on demand
  const openOverlay = async (type: Overlay) => {
    setOverlay(type)
    if (type === "product" && products.length === 0) {
      try {
        const data = await api.get<Product[]>("/api/products")
        setProducts(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
      }
    }
    if (type === "transfer" && availableDevices.length === 0) {
      try {
        const data = await api.get<Device[]>("/api/devices")
        setAvailableDevices(data.filter((d) => d.status === "available"))
      } catch (err) {
        console.error("Failed to fetch devices:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-4 md:p-6 text-center py-20">
        <p className="text-text-secondary">Session not found.</p>
      </div>
    )
  }

  const totalMinutes = session.planned_duration_minutes + session.extended_minutes

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-foreground text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Timer hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <SessionTimer
          startTime={session.start_time}
          plannedMinutes={session.planned_duration_minutes}
          extendedMinutes={session.extended_minutes}
          size="lg"
        />
      </motion.div>

      {/* Session info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-card p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Device</span>
          <span className="text-foreground font-medium text-sm">
            {session.device?.name ?? `Device #${session.device_id}`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Mode</span>
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
            {session.mode === "multiplayer" ? "Multiplayer" : "Single"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Start Time</span>
          <span className="text-foreground text-sm">
            {new Date(session.start_time).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Duration</span>
          <span className="text-foreground text-sm">
            {formatDuration(totalMinutes)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Cost so far</span>
          <span className="text-primary font-semibold text-sm">
            {formatCurrency(session.total_cost)}
          </span>
        </div>
      </motion.div>

      {/* Products list */}
      {session.session_products && session.session_products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-card p-4"
        >
          <h3 className="text-foreground font-semibold text-sm mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-text-secondary" />
            Products
          </h3>
          <div className="space-y-2">
            {session.session_products.map((sp) => (
              <div
                key={sp.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">
                  {sp.product_name}
                  {sp.quantity > 1 && (
                    <span className="text-text-secondary ml-1">
                      x{sp.quantity}
                    </span>
                  )}
                </span>
                <span className="text-text-secondary">
                  {formatCurrency(sp.price_at_time * sp.quantity)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      {session.status === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => openOverlay("extend")}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Extend Time
          </button>
          <button
            onClick={() => openOverlay("product")}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-secondary/15 text-secondary text-sm font-semibold hover:bg-secondary/25 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={handleSwitchMode}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-warning/15 text-warning text-sm font-semibold hover:bg-warning/25 transition-colors disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" />
            Switch Mode
          </button>
          <button
            onClick={() => openOverlay("transfer")}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-surface text-foreground text-sm font-semibold hover:bg-surface-hover transition-colors border border-border"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer
          </button>
          <button
            onClick={() => openOverlay("end")}
            className="col-span-2 flex items-center justify-center gap-2 h-11 rounded-xl bg-danger text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Square className="w-4 h-4" />
            End Session
          </button>
        </motion.div>
      )}

      {/* Overlays */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center"
            onClick={() => !actionLoading && setOverlay(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border w-full md:max-w-md md:rounded-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
            >
              {/* Close button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold text-lg">
                  {overlay === "extend" && "Extend Time"}
                  {overlay === "product" && "Add Product"}
                  {overlay === "transfer" && "Transfer to Device"}
                  {overlay === "end" && "End Session"}
                </h3>
                <button
                  onClick={() => setOverlay(null)}
                  className="text-text-secondary hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Extend overlay */}
              {overlay === "extend" && (
                <div className="grid grid-cols-3 gap-3">
                  {[15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleExtend(mins)}
                      disabled={actionLoading}
                      className="h-14 rounded-xl bg-card border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                      +{mins} min
                    </button>
                  ))}
                </div>
              )}

              {/* Product picker overlay */}
              {overlay === "product" && (
                <div className="grid grid-cols-2 gap-3">
                  {products.filter((p) => p.in_stock).length === 0 ? (
                    <p className="col-span-2 text-text-secondary text-sm text-center py-8">
                      No products available.
                    </p>
                  ) : (
                    products
                      .filter((p) => p.in_stock)
                      .map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProduct(product.id)}
                          disabled={actionLoading}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors disabled:opacity-50"
                        >
                          <span className="text-foreground text-sm font-medium truncate w-full text-center">
                            {product.name}
                          </span>
                          <span className="text-primary text-xs font-semibold">
                            {formatCurrency(product.price)}
                          </span>
                        </button>
                      ))
                  )}
                </div>
              )}

              {/* Transfer overlay */}
              {overlay === "transfer" && (
                <div className="space-y-2">
                  {availableDevices.length === 0 ? (
                    <p className="text-text-secondary text-sm text-center py-8">
                      No available devices.
                    </p>
                  ) : (
                    availableDevices.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => handleTransfer(device.id)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors disabled:opacity-50"
                      >
                        <span className="text-foreground text-sm font-medium">
                          {device.name}
                        </span>
                        <span className="text-text-secondary text-xs capitalize">
                          {device.device_type.replace("_", " ")}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* End session overlay */}
              {overlay === "end" && (
                <div className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    Choose a payment method to end this session.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEnd("cash")}
                      disabled={actionLoading}
                      className="flex-1 flex flex-col items-center gap-2 h-20 rounded-xl bg-card border border-border hover:border-secondary transition-colors disabled:opacity-50 justify-center"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
                      ) : (
                        <>
                          <Banknote className="w-5 h-5 text-secondary" />
                          <span className="text-foreground text-sm font-medium">
                            Cash
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEnd("digital")}
                      disabled={actionLoading}
                      className="flex-1 flex flex-col items-center gap-2 h-20 rounded-xl bg-card border border-border hover:border-primary transition-colors disabled:opacity-50 justify-center"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-sm font-medium">
                            Digital
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-center text-primary font-semibold text-lg">
                    Total: {formatCurrency(session.total_cost)}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
