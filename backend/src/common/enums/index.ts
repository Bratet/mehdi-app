export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
}

export enum DeviceStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  AUTO_CLOSED = 'auto_closed',
}

export enum SessionMode {
  SOLO = 'solo',
  MULTIPLAYER = 'multiplayer',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  CLIENT_CREDIT = 'client_credit',
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum LoyaltyTransactionType {
  EARN = 'earn',
  REDEEM = 'redeem',
}

export enum LoyaltyRewardType {
  FREE_HOURS = 'free_hours',
  FREE_PRODUCT = 'free_product',
  DISCOUNT = 'discount',
}

export enum NotificationType {
  SESSION_ALERT = 'session_alert',
  LOW_STOCK = 'low_stock',
  NEW_BOOKING = 'new_booking',
  SYSTEM = 'system',
}
