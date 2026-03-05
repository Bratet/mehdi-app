"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  Sun,
  Moon,
  User,
  Globe,
  Download,
  Upload,
  Info,
  Shield,
  AlertCircle,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { api } from "@/lib/api"

export default function SettingsPage() {
  const { user, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await api.get<Record<string, unknown>>("/api/backup/export")
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `game-center-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportStatus("idle")
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await api.post("/api/backup/import", data)
      setImportStatus("success")
      setTimeout(() => setImportStatus("idle"), 3000)
    } catch (err) {
      console.error("Import failed:", err)
      setImportStatus("error")
      setTimeout(() => setImportStatus("idle"), 3000)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your preferences</p>
      </div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-[16px] p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          {theme === "dark" ? (
            <Moon className="w-5 h-5 text-primary" />
          ) : (
            <Sun className="w-5 h-5 text-primary" />
          )}
          <h2 className="font-semibold">Appearance</h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => theme !== "dark" && toggleTheme()}
            className={cn(
              "flex-1 rounded-xl border-2 p-3 transition-all",
              theme === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            )}
          >
            <div className="w-full h-20 rounded-lg bg-[#0A0A0F] border border-[#1A1A2E] mb-2 flex items-center justify-center">
              <Moon className="w-6 h-6 text-[#00D4FF]" />
            </div>
            <p className="text-sm font-medium text-center">Dark</p>
          </button>

          <button
            onClick={() => theme !== "light" && toggleTheme()}
            className={cn(
              "flex-1 rounded-xl border-2 p-3 transition-all",
              theme === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/80"
            )}
          >
            <div className="w-full h-20 rounded-lg bg-[#F8F9FA] border border-[#E2E8F0] mb-2 flex items-center justify-center">
              <Sun className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <p className="text-sm font-medium text-center">Light</p>
          </button>
        </div>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border rounded-[16px] p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Account</h2>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Username</span>
              <span className="text-sm font-medium">{user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Role</span>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  user.role === "admin"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary/10 text-secondary"
                )}
              >
                <Shield className="w-3 h-3 inline mr-1" />
                {user.role === "admin" ? "Admin" : "Cashier"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Member since</span>
              <span className="text-sm font-medium">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Not logged in</p>
        )}
      </motion.div>

      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-[16px] p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Language</h2>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-3">
              <span className="text-lg">EN</span>
              <span className="text-sm font-medium">English</span>
            </div>
            <Check className="w-4 h-4 text-primary" />
          </button>

          <button
            disabled
            className="w-full flex items-center justify-between p-3 rounded-xl border border-border opacity-50 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">AR</span>
              <span className="text-sm font-medium">Arabic</span>
            </div>
            <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full">
              Coming soon
            </span>
          </button>
        </div>
      </motion.div>

      {/* Backup (admin only) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-[16px] p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Backup & Restore</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-background rounded-xl h-11 px-6 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export Backup (JSON)"}
            </button>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-xl h-11 px-6 font-semibold text-sm cursor-pointer transition-opacity border border-border hover:bg-surface",
                  importing && "opacity-50 pointer-events-none"
                )}
              >
                <Upload className="w-4 h-4" />
                {importing ? "Importing..." : "Import Backup (JSON)"}
              </label>
            </div>

            {importStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-available text-sm"
              >
                <Check className="w-4 h-4" />
                Backup imported successfully
              </motion.div>
            )}

            {importStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-danger text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                Failed to import backup
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-[16px] p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">About</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">App Name</span>
            <span className="text-sm font-medium">Game Center</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Version</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
