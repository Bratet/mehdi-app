export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'manager' | 'cashier';
  isActive: boolean;
  establishmentId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  isActive: boolean;
}

export interface Device {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_service';
  deviceType: DeviceType;
  zone: Zone | null;
  ipAddress: string | null;
  notes: string | null;
}

export interface DeviceType {
  id: string;
  name: string;
  icon: string;
}

export interface Zone {
  id: string;
  name: string;
  description: string | null;
}

export interface Session {
  id: string;
  deviceId: string;
  device: Device;
  customerId: string | null;
  status: 'active' | 'paused' | 'completed' | 'auto_closed';
  startedAt: string;
  pausedAt: string | null;
  endedAt: string | null;
  totalPauseDuration: number;
  notes: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFavorite: boolean;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Order {
  id: string;
  sessionId: string | null;
  customerId: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sessionId: string | null;
  orderId: string | null;
  customerId: string | null;
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'partial' | 'cancelled';
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  creditBalance: number;
}

export interface Booking {
  id: string;
  customerId: string;
  deviceTypeId: string;
  deviceId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  mode: 'solo' | 'multiplayer';
  status: 'pending' | 'confirmed' | 'converted' | 'cancelled' | 'no_show';
  depositPaid: boolean;
  depositAmount: number;
  notes: string | null;
}

export interface Notification {
  id: string;
  type: 'session_alert' | 'low_stock' | 'new_booking' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
