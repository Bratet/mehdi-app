export interface User {
  id: number
  username: string
  role: "admin" | "cashier"
  created_at: string
}

export interface Device {
  id: number
  name: string
  device_type: "playstation" | "pc" | "billiards" | "ping_pong" | "xbox" | "custom"
  status: "available" | "busy" | "maintenance"
  hourly_rate_single: number
  hourly_rate_multi: number
  icon: string | null
  created_at: string
}

export interface SessionProduct {
  id: number
  session_id: number
  product_id: number
  product_name: string
  quantity: number
  price_at_time: number
}

export interface Session {
  id: number
  device_id: number
  device: Device
  mode: "single" | "multiplayer"
  start_time: string
  planned_duration_minutes: number
  extended_minutes: number
  single_minutes_used: number
  multi_minutes_used: number
  session_products: SessionProduct[]
  status: "active" | "completed" | "cancelled"
  total_cost: number
  payment_method: string | null
  created_at: string
}

export interface Product {
  id: number
  name: string
  category: "hot_drinks" | "cold_drinks" | "snacks" | "meals"
  price: number
  image_url: string | null
  in_stock: boolean
  created_at: string
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Invoice {
  id: number
  session_id: number
  device_name: string
  session_duration: string
  session_cost: number
  products_cost: number
  total_cost: number
  payment_method: string
  items: InvoiceItem[]
  created_at: string
}

export interface Expense {
  id: number
  title: string
  amount: number
  category: "rent" | "utilities" | "supplies" | "salaries" | "maintenance" | "other"
  notes: string | null
  date: string
  created_at: string
}

export interface DashboardSummary {
  today_revenue: number
  active_sessions: number
  total_sessions_today: number
  net_profit: number
}

export interface RevenueData {
  date: string
  revenue: number
}

export interface SessionStats {
  date: string
  count: number
}

export interface ProductSales {
  product_name: string
  total_sold: number
  revenue: number
}

export interface DeviceUsage {
  device_name: string
  total_sessions: number
  total_hours: number
}

export interface ExpenseSummary {
  category: string
  total_amount: number
}
