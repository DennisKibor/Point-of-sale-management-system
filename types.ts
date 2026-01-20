
export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE';

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  timestamp: string;
  cashierId: string;
  cashierName: string;
  paymentMethod: PaymentMethod;
}

export interface AIInsight {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

export interface StockPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDaysLeft: number;
  status: 'critical' | 'warning' | 'safe';
}
