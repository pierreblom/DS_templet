// User types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt?: string;
  orderCount?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  hover_image_url?: string;
  stock: number;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

// Order types
export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product_name: string;
  Product?: {
    id: number;
    name: string;
    image_url: string;
    supplier_url?: string;
  };
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: ShippingAddress;
  payment_intent_id: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  User?: User;
  OrderItems?: OrderItem[];
}

// Analytics types
export interface DashboardSummary {
  revenue: number;
  pendingRevenue: number;
  orders: number;
  pendingOrders: number;
  customers: number;
  products: number;
  period: string;
}

export interface SalesData {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface SalesAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  dailyData: SalesData[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

export interface ProductAnalytics {
  bestSellers: Array<{
    product: Product;
    totalSold: number;
    totalRevenue: number;
  }>;
  lowStock: Product[];
  outOfStockCount: number;
  totalProducts: number;
}

export interface OrderAnalytics {
  byStatus: Record<string, number>;
  recentOrders: number;
  pendingOrders: number;
  readyToShip: number;
}

// Pagination types
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API Error type
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// Contact types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  created_at: string;
  updated_at: string;
}
