import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} DH`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function getDeviceIcon(deviceType: string): string {
  const icons: Record<string, string> = {
    playstation: "gamepad-2",
    xbox: "gamepad",
    pc: "monitor",
    billiards: "circle-dot",
    ping_pong: "activity",
    custom: "box",
  }
  return icons[deviceType] || "box"
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "text-available"
    case "busy":
      return "text-busy"
    case "maintenance":
      return "text-maintenance"
    default:
      return "text-text-secondary"
  }
}

export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    hot_drinks: "☕",
    cold_drinks: "🥤",
    snacks: "🍿",
    meals: "🍔",
  }
  return emojis[category] || "📦"
}

export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    rent: "Rent",
    utilities: "Utilities",
    supplies: "Supplies",
    salaries: "Salaries",
    maintenance: "Maintenance",
    other: "Other",
  }
  return labels[category] || category
}
