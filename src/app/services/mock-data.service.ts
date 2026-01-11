import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// Interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: 'platform_owner' | 'restaurant_owner' | 'restaurant_manager' | 'cashier' | 'kitchen_manager' | 'waiter' | 'customer';
  avatar?: string;
  restaurant_id?: string;
  member_since?: Date;
  created_at?: Date;
  updated_at?: Date;
  is_active: string;
  last_login?: Date;
  created_by?: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  role_id: string;
  description: string;
  is_active: boolean;
  is_system_role: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  isAvailable: boolean;
  isActive?: boolean;
  isVegetarian: boolean;
  isVeg?: boolean;
  isSpicy: boolean;
  isPopular?: boolean;
  preparationTime: number;
  discount?: any;
  allergens?: string[];
  customizations?: MenuCustomization[];
}

export interface MenuCustomization {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'served' | 'completed' | 'cancelled' | 'billing_requested';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  specialInstructions?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  orderType?: 'dine_in' | 'takeaway' | 'delivery';
  estimatedReadyTime?: Date;
  deliveredAt?: Date;
  priority?: 'low' | 'medium' | 'high';
  taxAmount?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  customizations?: OrderCustomization[];
  specialInstructions?: string;
  status?: string;
}

export interface OrderCustomization {
  customizationId: string;
  customizationName: string;
  optionId: string;
  optionName: string;
  additionalPrice: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'staff' | 'inventory' | 'payment' | 'promotion';
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read';
  timestamp: Date;
  recipientId?: string;
  recipientRole?: string;
  icon?: string;
  isRead?: boolean;
  relatedOrder?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unitCost: number;
  supplier?: string;
  description?: string;
  icon: string;
  lastUpdated: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'prepared' | 'prepare_on_order';
  prepTime: number; // in minutes
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  costPerServing: number;
  isActive: boolean;
  menuItemId?: string; // Link to menu item
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Offer {
  id: string;
  name: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_one_get_one' | 'free_item' | 'loyalty';
  value: number;
  discountValue: number;
  minOrderValue?: number;
  applicableItems?: string[];
  applicableCategories?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
  maxUsage?: number;
  redemptions?: number;
  revenueGenerated?: number;
}

export interface Customer {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  memberSince?: Date;
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  favoriteItems?: string[];
  addresses?: CustomerAddress[];
  preferences?: CustomerPreferences;
  isGuest?: boolean;
}

export interface CustomerAddress {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerPreferences {
  notifications: boolean;
  dietaryRestrictions: string[];
  favoriteCategories: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'cashier' | 'kitchen_manager' | 'waiter' | 'restaurant_manager';
  avatar: string;
  restaurantId: string;
  hireDate: Date;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  skills: string[];
  performanceRating: number;
  lastLogin?: Date;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface ShiftSchedule {
  id: string;
  staffId: string;
  staffName: string;
  date: Date;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'absent' | 'late';
  checkInTime?: Date;
  checkOutTime?: Date;
  hoursWorked?: number;
  notes?: string;
}

export interface ShiftReport {
  id: string;
  date: Date;
  shift: 'morning' | 'afternoon' | 'evening' | 'night';
  staffCount: number;
  totalHours: number;
  ordersProcessed: number;
  revenue: number;
  customerComplaints: number;
  incidents: string[];
  notes: string;
  managerApproval?: boolean;
}

export interface RestaurantSettings {
  id: string;
  restaurantId: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  taxSettings: {
    gstNumber: string;
    gstPercentage: number;
    serviceChargePercentage: number;
  };
  paymentSettings: {
    acceptedPayments: string[];
    defaultPayment: string;
    tipEnabled: boolean;
    tipOptions: number[];
  };
  operationalSettings: {
    tableCount: number;
    avgServiceTime: number;
    reservationEnabled: boolean;
    onlineOrderingEnabled: boolean;
    loyaltyProgramEnabled: boolean;
  };
  notifications: {
    lowStockAlerts: boolean;
    orderAlerts: boolean;
    paymentAlerts: boolean;
    staffAlerts: boolean;
  };
}

export interface MenuAccess {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  allowedRoles: (User['role'] | 'all')[];
  allowedUsers?: string[]; // specific user IDs if needed
  permissions?: string[]; // additional permissions like 'create', 'update', etc.
}

export interface NavigationMenu {
  id: string;
  name: string;
  parentId?: string; // null for root level
  rolePermissions: { [role: string]: MenuAccess }; // Permissions per role
  path?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  type?: 'parent' | 'action'; // Menu type: parent container or action item (optional for backward compatibility)
  children?: NavigationMenu[];
}

export interface CashTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'float_start' | 'float_end' | 'safe_deposit' | 'change_fund';
  amount: number;
  description: string;
  timestamp: Date;
  cashierId: string;
  cashierName: string;
  approvedBy?: string;
  reference?: string;
}

export interface CashDrawer {
  id: string;
  cashierId: string;
  cashierName: string;
  startingFloat: number;
  currentBalance: number;
  lastUpdated: Date;
  status: 'active' | 'reconciled' | 'closed';
}

export interface ShiftReconciliation {
  id: string;
  shiftId: string;
  cashierId: string;
  cashierName: string;
  date: Date;
  startingFloat: number;
  cashSales: number;
  expectedEndingBalance: number;
  actualCount: number;
  variance: number;
  status: 'pending' | 'approved' | 'rejected';
  reconciledBy?: string;
  reconciledAt?: Date;
  notes?: string;
}

export interface CashierStats {
  todaysSales: number;
  pendingBills: number;
  activeTables: number;
  shiftHours: number;
  transactionsToday: number;
  avgTransactionValue: number;
}

export interface QuickAction {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: string;
}

export interface RecentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface FoodMenuCategory {
  key: string;
  name: string;
  icon: string;
  isActive: boolean;
  items: MenuItem[];
}

export interface OrderTypeTab {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface DineInSubTab {
  id: string;
  name: string;
  active: boolean;
}

export interface OnlineOrderEntry {
  platform: string;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
}

export interface CashierSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  enableCashDrawer: boolean;
  cashDrawerPort: string;
  autoOpenDrawer: boolean;
  cashAlertThreshold: number;
  sessionTimeout: number;
  requirePasswordForSettings: boolean;
  enableBiometricLogin: boolean;
  auditTrailEnabled: boolean;
  orderReadySound: boolean;
  paymentSuccessSound: boolean;
  errorAlerts: boolean;
  lowCashAlerts: boolean;
  shortcuts: { [key: string]: string };
}

export interface Printer {
  id: string;
  name: string;
  type: 'thermal' | 'laser' | 'dot_matrix';
  status: 'online' | 'offline' | 'error';
}

export interface CashierShiftReport {
  id: string;
  cashierId: string;
  cashierName: string;
  shiftStart: Date;
  shiftEnd: Date;
  reportType: 'X' | 'Z';
  totalSales: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  walletSales: number;
  totalTransactions: number;
  averageTransaction: number;
  openingCash: number;
  cashReceived: number;
  cashPaidOut: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  voidedItems: number;
  voidedAmount: number;
  discountsApplied: number;
  discountAmount: number;
  refundsProcessed: number;
  refundAmount: number;
  status: 'open' | 'closed' | 'reconciled';
  generatedAt: Date;
}

export interface PaymentMethodSummary {
  method: string;
  amount: number;
  percentage: number;
  transactions: number;
  color: string;
}

export interface HourlySalesData {
  hour: string;
  sales: number;
  transactions: number;
}

export interface TransactionSearchResult {
  orderId: string;
  customerName: string;
  tableNumber: string;
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'refunded' | 'voided' | 'pending';
  timestamp: Date;
  cashierName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  modifications?: Array<{
    type: 'void' | 'discount' | 'refund';
    amount: number;
    reason: string;
    timestamp: Date;
  }>;
}

export interface SearchFilters {
  orderId: string;
  customerName: string;
  tableNumber: string;
  paymentMethod: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  amountMin: number;
  amountMax: number;
  cashierName: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface LowStockAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
}

export interface ItemForm {
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitCost: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplier?: string;
  description?: string;
}

export interface StockAdjustment {
  type: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface AnalyticsData {
  totalOrders?: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgPrepTime?: number;
  popularItems?: PopularItem[];
  hourlyDistribution: HourlyData[];
  dailyTrends: DailyData[];
  statusDistribution?: StatusData[];
  customerSatisfaction ?: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  aovGrowth?: number;
  satisfactionGrowth?: number;
}

export interface PopularItem {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

export interface DailyData {
  date: string;
  orders: number;
  revenue: number;
}

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  avgPrepTime: number;
  totalRevenue: number;
  processing : number
}

export interface RecentOrder {
  id: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  estimatedReadyTime?: Date;
}

export interface OrderStatus {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export interface OrderStatusConfig {
  status: string;
  label: string;
  icon: string;
  borderClass: string;
  badgeClass: string;
  text: string;
}

export interface OrderFilterOption {
  value: string;
  label: string;
  active: boolean;
}

export interface OrderSortOption {
  value: string;
  label: string;
}

export interface KitchenStats {
  totalOrders?: number;
  preparing: number;
  ready: number;
  avgPrepTime: number;
}

export interface KitchenStaff {
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'break';
  currentTask: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  permissions: string[];
  rateLimit: number;
  status: 'active' | 'inactive' | 'expired';
  usage: {
    requests: number;
    limit: number;
    resetDate: Date;
  };
}

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  category: 'authentication' | 'restaurants' | 'orders' | 'users' | 'analytics' | 'webhooks';
  version: string;
  rateLimit: number;
  requiresAuth: boolean;
  status: 'active' | 'deprecated' | 'maintenance';
  lastCalled?: Date;
  callCount: number;
}

export interface APIMetrics {
  totalRequests: number;
  activeKeys: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  topEndpoints: { endpoint: string; calls: number }[];
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'promotion' | 'maintenance' | 'emergency' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  targetAudience: 'all' | 'restaurants' | 'customers' | 'staff' | 'specific';
  sentBy: string;
  sentAt?: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  totalRecipients: number;
  readCount: number;
  engagementRate: number;
  deliveryStatus: 'pending' | 'sending' | 'completed' | 'failed';
  attachments?: string[];
  ctaText?: string;
  ctaUrl?: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium';
  module: string;
  isEnabled: boolean;
  requiresPlan: string[];
  dependencies?: string[];
  restrictions?: {
    maxUsage?: number;
    timeLimit?: number;
    userLimit?: number;
  };
}

export interface PlanFeatureAccess {
  planId: string;
  planName: string;
  features: { [featureId: string]: boolean };
  limits: { [featureId: string]: any };
}

export interface RoleFeatureAccess {
  roleId: string;
  roleName: string;
  features: { [featureId: string]: boolean };
  permissions: { [featureId: string]: string[] };
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'delivery' | 'communication' | 'analytics' | 'social' | 'pos';
  provider: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: Date;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    additionalSettings?: { [key: string]: any };
  };
  features: string[];
  pricing?: {
    plan: string;
    cost: number;
    billingCycle: 'monthly' | 'yearly';
  };
}

export interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  failedSyncs: number;
  dataTransferred: number;
  uptime: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  maxRestaurants: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriberCount: number;
  revenue: number;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium';
  isEnabled: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  email: string;
  phone: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  subscription_plan: string;
  subscription_start_date: Date;
  subscription_end_date: Date;
  gst_number: string;
  license_number: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  is_active: boolean;
  description: string;
  state: number;
  city: string;
  pincode: number;
  address: string;
  lat: number;
  long: number;
  logo_image?: string;
  created_at: Date;
  created_by: number;
  updated_at: Date | null;
  updated_by: number;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'encryption' | 'monitoring' | 'compliance';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  violations?: number;
}

export interface SecurityLog {
  id: string;
  timestamp: Date;
  event: string;
  user: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
  details: string;
}

export interface SecurityMetrics {
  totalUsers: number;
  activeSessions: number;
  failedLoginAttempts: number;
  blockedIPs: number;
  securityAlerts: number;
  lastSecurityScan: Date;
  complianceScore: number;
}

export interface SubscriptionMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalSubscribers: number;
  activeSubscribers: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionRate: number;
}

export interface PlanAnalytics {
  planId: string;
  planName: string;
  subscriberCount: number;
  revenue: number;
  churnRate: number;
  growthRate: number;
  averageTenure: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  newSubscribers: number;
  churnedSubscribers: number;
  planBreakdown: { [planId: string]: number };
}

export interface SystemAlert extends Notification {
  alertType: 'maintenance' | 'security' | 'performance' | 'billing' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers?: number;
  resolutionTime?: Date;
  resolvedBy?: string;
}

export interface SystemSettings {
  id : number;
  updatedBy : number;
  updatedAt: Date;
  createdAt: Date;
  platform_name: string;
  platform_url: string;
  platform_logo: string;
  default_language: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  file_upload_max_size: number;
  backup_enabled: boolean;
  backup_frequency: string;
  support_email: string;
  support_phone: string;
  terms_url: string;
  privacy_url: string;
  timezone: string;
  currency: string;
  max_concurrent_users: number;
  cache_enabled: boolean;
  cache_ttl: number;
  session_timeout: number;
  password_min_length: number;
  two_factor_required: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_batch_size: number;
  api_rate_limit: number;
  webhook_retries: number;
}

export interface UserNotification extends Notification {
  targetUsers: string[]; // User IDs
  targetRoles: User['role'][];
  sentBy: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  readCount: number;
  totalRecipients: number;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface CategorySale {
  name: string;
  icon: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface PeakHour {
  time: string;
  day: string;
  orders: number;
  revenue: number;
}

export interface CustomerSegment {
  name: string;
  percentage: number;
}

export interface LoyaltyStats {
  activeMembers: number;
  avgPoints: number;
  redemptionRate: number;
}

export interface SatisfactionScores {
  food: number;
  service: number;
  overall: number;
}

export interface RestaurantNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'staff' | 'system' | 'activity';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  recipients: number;
  sentBy: string;
  targetRoles: User['role'][];
  readCount?: number;
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipients: string;
  frequency: string;
  enabled: boolean;
}

export interface LoyaltyStatsManage {
  activeOffers: number;
  loyalCustomers: number;
  avgRedemption: number;
  revenueBoost: number;
}

export interface OfferForm {
  title: string;
  description: string;
  type: string;
  discountValue: number;
  minOrderValue: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  applicableItems: string[];
  isActive: boolean;
}

export interface LoyaltyProgram {
  name: string;
  pointsPerRupee: number;
  pointsToRupee: number;
  expiryDays: number;
  welcomeBonus: number;
  isActive: boolean;
  description: string;
}

export interface LoyaltyCustomer {
  id: string;
  name: string;
  points: number;
  totalSpent: number;
  rank: number;
}

export interface Redemption {
  id: string;
  customerId: string;
  customerName: string;
  pointsUsed: number;
  reward: string;
  date: Date;
  offerTitle: string;
  timestamp: Date;
  amount: number;
}

export interface LoyaltyForm {
  name: string;
  pointsPerRupee: number;
  pointsToRupee: number;
  expiryDays: number;
  welcomeBonus: number;
  isActive: boolean;
  description: string;
}

export interface ResOwnerDashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  todayAvgOrderValue: number;
  recentOrders: any[];
  activeStaff: number;
  totalStaff: number;
  staffOnBreak: number;
  staffPerformance: any[];
  lowStockItems: any[];
  outOfStockItems: any[];
  popularItems: any[];
  monthlyRevenue: number;
  monthlyGrowth: number;
  expenses: number;
  profit: number;
  pendingOrders: number;
  completedOrders: number;
  avgServiceTime: string;
  customerSatisfaction: number;
}

export interface PaymentStats {
  todayRevenue: number;
  successRate: number;
  failedPayments: number;
  avgTransaction: number;
}

export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  icon: string;
  fee: string;
  settlement: string;
  status: string;
  enabled: boolean;
}

export interface PaymentMethods {
  cards: boolean;
  upi: boolean;
  cash: boolean;
  wallets: boolean;
}

export interface RecentCustomerTransaction {
  id: string;
  description: string;
  customerName: string;
  amount: number;
  icon: string;
  timestamp: Date;
  status: string;
  gateway?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  fee: string;
  settlement: string;
  enabled: boolean;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  fee: string;
  settlement: string;
  status: string;
  enabled: boolean;
}

export interface PaymentStatusConfig {
  status: string;
  badgeClass: string;
  label: string;
}

export interface PaymentStatsData {
  todayRevenue: number;
  successRate: number;
  failedPayments: number;
  avgTransaction: number;
}

export interface SettingsFilterOption {
  value: string;
  label: string;
}

export interface NotificationConfig {
  key: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
}

export interface PaymentMethodDescription {
  method: string;
  description: string;
}

export interface Performance {
  orderCompletion: number;
  customerSatisfaction: number;
  staffEfficiency: number;
}

export interface TableOverview {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  cleaningTables: number;
  tablesFreeSoon: Table[]; // tables that will be free in next 15 minutes
}

// Staff configuration interfaces
export interface StaffFormDefaults {
  role: StaffMember['role'];
  status: StaffMember['status'];
  shift: StaffMember['shift'];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface ScheduleFormDefaults {
  shift: StaffMember['shift'];
  startTime: string;
  endTime: string;
  status: ShiftSchedule['status'];
}

export interface ShiftTimeConfig {
  shift: StaffMember['shift'];
  startTime: string;
  endTime: string;
  displayText: string;
}

export interface BadgeClassConfig {
  value: string;
  className: string;
}

export interface DisplayTextConfig {
  value: string;
  displayText: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

// Shift reports configuration interfaces
export interface DateRangePeriod {
  key: string;
  label: string;
  days: number; // Number of days to subtract from end date
}

export interface PerformanceScoreParams {
  revenueWeight: number; // Revenue divisor (e.g., 1000)
  ordersWeight: number; // Orders multiplier (e.g., 2)
  complaintsPenalty: number; // Complaints multiplier (e.g., 5)
  maxScore: number; // Maximum allowed score (e.g., 100)
}

export interface RevenueGrowthParams {
  minGrowth: number; // Minimum growth percentage (e.g., 5)
  maxGrowth: number; // Maximum growth percentage (e.g., 25)
}

export interface ShiftReportsConfig {
  defaultHoursPerShift: number;
  dateRangePeriods: DateRangePeriod[];
  shiftBadgeClasses: BadgeClassConfig[];
  approvalBadgeClasses: BadgeClassConfig[];
  performanceScoreParams: PerformanceScoreParams;
  revenueGrowthParams: RevenueGrowthParams;
  shiftTypes: string[];
  periodFilterOptions: SelectOption[];
  shiftFilterOptions: SelectOption[];
}

// Owner dashboard configuration interfaces
export interface NavigationRoute {
  key: string;
  route: string;
}

export interface TrendIconConfig {
  trend: string;
  iconClass: string;
}

export interface OwnerDashboardConfig {
  badgeClasses: { [key: string]: BadgeClassConfig[] };
  trendIcons: TrendIconConfig[];
  navigationRoutes: NavigationRoute[];
  periodFilterOptions: SelectOption[];
}

export interface NotificationStats {
  unread: number;
  today: number;
  highPriority: number;
  systemAlerts: number;
}

export interface NotificationSetting {
  name: string;
  description: string;
  enabled: boolean;
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'needs_cleaning' | 'cleaning';
  capacity: number;
  currentOrder?: Order;
  lastActivity?: Date;
  estimatedFreeTime?: number; // minutes until free
  server?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  totalPrice: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RequestLog {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  duration?: number;
  status?: number;
  size?: number;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
  hits: number;
  lastAccessed: number;
}

export interface CacheConfig {
  defaultTtl: number; // Time to live in milliseconds
  maxEntries: number; // Maximum number of entries
  enableCompression: boolean;
  storageType: 'memory' | 'localStorage' | 'sessionStorage';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CrudHeaders {
  [key: string]: string;
}

export interface CrudParams {
  [key: string]: string | number | boolean;
}

export interface PriceBreakdown {
  basePrice: number;
  taxAmount: number;
  serviceCharge: number;
  discountAmount: number;
  finalPrice: number;
  savings: number;
}

export interface TaxCalculation {
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  cess?: number;
}

export interface DiscountRule {
  type: 'percentage' | 'fixed' | 'buy_one_get_one' | 'loyalty_points';
  value: number;
  minOrderValue?: number;
  applicableItems?: string[];
  applicableCategories?: string[];
  maxDiscount?: number;
}

export interface PricingConfig {
  currency: string;
  currencySymbol: string;
  gstPercentage: number;
  serviceChargePercentage: number;
  roundToNearest: number; // Round to nearest rupee/paise
  enableLoyaltyDiscounts: boolean;
  enableBulkDiscounts: boolean;
}

export interface DateTimeFormat {
  date: string;
  time: string;
  datetime: string;
  relative: string;
  iso: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
  currentStatus: 'open' | 'closed' | 'opening_soon' | 'closing_soon';
}

export interface ShiftInfo {
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  isActive: boolean;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userMessage?: string;
  actionRequired?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

export interface GlobalError {
  id: string;
  type: 'network' | 'validation' | 'business' | 'system' | 'authentication';
  title: string;
  message: string;
  details?: ErrorDetails;
  timestamp: Date;
  dismissed: boolean;
  retryable?: boolean;
  retryCallback?: () => void;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
  columns?: string[];
}

export interface ExportResult {
  success: boolean;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  exportedAt: Date;
  recordCount: number;
  error?: string;
}

export interface ImportConfig {
  format: 'csv' | 'excel' | 'json';
  hasHeaders: boolean;
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateData: boolean;
  batchSize: number;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  failedRecords: number;
  errors: ImportError[];
  importedAt: Date;
}

export interface ImportError {
  row: number;
  field?: string;
  value?: any;
  message: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
  required: boolean;
  defaultValue?: any;
}

export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles: number;
  chunkSize?: number; // for large file uploads
  enableCompression: boolean;
}

export interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  loaded: number;
  total: number;
  speed?: number; // bytes per second
  remainingTime?: number; // in seconds
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileName: string;
  fileUrl?: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  error?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'menu_image' | 'receipt' | 'profile' | 'document' | 'report';
  entityId?: string; // ID of related entity (menu item, order, etc.)
  tags?: string[];
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'order' | 'payment' | 'inventory' | 'staff';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // in milliseconds, 0 = persistent
  action?: {
    label: string;
    callback: () => void;
  };
  icon?: string;
  sound?: boolean;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // BehaviorSubjects for reactive data
  private usersSubject = new BehaviorSubject<User[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  private recipesSubject = new BehaviorSubject<Recipe[]>([]);
  private offersSubject = new BehaviorSubject<Offer[]>([]);
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private navigationMenusSubject = new BehaviorSubject<NavigationMenu[]>([]);
  private staffSubject = new BehaviorSubject<StaffMember[]>([]);
  private shiftSchedulesSubject = new BehaviorSubject<ShiftSchedule[]>([]);
  private shiftReportsSubject = new BehaviorSubject<ShiftReport[]>([]);
  private restaurantSettingsSubject = new BehaviorSubject<RestaurantSettings[]>([]);
  private cashDrawersSubject = new BehaviorSubject<CashDrawer[]>([]);
  private cashTransactionsSubject = new BehaviorSubject<CashTransaction[]>([]);
  private shiftReconciliationsSubject = new BehaviorSubject<ShiftReconciliation[]>([]);
  private quickActionsSubject = new BehaviorSubject<QuickAction[]>([]);
  private recentTransactionsSubject = new BehaviorSubject<RecentTransaction[]>([]);
  private cashierStatsSubject = new BehaviorSubject<CashierStats[]>([]);
  private orderTypeTabsSubject = new BehaviorSubject<OrderTypeTab[]>([]);
  private dineInSubTabsSubject = new BehaviorSubject<DineInSubTab[]>([]);
  private menuCategoriesSubject = new BehaviorSubject<MenuCategory[]>([]);
  private foodMenuCategoriesSubject = new BehaviorSubject<FoodMenuCategory[]>([]);
  private alertRulesSubject = new BehaviorSubject<AlertRule[]>([]);
  private restaurantNotificationsSubject = new BehaviorSubject<RestaurantNotification[]>([]);
  private loyaltyProgramSubject = new BehaviorSubject<LoyaltyProgram | null>(null);
  private loyaltyCustomersSubject = new BehaviorSubject<LoyaltyCustomer[]>([]);
  private loyaltyStatsManageSubject = new BehaviorSubject<LoyaltyStatsManage | null>(null);
  private recentActivitiesSubject = new BehaviorSubject<any[]>([]);
  private paymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);
  private quickAmountsSubject = new BehaviorSubject<number[]>([]);
  private sampleMenuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
  private sampleOrdersSubject = new BehaviorSubject<Order[]>([]);

  // Payment processing configuration subjects
  private paymentGatewaysSubject = new BehaviorSubject<PaymentGatewayConfig[]>([]);
  private paymentMethodSettingsSubject = new BehaviorSubject<PaymentMethods>({ cards: true, upi: true, cash: true, wallets: false });
  private recentCustomerTransactionsSubject = new BehaviorSubject<RecentCustomerTransaction[]>([]);
  private paymentStatsDataSubject = new BehaviorSubject<PaymentStatsData | null>(null);
  private paymentStatusConfigsSubject = new BehaviorSubject<PaymentStatusConfig[]>([]);

  // Settings configuration subjects
  private settingsFilterCategoriesSubject = new BehaviorSubject<SettingsFilterOption[]>([]);
  private settingsFilterStatusesSubject = new BehaviorSubject<SettingsFilterOption[]>([]);
  private paymentMethodDescriptionsSubject = new BehaviorSubject<PaymentMethodDescription[]>([]);
  private notificationConfigsSubject = new BehaviorSubject<NotificationConfig[]>([]);
  private businessDaysSubject = new BehaviorSubject<string[]>([]);
  private tipOptionsSubject = new BehaviorSubject<number[]>([]);

  // Staff configuration subjects
  private staffFormDefaultsSubject = new BehaviorSubject<StaffFormDefaults | null>(null);
  private scheduleFormDefaultsSubject = new BehaviorSubject<ScheduleFormDefaults | null>(null);
  private shiftTimeConfigsSubject = new BehaviorSubject<ShiftTimeConfig[]>([]);
  private statusBadgeClassesSubject = new BehaviorSubject<BadgeClassConfig[]>([]);
  private roleBadgeClassesSubject = new BehaviorSubject<BadgeClassConfig[]>([]);
  private statusDisplayTextsSubject = new BehaviorSubject<DisplayTextConfig[]>([]);
  private roleOptionsSubject = new BehaviorSubject<SelectOption[]>([]);
  private statusOptionsSubject = new BehaviorSubject<SelectOption[]>([]);
  private shiftOptionsSubject = new BehaviorSubject<SelectOption[]>([]);
  private scheduleStatusOptionsSubject = new BehaviorSubject<SelectOption[]>([]);
  private defaultAvatarUrlSubject = new BehaviorSubject<string>('');

  // Shift reports configuration subjects
  private shiftReportsConfigSubject = new BehaviorSubject<ShiftReportsConfig | null>(null);

  // Owner dashboard configuration subjects
  private ownerDashboardConfigSubject = new BehaviorSubject<OwnerDashboardConfig | null>(null);
  private ownerDashboardDataSubject = new BehaviorSubject<ResOwnerDashboardData | null>(null);
  private availablePrintersSubject = new BehaviorSubject<Printer[]>([]);
  private availableLanguagesSubject = new BehaviorSubject<any[]>([]);
  private availableCurrenciesSubject = new BehaviorSubject<any[]>([]);
  private defaultCashierSettingsSubject = new BehaviorSubject<CashierSettings[]>([]);
  private currentShiftReportSubject = new BehaviorSubject<CashierShiftReport | null>(null);
  private previousShiftReportsSubject = new BehaviorSubject<CashierShiftReport[]>([]);
  private paymentMethodSummarySubject = new BehaviorSubject<PaymentMethodSummary[]>([]);
  private hourlySalesDataSubject = new BehaviorSubject<HourlySalesData[]>([]);
  private transactionSearchResultsSubject = new BehaviorSubject<TransactionSearchResult[]>([]);
  private availablePaymentMethodsSubject = new BehaviorSubject<string[]>([]);
  private availableStatusesSubject = new BehaviorSubject<string[]>([]);
  private availableCashiersSubject = new BehaviorSubject<string[]>([]);
  private apiKeysSubject = new BehaviorSubject<APIKey[]>([]);
  private apiEndpointsSubject = new BehaviorSubject<APIEndpoint[]>([]);
  private apiMetricsSubject = new BehaviorSubject<APIMetrics | null>(null);
  private integrationsSubject = new BehaviorSubject<Integration[]>([]);
  private integrationMetricsSubject = new BehaviorSubject<IntegrationMetrics | null>(null);
  private navigationRolesSubject = new BehaviorSubject<string[]>([]);
  private navigationStatusesSubject = new BehaviorSubject<string[]>([]);
  private subscriptionPlansSubject = new BehaviorSubject<SubscriptionPlan[]>([]);
  private planFeaturesSubject = new BehaviorSubject<PlanFeature[]>([]);
  private platformDashboardDataSubject = new BehaviorSubject<any>(null);
  private restaurantsSubject = new BehaviorSubject<Restaurant[]>([]);
  private securityPoliciesSubject = new BehaviorSubject<SecurityPolicy[]>([]);
  private securityLogsSubject = new BehaviorSubject<SecurityLog[]>([]);
  private securityMetricsSubject = new BehaviorSubject<SecurityMetrics | null>(null);
  private subscriptionMetricsSubject = new BehaviorSubject<SubscriptionMetrics | null>(null);
  private planAnalyticsSubject = new BehaviorSubject<PlanAnalytics[]>([]);
  private revenueDataSubject = new BehaviorSubject<RevenueData[]>([]);
  private broadcastMessagesSubject = new BehaviorSubject<BroadcastMessage[]>([]);
  private featuresSubject = new BehaviorSubject<Feature[]>([]);
  private planFeatureAccessSubject = new BehaviorSubject<PlanFeatureAccess[]>([]);
  private roleFeatureAccessSubject = new BehaviorSubject<RoleFeatureAccess[]>([]);
  private systemAlertsSubject = new BehaviorSubject<SystemAlert[]>([]);
  private systemSettingsSubject = new BehaviorSubject<SystemSettings>(null as any);
  private userNotificationsSubject = new BehaviorSubject<UserNotification[]>([]);

  // Analytics data BehaviorSubjects
  private customerSegmentsSubject = new BehaviorSubject<CustomerSegment[]>([]);
  private loyaltyStatsSubject = new BehaviorSubject<LoyaltyStats | null>(null);
  private satisfactionScoresSubject = new BehaviorSubject<SatisfactionScores | null>(null);
  private revenueChartDataSubject = new BehaviorSubject<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  private ordersChartDataSubject = new BehaviorSubject<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  private paymentChartDataSubject = new BehaviorSubject<number[]>([]);
  private itemsChartDataSubject = new BehaviorSubject<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  private customerSatisfactionSubject = new BehaviorSubject<number>(0);
  private satisfactionGrowthSubject = new BehaviorSubject<number>(0);

  // Order processing configuration subjects
  private orderStatusConfigsSubject = new BehaviorSubject<OrderStatusConfig[]>([]);
  private orderFilterOptionsSubject = new BehaviorSubject<OrderFilterOption[]>([]);
  private orderSortOptionsSubject = new BehaviorSubject<OrderSortOption[]>([]);

  // Observable streams
  users$ = this.usersSubject.asObservable();
  roles$ = this.rolesSubject.asObservable();
  menuItems$ = this.menuItemsSubject.asObservable();
  orders$ = this.ordersSubject.asObservable();
  notifications$ = this.notificationsSubject.asObservable();
  inventory$ = this.inventorySubject.asObservable();
  recipes$ = this.recipesSubject.asObservable();
  offers$ = this.offersSubject.asObservable();
  customers$ = this.customersSubject.asObservable();
  navigationMenus$ = this.navigationMenusSubject.asObservable();
  staff$ = this.staffSubject.asObservable();
  shiftSchedules$ = this.shiftSchedulesSubject.asObservable();
  shiftReports$ = this.shiftReportsSubject.asObservable();
  restaurantSettings$ = this.restaurantSettingsSubject.asObservable();
  cashDrawers$ = this.cashDrawersSubject.asObservable();
  cashTransactions$ = this.cashTransactionsSubject.asObservable();
  shiftReconciliations$ = this.shiftReconciliationsSubject.asObservable();
  quickActions$ = this.quickActionsSubject.asObservable();
  recentTransactions$ = this.recentTransactionsSubject.asObservable();
  cashierStats$ = this.cashierStatsSubject.asObservable();
  orderTypeTabs$ = this.orderTypeTabsSubject.asObservable();
  dineInSubTabs$ = this.dineInSubTabsSubject.asObservable();
  menuCategories$ = this.menuCategoriesSubject.asObservable();
  foodMenuCategories$ = this.foodMenuCategoriesSubject.asObservable();
  alertRules$ = this.alertRulesSubject.asObservable();
  restaurantNotifications$ = this.restaurantNotificationsSubject.asObservable();
  loyaltyProgram$ = this.loyaltyProgramSubject.asObservable();
  loyaltyCustomers$ = this.loyaltyCustomersSubject.asObservable();
  loyaltyStatsManage$ = this.loyaltyStatsManageSubject.asObservable();
  recentActivities$ = this.recentActivitiesSubject.asObservable();
  paymentMethods$ = this.paymentMethodsSubject.asObservable();
  quickAmounts$ = this.quickAmountsSubject.asObservable();
  sampleMenuItems$ = this.sampleMenuItemsSubject.asObservable();
  sampleOrders$ = this.sampleOrdersSubject.asObservable();

  // Payment processing configuration observables
  paymentGateways$ = this.paymentGatewaysSubject.asObservable();
  paymentMethodSettings$ = this.paymentMethodSettingsSubject.asObservable();
  recentCustomerTransactions$ = this.recentCustomerTransactionsSubject.asObservable();
  paymentStatsData$ = this.paymentStatsDataSubject.asObservable();
  paymentStatusConfigs$ = this.paymentStatusConfigsSubject.asObservable();

  // Settings configuration observables
  settingsFilterCategories$ = this.settingsFilterCategoriesSubject.asObservable();
  settingsFilterStatuses$ = this.settingsFilterStatusesSubject.asObservable();
  paymentMethodDescriptions$ = this.paymentMethodDescriptionsSubject.asObservable();
  notificationConfigs$ = this.notificationConfigsSubject.asObservable();
  businessDays$ = this.businessDaysSubject.asObservable();
  tipOptions$ = this.tipOptionsSubject.asObservable();

  // Staff configuration observables
  staffFormDefaults$ = this.staffFormDefaultsSubject.asObservable();
  scheduleFormDefaults$ = this.scheduleFormDefaultsSubject.asObservable();
  shiftTimeConfigs$ = this.shiftTimeConfigsSubject.asObservable();
  statusBadgeClasses$ = this.statusBadgeClassesSubject.asObservable();
  roleBadgeClasses$ = this.roleBadgeClassesSubject.asObservable();
  statusDisplayTexts$ = this.statusDisplayTextsSubject.asObservable();
  roleOptions$ = this.roleOptionsSubject.asObservable();
  statusOptions$ = this.statusOptionsSubject.asObservable();
  shiftOptions$ = this.shiftOptionsSubject.asObservable();
  scheduleStatusOptions$ = this.scheduleStatusOptionsSubject.asObservable();
  defaultAvatarUrl$ = this.defaultAvatarUrlSubject.asObservable();

  // Shift reports configuration observables
  shiftReportsConfig$ = this.shiftReportsConfigSubject.asObservable();

  // Owner dashboard configuration observables
  ownerDashboardConfig$ = this.ownerDashboardConfigSubject.asObservable();
  ownerDashboardData$ = this.ownerDashboardDataSubject.asObservable();
  availablePrinters$ = this.availablePrintersSubject.asObservable();
  availableLanguages$ = this.availableLanguagesSubject.asObservable();
  availableCurrencies$ = this.availableCurrenciesSubject.asObservable();
  defaultCashierSettings$ = this.defaultCashierSettingsSubject.asObservable();
  currentShiftReport$ = this.currentShiftReportSubject.asObservable();
  previousShiftReports$ = this.previousShiftReportsSubject.asObservable();
  paymentMethodSummary$ = this.paymentMethodSummarySubject.asObservable();
  hourlySalesData$ = this.hourlySalesDataSubject.asObservable();
  transactionSearchResults$ = this.transactionSearchResultsSubject.asObservable();
  availablePaymentMethods$ = this.availablePaymentMethodsSubject.asObservable();
  availableStatuses$ = this.availableStatusesSubject.asObservable();
  availableCashiers$ = this.availableCashiersSubject.asObservable();
  apiKeys$ = this.apiKeysSubject.asObservable();
  apiEndpoints$ = this.apiEndpointsSubject.asObservable();
  apiMetrics$ = this.apiMetricsSubject.asObservable();
  integrations$ = this.integrationsSubject.asObservable();
  integrationMetrics$ = this.integrationMetricsSubject.asObservable();
  navigationRoles$ = this.navigationRolesSubject.asObservable();
  navigationStatuses$ = this.navigationStatusesSubject.asObservable();
  subscriptionPlans$ = this.subscriptionPlansSubject.asObservable();
  planFeatures$ = this.planFeaturesSubject.asObservable();
  platformDashboardData$ = this.platformDashboardDataSubject.asObservable();
  restaurants$ = this.restaurantsSubject.asObservable();
  securityPolicies$ = this.securityPoliciesSubject.asObservable();
  securityLogs$ = this.securityLogsSubject.asObservable();
  securityMetrics$ = this.securityMetricsSubject.asObservable();
  subscriptionMetrics$ = this.subscriptionMetricsSubject.asObservable();
  planAnalytics$ = this.planAnalyticsSubject.asObservable();
  revenueData$ = this.revenueDataSubject.asObservable();
  broadcastMessages$ = this.broadcastMessagesSubject.asObservable();
  features$ = this.featuresSubject.asObservable();
  planFeatureAccess$ = this.planFeatureAccessSubject.asObservable();
  roleFeatureAccess$ = this.roleFeatureAccessSubject.asObservable();
  systemAlerts$ = this.systemAlertsSubject.asObservable();
  systemSettings$ = this.systemSettingsSubject.asObservable();
  userNotifications$ = this.userNotificationsSubject.asObservable();

  // Analytics data observables
  customerSegments$ = this.customerSegmentsSubject.asObservable();
  loyaltyStats$ = this.loyaltyStatsSubject.asObservable();
  satisfactionScores$ = this.satisfactionScoresSubject.asObservable();
  revenueChartData$ = this.revenueChartDataSubject.asObservable();
  ordersChartData$ = this.ordersChartDataSubject.asObservable();
  paymentChartData$ = this.paymentChartDataSubject.asObservable();
  itemsChartData$ = this.itemsChartDataSubject.asObservable();
  customerSatisfaction$ = this.customerSatisfactionSubject.asObservable();
  satisfactionGrowth$ = this.satisfactionGrowthSubject.asObservable();

  // Order processing configuration observables
  orderStatusConfigs$ = this.orderStatusConfigsSubject.asObservable();
  orderFilterOptions$ = this.orderFilterOptionsSubject.asObservable();
  orderSortOptions$ = this.orderSortOptionsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize roles
    const roles: Role[] = [
      {
        id: 1,
        name: 'Platform Owner',
        code: 'PLATFORM_OWNER',
        role_id: 'platform_owner',
        description: 'Full platform administration access with complete control over all system features',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      },
      {
        id: 2,
        name: 'Restaurant Owner',
        code: 'RESTAURANT_OWNER',
        role_id: 'restaurant_owner',
        description: 'Restaurant management access with control over restaurant operations and analytics',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      },
      {
        id: 3,
        name: 'Restaurant Manager',
        code: 'RESTAURANT_MANAGER',
        role_id: 'restaurant_manager',
        description: 'Staff supervision and operations management access',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      },
      {
        id: 4,
        name: 'Cashier',
        code: 'CASHIER',
        role_id: 'cashier',
        description: 'Order processing and payment handling access',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      },
      {
        id: 5,
        name: 'Kitchen Manager',
        code: 'KITCHEN_MANAGER',
        role_id: 'kitchen_manager',
        description: 'Menu management and kitchen operations access',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      },
      {
        id: 6,
        name: 'Waiter',
        code: 'WAITER',
        role_id: 'waiter',
        description: 'Table service and customer interaction access',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      },
      {
        id: 7,
        name: 'Customer',
        code: 'CUSTOMER',
        role_id: 'customer',
        description: 'Ordering and account management access for customers',
        is_active: true,
        is_system_role: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 'system'
      }
    ];

    // Initialize users
    const users: User[] = [
      {
        id: '1',
        username: 'powner',
        password: 'powner@123',
        name: 'Rishabh Khandekar',
        email: 'powner@cafex.com',
        phone: '+91 98765 43217',
        role: 'platform_owner',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
        restaurant_id: undefined,
        member_since: undefined,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        is_active: 'Y',
        last_login: new Date('2024-12-29'),
        created_by: '1'
      },
      {
        id: '2',
        username: 'rowner',
        password: 'rowner@123',
        name: 'Res-Owner User',
        email: 'rowner@restaurant.com',
        phone: '+91 98765 43210',
        role: 'restaurant_owner',
        avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOeZjZWEr4oFmJhILQQgTy7-WUX9BmRrAAFw&s',
        restaurant_id: 'restaurant-1',
        member_since: undefined,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        is_active: 'Y',
        last_login: undefined,
        created_by: '1'
      },
      {
        id: '3',
        username: 'rmanager',
        password: 'rmanager@123',
        name: 'Priya Sharma',
        email: 'rmanager@cafex.com',
        phone: '+91 98765 43211',
        role: 'restaurant_manager',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
        restaurant_id: 'restaurant-1',
        member_since: undefined,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        is_active: 'Y',
        last_login: undefined,
        created_by: '2'
      },
      {
        id: '4',
        username: 'kmanager',
        password: 'kmanager@123',
        name: 'Sneha Patel',
        email: 'kmanager@cafex.com',
        phone: '+91 98765 43213',
        role: 'kitchen_manager',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&crop=face',
        restaurant_id: 'restaurant-1',
        member_since: undefined,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        is_active: 'Y',
        last_login: undefined,
        created_by: '2'
      },
      {
        id: '5',
        username: 'cashier',
        password: 'cashier@123',
        name: 'Amit Kumar',
        email: 'cashier@cafex.com',
        phone: '+91 98765 43212',
        role: 'cashier',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
        restaurant_id: 'restaurant-1',
        member_since: undefined,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        is_active: 'Y',
        last_login: undefined,
        created_by: '2'
      },
      {
        id: '6',
        username: 'waiter',
        password: 'waiter@123',
        name: 'Rahul Singh',
        email: 'rahul@cafex.com',
        phone: '+91 98765 43214',
        role: 'waiter',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        restaurant_id: 'restaurant-1',
        member_since: undefined,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        is_active: 'Y',
        last_login: undefined,
        created_by: '2'
      },
      {
        id: '7',
        username: 'cust1',
        password: 'cust1@123',
        name: 'Amit Patil',
        email: 'cust1@email.com',
        phone: '+91 98765 43215',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
        restaurant_id: 'restaurant-1',
        member_since: new Date('2024-01-15'),
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15'),
        is_active: 'Y',
        last_login: undefined,
        created_by: undefined
      },
      {
        id: '8',
        username: 'cust2',
        password: 'cust2@123',
        name: 'Sarah Johnson',
        email: 'cust2@email.com',
        phone: '+91 98765 43216',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
        restaurant_id: 'restaurant-1',
        member_since: new Date('2024-03-20'),
        created_at: new Date('2024-03-20'),
        updated_at: new Date('2024-03-20'),
        is_active: 'Y',
        last_login: undefined,
        created_by: undefined
      }
    ];

    // Initialize menu items
    const menuItems: MenuItem[] = [
      {
        id: '1',
        name: 'Hyderabadi Biryani',
        description: 'Aromatic basmati rice cooked with tender meat, saffron, and traditional spices',
        price: 280,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        preparationTime: 25,
        allergens: ['nuts']
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
        price: 250,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 15,
        allergens: ['dairy', 'gluten']
      },
      {
        id: '3',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken pieces',
        price: 320,
        category: 'Main Course',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhcHDKHodUP73sbQofmFqGyCRqgBK3_PmA8w&s',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        preparationTime: 20,
        allergens: ['dairy']
      },
      {
        id: '4',
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan cheese and croutons',
        price: 180,
        category: 'Salads',
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 10,
        allergens: ['dairy', 'nuts']
      },
      {
        id: '5',
        name: 'Chocolate Brownie',
        description: 'Rich chocolate brownie with vanilla ice cream',
        price: 150,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 5,
        allergens: ['dairy', 'gluten', 'eggs']
      }
    ];

    // Initialize orders
    const orders: Order[] = [
      {
        id: 'ORD-2025-1045',
        customerId: '6',
        customerName: 'Amit Patil',
        tableNumber: 'T-07',
        items: [
          {
            id: 'item-1',
            menuItemId: '1',
            menuItemName: 'Hyderabadi Biryani',
            quantity: 1,
            unitPrice: 280,
            totalPrice: 280
          },
          {
            id: 'item-2',
            menuItemId: '4',
            menuItemName: 'Caesar Salad',
            quantity: 1,
            unitPrice: 180,
            totalPrice: 180
          }
        ],
        status: 'ready',
        totalAmount: 460,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        orderType: 'dine_in',
        estimatedReadyTime: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1044',
        customerId: '7',
        customerName: 'Sarah Johnson',
        tableNumber: 'T-12',
        items: [
          {
            id: 'item-3',
            menuItemId: '2',
            menuItemName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 250,
            totalPrice: 250
          }
        ],
        status: 'preparing',
        totalAmount: 250,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000),
        paymentStatus: 'paid',
        paymentMethod: 'Card',
        orderType: 'dine_in',
        estimatedReadyTime: new Date(Date.now() + 10 * 60 * 1000)
      },
      // Kitchen display sample orders
      {
        id: 'ORD-2025-1046',
        customerId: 'user-1',
        customerName: 'Amit Patil',
        tableNumber: 'T-07',
        items: [
          {
            id: 'order-item-1',
            menuItemId: 'item-1',
            menuItemName: 'Hyderabadi Biryani',
            quantity: 2,
            unitPrice: 280,
            totalPrice: 560,
            status: 'preparing'
          },
          {
            id: 'order-item-2',
            menuItemId: 'item-2',
            menuItemName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 250,
            totalPrice: 250,
            status: 'preparing'
          }
        ],
        status: 'preparing',
        orderType: 'dine_in',
        paymentStatus: 'paid',
        totalAmount: 810,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        estimatedReadyTime: new Date(Date.now() + 15 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1047',
        customerId: 'user-2',
        customerName: 'Sarah Johnson',
        tableNumber: 'T-12',
        items: [
          {
            id: 'order-item-3',
            menuItemId: 'item-2',
            menuItemName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 250,
            totalPrice: 500,
            status: 'ready'
          }
        ],
        status: 'ready',
        orderType: 'dine_in',
        paymentStatus: 'paid',
        totalAmount: 500,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000),
        estimatedReadyTime: new Date(Date.now() - 10 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1048',
        customerId: 'user-3',
        customerName: 'Raj Kumar',
        tableNumber: 'T-05',
        items: [
          {
            id: 'order-item-4',
            menuItemId: 'item-3',
            menuItemName: 'Butter Chicken',
            quantity: 1,
            unitPrice: 320,
            totalPrice: 320,
            status: 'confirmed'
          }
        ],
        status: 'confirmed',
        orderType: 'dine_in',
        paymentStatus: 'pending',
        totalAmount: 320,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000)
      }
    ];

    // Initialize notifications
    const notifications: Notification[] = [
      {
        id: '1',
        title: 'Order Ready for Pickup',
        message: 'Order #ORD-2025-1045 (Sushi Platter) is ready for customer pickup at Table T-07',
        type: 'order',
        priority: 'high',
        status: 'unread',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Low Inventory Alert',
        message: 'Margherita Pizza base running low. Only 5 units remaining in inventory.',
        type: 'inventory',
        priority: 'medium',
        status: 'unread',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ];

    // Initialize inventory
    const inventory: InventoryItem[] = [
      {
        id: '1',
        name: 'Tomatoes',
        sku: 'VEG-001',
        category: 'vegetables',
        unit: 'kg',
        currentStock: 25,
        minStockLevel: 10,
        unitCost: 40,
        supplier: 'Fresh Farms Ltd',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Onions',
        sku: 'VEG-002',
        category: 'vegetables',
        unit: 'kg',
        currentStock: 30,
        minStockLevel: 15,
        unitCost: 25,
        supplier: 'Fresh Farms Ltd',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Chicken Breast',
        sku: 'MEAT-001',
        category: 'meat',
        unit: 'kg',
        currentStock: 15,
        minStockLevel: 8,
        unitCost: 180,
        supplier: 'Premium Poultry',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Basmati Rice',
        sku: 'GRAIN-001',
        category: 'grains',
        unit: 'kg',
        currentStock: 50,
        minStockLevel: 20,
        unitCost: 85,
        supplier: 'Rice Traders',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '5',
        name: 'Mozzarella Cheese',
        sku: 'DAIRY-001',
        category: 'dairy',
        unit: 'kg',
        currentStock: 12,
        minStockLevel: 5,
        unitCost: 220,
        supplier: 'Dairy Fresh',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '6',
        name: 'Pizza Dough Base',
        sku: 'BAKE-001',
        category: 'bakery',
        unit: 'pieces',
        currentStock: 20,
        minStockLevel: 10,
        unitCost: 15,
        supplier: 'Bake Masters',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '7',
        name: 'Butter Chicken Masala',
        sku: 'SPICE-001',
        category: 'spices',
        unit: 'kg',
        currentStock: 8,
        minStockLevel: 3,
        unitCost: 150,
        supplier: 'Spice World',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '8',
        name: 'Fresh Cream',
        sku: 'DAIRY-002',
        category: 'dairy',
        unit: 'liters',
        currentStock: 10,
        minStockLevel: 4,
        unitCost: 120,
        supplier: 'Dairy Fresh',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      }
    ];

    // Initialize recipes
    const recipes: Recipe[] = [
      {
        id: 'recipe-1',
        name: 'Hyderabadi Biryani',
        description: 'Aromatic basmati rice cooked with tender meat, saffron, and traditional spices',
        category: 'Main Course',
        type: 'prepare_on_order',
        prepTime: 25,
        servings: 1,
        menuItemId: '1',
        ingredients: [
          {
            ingredientId: '4',
            ingredientName: 'Basmati Rice',
            quantity: 0.2,
            unit: 'kg',
            cost: 17
          },
          {
            ingredientId: '3',
            ingredientName: 'Chicken Breast',
            quantity: 0.15,
            unit: 'kg',
            cost: 27
          },
          {
            ingredientId: '7',
            ingredientName: 'Butter Chicken Masala',
            quantity: 0.02,
            unit: 'kg',
            cost: 3
          },
          {
            ingredientId: '2',
            ingredientName: 'Onions',
            quantity: 0.1,
            unit: 'kg',
            cost: 2.5
          },
          {
            ingredientId: '1',
            ingredientName: 'Tomatoes',
            quantity: 0.05,
            unit: 'kg',
            cost: 2
          }
        ],
        instructions: [
          'Marinate chicken with spices for 15 minutes',
          'Cook rice with saffron and spices',
          'Layer rice and cooked chicken',
          'Dum cook for 20 minutes'
        ],
        costPerServing: 51.5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'recipe-2',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
        category: 'Main Course',
        type: 'prepare_on_order',
        prepTime: 15,
        servings: 1,
        menuItemId: '2',
        ingredients: [
          {
            ingredientId: '6',
            ingredientName: 'Pizza Dough Base',
            quantity: 1,
            unit: 'pieces',
            cost: 15
          },
          {
            ingredientId: '5',
            ingredientName: 'Mozzarella Cheese',
            quantity: 0.1,
            unit: 'kg',
            cost: 22
          },
          {
            ingredientId: '1',
            ingredientName: 'Tomatoes',
            quantity: 0.05,
            unit: 'kg',
            cost: 2
          }
        ],
        instructions: [
          'Roll out pizza dough',
          'Add tomato sauce base',
          'Top with mozzarella cheese',
          'Bake at 250°C for 12 minutes'
        ],
        costPerServing: 39,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'recipe-3',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken pieces',
        category: 'Main Course',
        type: 'prepare_on_order',
        prepTime: 20,
        servings: 1,
        menuItemId: '3',
        ingredients: [
          {
            ingredientId: '3',
            ingredientName: 'Chicken Breast',
            quantity: 0.2,
            unit: 'kg',
            cost: 36
          },
          {
            ingredientId: '7',
            ingredientName: 'Butter Chicken Masala',
            quantity: 0.03,
            unit: 'kg',
            cost: 4.5
          },
          {
            ingredientId: '1',
            ingredientName: 'Tomatoes',
            quantity: 0.08,
            unit: 'kg',
            cost: 3.2
          },
          {
            ingredientId: '8',
            ingredientName: 'Fresh Cream',
            quantity: 0.05,
            unit: 'liters',
            cost: 6
          }
        ],
        instructions: [
          'Marinate chicken with yogurt and spices',
          'Cook chicken until tender',
          'Prepare creamy tomato gravy',
          'Combine and simmer for 10 minutes'
        ],
        costPerServing: 49.7,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'recipe-4',
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with parmesan cheese and croutons',
        category: 'Salads',
        type: 'prepare_on_order',
        prepTime: 10,
        servings: 1,
        menuItemId: '4',
        ingredients: [
          {
            ingredientId: '1',
            ingredientName: 'Tomatoes',
            quantity: 0.05,
            unit: 'kg',
            cost: 2
          },
          {
            ingredientId: '2',
            ingredientName: 'Onions',
            quantity: 0.03,
            unit: 'kg',
            cost: 0.75
          }
        ],
        instructions: [
          'Wash and chop lettuce',
          'Add croutons and parmesan',
          'Dress with Caesar dressing',
          'Toss and serve fresh'
        ],
        costPerServing: 2.75,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'recipe-5',
        name: 'Chocolate Brownie',
        description: 'Rich chocolate brownie with vanilla ice cream',
        category: 'Desserts',
        type: 'prepared',
        prepTime: 5,
        servings: 1,
        menuItemId: '5',
        ingredients: [
          {
            ingredientId: '5',
            ingredientName: 'Mozzarella Cheese',
            quantity: 0.02,
            unit: 'kg',
            cost: 4.4
          }
        ],
        instructions: [
          'Pre-baked brownie stored in display',
          'Serve with ice cream',
          'Add chocolate sauce if requested'
        ],
        costPerServing: 4.4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialize offers
    const offers: Offer[] = [
      {
        id: '1',
        name: 'Happy Hour Discount',
        title: 'Happy Hour Discount',
        description: '20% off on all beverages between 5-7 PM',
        type: 'percentage',
        value: 20,
        discountValue: 20,
        applicableCategories: ['beverages'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 15,
        maxUsage: 50
      }
    ];

    // Initialize customers
    const customers: Customer[] = [
      {
        id: '6',
        name: 'Amit Patil',
        email: 'amit.patil@email.com',
        phone: '+91 98765 43215',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
        memberSince: new Date('2024-01-15'),
        totalOrders: 24,
        totalSpent: 12400,
        loyaltyPoints: 240,
        favoriteItems: ['1', '2'],
        addresses: [
          {
            id: 'addr-1',
            type: 'home',
            street: '123 MG Road',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001',
            isDefault: true
          }
        ],
        preferences: {
          notifications: true,
          dietaryRestrictions: [],
          favoriteCategories: ['Main Course', 'Desserts']
        }
      }
    ];

    // Initialize navigation menus
    const navigationMenus: NavigationMenu[] = [
      // Navigation Menu (Parent)
      {
        id: 'nav-1',
        name: 'Navigation Menu',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_navigation']
          }
        },
        icon: 'fas fa-bars',
        isActive: true,
        order: 1,
        type: 'parent'
      },
      // Navigation Management (Child of Navigation Menu)
      {
        id: 'nav-1-1',
        name: 'Navigation Management',
        parentId: 'nav-1',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['create_menu', 'update_menu', 'delete_menu']
          }
        },
        path: '/navigation-management',
        icon: 'fas fa-cogs',
        isActive: true,
        order: 1,
        type: 'action'
      },

      // Platform Owner Menus
      {
        id: 'po-1',
        name: 'Dashboard',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['view_dashboard']
          }
        },
        path: '/dashboard',
        icon: 'fas fa-tachometer-alt',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'po-2',
        name: 'Restaurants',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_restaurants']
          }
        },
        icon: 'fas fa-utensils',
        isActive: true,
        order: 3,
        type: 'parent'
      },
      {
        id: 'po-2-1',
        name: 'Restaurant Management',
        parentId: 'po-2',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['view_restaurants']
          }
        },
        path: '/restaurant-management',
        icon: 'fas fa-utensils',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'po-3',
        name: 'Users & Roles',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_users', 'manage_roles']
          }
        },
        icon: 'fas fa-users',
        isActive: true,
        order: 4,
        type: 'parent'
      },
      {
        id: 'po-3-1',
        name: 'User Management',
        parentId: 'po-3',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['create_user', 'update_user', 'delete_user']
          }
        },
        path: '/user-management',
        icon: 'fas fa-user-cog',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'po-3-2',
        name: 'Role Management',
        parentId: 'po-3',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['create_role', 'update_role', 'delete_role']
          }
        },
        path: '/role-management',
        icon: 'fas fa-user-cog',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'po-4',
        name: 'Billing & Subscriptions',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_billing', 'manage_subscriptions']
          }
        },
        icon: 'fas fa-credit-card',
        isActive: true,
        order: 5,
        type: 'parent'
      },
      {
        id: 'po-5',
        name: 'Notifications',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_notifications', 'send_broadcasts']
          }
        },
        icon: 'fas fa-bell',
        isActive: true,
        order: 6,
        type: 'parent'
      },
      {
        id: 'po-5-1',
        name: 'Notification Manangement',
        parentId: 'po-5',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['view_system_alerts', 'create_alerts']
          }
        },
        path: '/notifications/system-alerts',
        icon: 'fas fa-exclamation-triangle',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'po-5-2',
        name: 'User Notifications',
        parentId: 'po-5',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_user_notifications']
          }
        },
        path: '/notifications/user-notifications',
        icon: 'fas fa-users',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'po-5-3',
        name: 'Broadcast Messages',
        parentId: 'po-5',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['send_broadcasts']
          }
        },
        path: '/notifications/broadcast-message',
        icon: 'fas fa-bullhorn',
        isActive: true,
        order: 3,
        type: 'action'
      },
      {
        id: 'po-6',
        name: 'Subscriptions',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_subscriptions', 'manage_plans']
          }
        },
        icon: 'fas fa-crown',
        isActive: true,
        order: 7,
        type: 'parent'
      },
      {
        id: 'po-6-1',
        name: 'Plan Management',
        parentId: 'po-6',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['create_plans', 'update_plans', 'delete_plans']
          }
        },
        path: '/subscriptions/plans',
        icon: 'fas fa-list-alt',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'po-6-2',
        name: 'Subscription Analytics',
        parentId: 'po-6',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['platform_owner'],
            permissions: ['view_subscription_analytics']
          }
        },
        path: '/subscriptions/analytics',
        icon: 'fas fa-chart-bar',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'po-6-3',
        name: 'Feature Access Control',
        parentId: 'po-6',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_feature_access']
          }
        },
        path: '/subscriptions/features',
        icon: 'fas fa-key',
        isActive: true,
        order: 3,
        type: 'action'
      },
      {
        id: 'po-7',
        name: 'Settings',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_settings', 'configure_system']
          }
        },
        icon: 'fas fa-cog',
        isActive: true,
        order: 8,
        type: 'parent'
      },
      {
        id: 'po-7-1',
        name: 'System Configuration',
        parentId: 'po-7',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['platform_owner'],
            permissions: ['configure_system']
          }
        },
        path: '/settings/system',
        icon: 'fas fa-server',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'po-7-2',
        name: 'Security Settings',
        parentId: 'po-7',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_security']
          }
        },
        path: '/settings/security',
        icon: 'fas fa-shield-alt',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'po-7-3',
        name: 'API Management',
        parentId: 'po-7',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_api_keys', 'configure_integrations']
          }
        },
        path: '/settings/api',
        icon: 'fas fa-code',
        isActive: true,
        order: 3,
        type: 'action'
      },
      {
        id: 'po-7-4',
        name: 'Integrations',
        parentId: 'po-7',
        rolePermissions: {
          'platform_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['platform_owner'],
            permissions: ['manage_integrations']
          }
        },
        path: '/settings/integrations',
        icon: 'fas fa-plug',
        isActive: true,
        order: 4,
        type: 'action'
      },

      // Restaurant Owner Menus
      {
        id: 'ro-1',
        name: 'Dashboard',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['view_dashboard']
          }
        },
        path: '/dashboard',
        icon: 'fas fa-tachometer-alt',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'ro-2',
        name: 'Owner Dashboard',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['view_owner_dashboard']
          }
        },
        path: '/dashboard',
        icon: 'fas fa-chart-pie',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'ro-3',
        name: 'Analytics & Reporting',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['view_analytics']
          }
        },
        path: '/analytics-reporting',
        icon: 'fas fa-chart-bar',
        isActive: true,
        order: 3,
        type: 'action'
      },
      {
        id: 'ro-4',
        name: 'Inventory Management',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_inventory']
          }
        },
        path: '/inventory-management',
        icon: 'fas fa-boxes',
        isActive: true,
        order: 4,
        type: 'action'
      },
      {
        id: 'ro-5',
        name: 'Menu Management',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_owner'],
            permissions: ['create_menu_item', 'update_menu_item', 'delete_menu_item']
          }
        },
        path: '/menu-management',
        icon: 'fas fa-utensils',
        isActive: true,
        order: 5,
        type: 'action'
      },
      {
        id: 'ro-6',
        name: 'Notifications',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_notifications']
          }
        },
        path: '/notifications',
        icon: 'fas fa-bell',
        isActive: true,
        order: 6,
        type: 'action'
      },
      {
        id: 'ro-7',
        name: 'Offers & Loyalty',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_offers', 'manage_loyalty']
          }
        },
        path: '/offers-loyalty',
        icon: 'fas fa-gift',
        isActive: true,
        order: 7,
        type: 'action'
      },
      {
        id: 'ro-8',
        name: 'Order Processing',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_orders']
          }
        },
        path: '/order-processing',
        icon: 'fas fa-clipboard-list',
        isActive: true,
        order: 8,
        type: 'action'
      },
      {
        id: 'ro-9',
        name: 'Payment Processing',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_payments']
          }
        },
        path: '/payment-processing',
        icon: 'fas fa-credit-card',
        isActive: true,
        order: 9,
        type: 'action'
      },
      {
        id: 'ro-10',
        name: 'Settings & Configuration',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_settings', 'configure_restaurant']
          }
        },
        path: '/settings-configuration',
        icon: 'fas fa-cog',
        isActive: true,
        order: 10,
        type: 'action'
      },
      {
        id: 'ro-11',
        name: 'Shift Reports',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_owner'],
            permissions: ['view_shift_reports']
          }
        },
        path: '/shift-reports',
        icon: 'fas fa-file-alt',
        isActive: true,
        order: 11,
        type: 'action'
      },
      {
        id: 'ro-12',
        name: 'Staff Management',
        rolePermissions: {
          'restaurant_owner': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_owner'],
            permissions: ['manage_staff', 'hire_staff', 'fire_staff', 'manage_salaries']
          }
        },
        path: '/staff-management',
        icon: 'fas fa-users',
        isActive: true,
        order: 12,
        type: 'action'
      },

      // Restaurant Manager Menus
      {
        id: 'rm-1',
        name: 'Restaurant Manager Dashboard',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['view_manager_dashboard']
          }
        },
        path: '/dashboard',
        icon: 'fas fa-tachometer-alt',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'rm-2',
        name: 'Analytics & Reporting',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['view_analytics']
          }
        },
        path: '/analytics-reporting',
        icon: 'fas fa-chart-bar',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'rm-3',
        name: 'Inventory Management',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_inventory']
          }
        },
        path: '/inventory-management',
        icon: 'fas fa-boxes',
        isActive: true,
        order: 3,
        type: 'action'
      },
      {
        id: 'rm-4',
        name: 'Menu Management',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_manager'],
            permissions: ['create_menu_item', 'update_menu_item', 'delete_menu_item']
          }
        },
        path: '/menu-management',
        icon: 'fas fa-utensils',
        isActive: true,
        order: 4,
        type: 'action'
      },
      {
        id: 'rm-5',
        name: 'Notifications',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_notifications']
          }
        },
        path: '/notifications',
        icon: 'fas fa-bell',
        isActive: true,
        order: 5,
        type: 'action'
      },
      {
        id: 'rm-6',
        name: 'Offers & Loyalty',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_offers', 'manage_loyalty']
          }
        },
        path: '/offers-loyalty',
        icon: 'fas fa-gift',
        isActive: true,
        order: 6,
        type: 'action'
      },
      {
        id: 'rm-7',
        name: 'Order Processing',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_orders']
          }
        },
        path: '/order-processing',
        icon: 'fas fa-clipboard-list',
        isActive: true,
        order: 7,
        type: 'action'
      },
      {
        id: 'rm-8',
        name: 'Payment Processing',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_payments']
          }
        },
        path: '/payment-processing',
        icon: 'fas fa-credit-card',
        isActive: true,
        order: 8,
        type: 'action'
      },
      {
        id: 'rm-9',
        name: 'Settings & Configuration',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_settings', 'configure_restaurant']
          }
        },
        path: '/settings-configuration',
        icon: 'fas fa-cog',
        isActive: true,
        order: 9,
        type: 'action'
      },
      {
        id: 'rm-10',
        name: 'Shift Reports',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['restaurant_manager'],
            permissions: ['view_shift_reports']
          }
        },
        path: '/shift-reports',
        icon: 'fas fa-file-alt',
        isActive: true,
        order: 10,
        type: 'action'
      },
      {
        id: 'rm-11',
        name: 'Staff Management',
        rolePermissions: {
          'restaurant_manager': {
            canView: true,
            canEdit: true,
            canDelete: true,
            canCreate: true,
            allowedRoles: ['restaurant_manager'],
            permissions: ['manage_staff', 'hire_staff', 'fire_staff', 'manage_salaries']
          }
        },
        path: '/staff-management',
        icon: 'fas fa-users',
        isActive: true,
        order: 11,
        type: 'action'
      },

      // Cashier Menus
      {
        id: 'c-1',
        name: 'Dashboard',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['view_dashboard']
          }
        },
        path: '/dashboard',
        icon: 'fas fa-tachometer-alt',
        isActive: true,
        order: 1
      },
      {
        id: 'c-2',
        name: 'POS Interface',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['process_orders', 'handle_payments']
          }
        },
        path: '/pos',
        icon: 'fas fa-cash-register',
        isActive: true,
        order: 2
      },
      {
        id: 'c-5',
        name: 'Receipt Management',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['print_receipts', 'reprint_receipts', 'email_receipts']
          }
        },
        path: '/receipt-management',
        icon: 'fas fa-print',
        isActive: true,
        order: 5
      },
      {
        id: 'c-6',
        name: 'Cash Management',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['manage_cash_drawer', 'cash_reconciliation']
          }
        },
        path: '/cash-management',
        icon: 'fas fa-money-bill-wave',
        isActive: true,
        order: 6
      },
      {
        id: 'c-7',
        name: 'Shift Reports',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['view_shift_reports']
          }
        },
        path: '/shift-reports',
        icon: 'fas fa-file-alt',
        isActive: true,
        order: 7
      },
      {
        id: 'c-8',
        name: 'Transaction Search',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['search_transactions', 'view_transaction_details']
          }
        },
        path: '/transaction-search',
        icon: 'fas fa-search',
        isActive: true,
        order: 8
      },
      {
        id: 'c-11',
        name: 'Settings',
        rolePermissions: {
          'cashier': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['cashier'],
            permissions: ['configure_cashier_settings']
          }
        },
        path: '/settings',
        icon: 'fas fa-cog',
        isActive: true,
        order: 11
      },

      // Kitchen Manager Menus
      {
        id: 'km-1',
        name: 'Dashboard',
        rolePermissions: {
          'kitchen_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: true,
            allowedRoles: ['kitchen_manager'],
            permissions: ['manage_recipes', 'view_menu']
          }
        },
        icon: 'fas fa-book-open',
        path: '/dashboard',
        isActive: true,
        order: 2,
        type: 'action'
      },
      {
        id: 'km-2',
        name: 'Kitchen Display',
        rolePermissions: {
          'kitchen_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['kitchen_manager'],
            permissions: ['view_orders', 'update_order_status']
          }
        },
        path: '/display',
        icon: 'fas fa-utensils',
        isActive: true,
        order: 1,
        type: 'action'
      },
      {
        id: 'km-3',
        name: 'Inventory Management',
        rolePermissions: {
          'kitchen_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['kitchen_manager'],
            permissions: ['manage_inventory', 'view_stock']
          }
        },
        icon: 'fas fa-boxes',
        type: 'action',
        path: '/inventory-management',
        isActive: true,
        order: 3
      },
      {
        id: 'km-4',
        name: 'Recipe Management',
        rolePermissions: {
          'kitchen_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['kitchen_manager'],
            permissions: ['manage_inventory', 'view_stock']
          }
        },
        icon: 'fas fa-boxes',
        type: 'action',
        path: '/recipe-management',
        isActive: true,
        order: 4
      },
      {
        id: 'km-5',
        name: 'Analytics & Reports',
        rolePermissions: {
          'kitchen_manager': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['kitchen_manager'],
            permissions: ['manage_inventory', 'view_stock']
          }
        },
        icon: 'fas fa-chart-line',
        type: 'action',
        path: '/analytics-reports',
        isActive: true,
        order: 5
      },

      // Waiter Menus
      {
        id: 'w-1',
        name: 'Tables',
        rolePermissions: {
          'waiter': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['waiter'],
            permissions: ['view_tables', 'manage_tables']
          }
        },
        icon: 'fas fa-table',
        isActive: true,
        order: 1,
        type: 'parent'
      },
      {
        id: 'w-2',
        name: 'Orders',
        rolePermissions: {
          'waiter': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: true,
            allowedRoles: ['waiter'],
            permissions: ['create_orders', 'update_orders']
          }
        },
        icon: 'fas fa-clipboard-list',
        isActive: true,
        order: 2,
        type: 'action',
        path: '/dashboard'
      },

      // Customer Menus
      {
        id: 'cust-1',
        name: 'Menu',
        rolePermissions: {
          'customer': {
            canView: true,
            canEdit: false,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['customer'],
            permissions: ['view_menu']
          }
        },
        path: '/customer/menu',
        icon: 'fas fa-utensils',
        isActive: true,
        order: 1
      },
      {
        id: 'cust-2',
        name: 'Orders',
        rolePermissions: {
          'customer': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: true,
            allowedRoles: ['customer'],
            permissions: ['view_orders', 'place_orders']
          }
        },
        icon: 'fas fa-shopping-cart',
        isActive: true,
        order: 2
      },
      {
        id: 'cust-3',
        name: 'Profile',
        rolePermissions: {
          'customer': {
            canView: true,
            canEdit: true,
            canDelete: false,
            canCreate: false,
            allowedRoles: ['customer'],
            permissions: ['manage_profile']
          }
        },
        icon: 'fas fa-user',
        isActive: true,
        order: 3
      }
    ];

    // Initialize staff members
    const staffMembers: StaffMember[] = [
      {
        id: 'staff-1',
        name: 'Amit Kumar',
        email: 'amit@cafex.com',
        phone: '+91 98765 43212',
        role: 'cashier',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
        restaurantId: 'restaurant-1',
        hireDate: new Date('2024-01-15'),
        salary: 25000,
        status: 'active',
        shift: 'morning',
        skills: ['POS System', 'Customer Service', 'Cash Handling'],
        performanceRating: 4.5,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        emergencyContact: {
          name: 'Priya Kumar',
          phone: '+91 98765 43213',
          relationship: 'Wife'
        },
        address: {
          street: '45 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001'
        }
      },
      {
        id: 'staff-2',
        name: 'Sneha Patel',
        email: 'sneha@cafex.com',
        phone: '+91 98765 43213',
        role: 'kitchen_manager',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&crop=face',
        restaurantId: 'restaurant-1',
        hireDate: new Date('2024-02-01'),
        salary: 35000,
        status: 'active',
        shift: 'afternoon',
        skills: ['Food Preparation', 'Kitchen Management', 'Quality Control', 'Recipe Development'],
        performanceRating: 4.8,
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
        emergencyContact: {
          name: 'Raj Patel',
          phone: '+91 98765 43214',
          relationship: 'Father'
        },
        address: {
          street: '78 FC Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411005'
        }
      },
      {
        id: 'staff-3',
        name: 'Rahul Singh',
        email: 'rahul@cafex.com',
        phone: '+91 98765 43214',
        role: 'waiter',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        restaurantId: 'restaurant-1',
        hireDate: new Date('2024-03-10'),
        salary: 20000,
        status: 'active',
        shift: 'evening',
        skills: ['Customer Service', 'Order Taking', 'Table Management'],
        performanceRating: 4.2,
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
        emergencyContact: {
          name: 'Sunita Singh',
          phone: '+91 98765 43215',
          relationship: 'Mother'
        },
        address: {
          street: '12 JM Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411004'
        }
      }
    ];

    // Initialize shift schedules
    const shiftSchedules: ShiftSchedule[] = [
      {
        id: 'shift-1',
        staffId: 'staff-1',
        staffName: 'Amit Kumar',
        date: new Date(),
        shift: 'morning',
        startTime: '09:00',
        endTime: '17:00',
        status: 'completed',
        checkInTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        checkOutTime: new Date(Date.now() - 30 * 1000),
        hoursWorked: 8,
        notes: 'Good performance today'
      },
      {
        id: 'shift-2',
        staffId: 'staff-2',
        staffName: 'Sneha Patel',
        date: new Date(),
        shift: 'afternoon',
        startTime: '14:00',
        endTime: '22:00',
        status: 'scheduled',
        notes: 'Evening shift preparation'
      }
    ];

    // Initialize shift reports
    const shiftReports: ShiftReport[] = [
      {
        id: 'report-1',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        shift: 'morning',
        staffCount: 3,
        totalHours: 24,
        ordersProcessed: 45,
        revenue: 12500,
        customerComplaints: 0,
        incidents: [],
        notes: 'Smooth morning shift. All orders processed on time.',
        managerApproval: true
      },
      {
        id: 'report-2',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        shift: 'evening',
        staffCount: 4,
        totalHours: 32,
        ordersProcessed: 67,
        revenue: 18900,
        customerComplaints: 1,
        incidents: ['Minor delay in order processing'],
        notes: 'Busy evening. One customer complaint about wait time.',
        managerApproval: true
      }
    ];

    // Initialize restaurant settings
    const restaurantSettings: RestaurantSettings[] = [
      {
        id: 'settings-1',
        restaurantId: 'restaurant-1',
        name: 'Cafe-X Restaurant',
        address: {
          street: '123 MG Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India'
        },
        contact: {
          phone: '+91 98765 43210',
          email: 'info@cafex.com',
          website: 'https://cafex.com'
        },
        businessHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '22:00', closed: false }
        },
        taxSettings: {
          gstNumber: '22AAAAA0000A1Z5',
          gstPercentage: 18,
          serviceChargePercentage: 5
        },
        paymentSettings: {
          acceptedPayments: ['cash', 'card', 'upi', 'wallet'],
          defaultPayment: 'upi',
          tipEnabled: true,
          tipOptions: [5, 10, 15, 20]
        },
        operationalSettings: {
          tableCount: 25,
          avgServiceTime: 25,
          reservationEnabled: true,
          onlineOrderingEnabled: true,
          loyaltyProgramEnabled: true
        },
        notifications: {
          lowStockAlerts: true,
          orderAlerts: true,
          paymentAlerts: true,
          staffAlerts: true
        }
      }
    ];

    // Initialize cash drawers
    const cashDrawers: CashDrawer[] = [
      {
        id: 'drawer-1',
        cashierId: '5',
        cashierName: 'Amit Kumar',
        startingFloat: 2000,
        currentBalance: 2450,
        lastUpdated: new Date(),
        status: 'active'
      }
    ];

    // Initialize cash transactions
    const cashTransactions: CashTransaction[] = [
      {
        id: 'txn-1',
        type: 'float_start',
        amount: 2000,
        description: 'Starting float for morning shift',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        cashierId: '5',
        cashierName: 'Amit Kumar'
      },
      {
        id: 'txn-2',
        type: 'safe_deposit',
        amount: -5000,
        description: 'Safe deposit - excess cash',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        cashierId: '5',
        cashierName: 'Amit Kumar',
        approvedBy: 'Manager'
      },
      {
        id: 'txn-3',
        type: 'change_fund',
        amount: 200,
        description: 'Additional change fund',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        cashierId: '5',
        cashierName: 'Amit Kumar'
      }
    ];

    // Initialize shift reconciliations
    const shiftReconciliations: ShiftReconciliation[] = [
      {
        id: 'recon-1',
        shiftId: 'shift-1',
        cashierId: '5',
        cashierName: 'Amit Kumar',
        date: new Date(),
        startingFloat: 2000,
        cashSales: 8500,
        expectedEndingBalance: 2450,
        actualCount: 0,
        variance: 0,
        status: 'pending'
      }
    ];

    // Initialize quick actions
    const quickActions: QuickAction[] = [
      {
        id: 'new-bill',
        name: 'New Bill',
        icon: 'fas fa-plus',
        color: 'bg-blue-500 hover:bg-blue-600',
        action: 'newBill'
      },
      {
        id: 'search-order',
        name: 'Find Order',
        icon: 'fas fa-search',
        color: 'bg-green-500 hover:bg-green-600',
        action: 'searchOrder'
      },
      {
        id: 'split-bill',
        name: 'Split Bill',
        icon: 'fas fa-code-branch',
        color: 'bg-purple-500 hover:bg-purple-600',
        action: 'splitBill'
      },
      {
        id: 'cash-drawer',
        name: 'Cash Drawer',
        icon: 'fas fa-cash-register',
        color: 'bg-yellow-500 hover:bg-yellow-600',
        action: 'openCashDrawer'
      },
      {
        id: 'shift-report',
        name: 'Shift Report',
        icon: 'fas fa-file-alt',
        color: 'bg-red-500 hover:bg-red-600',
        action: 'shiftReport'
      },
      {
        id: 'manager-override',
        name: 'Manager Override',
        icon: 'fas fa-user-shield',
        color: 'bg-indigo-500 hover:bg-indigo-600',
        action: 'managerOverride'
      }
    ];

    // Initialize recent transactions
    const recentTransactions: RecentTransaction[] = [
      {
        id: 'txn-1',
        orderId: 'ORD-2025-1045',
        customerName: 'Amit Patil',
        amount: 483,
        paymentMethod: 'UPI',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success'
      },
      {
        id: 'txn-2',
        orderId: 'ORD-2025-1044',
        customerName: 'Sarah Johnson',
        amount: 250,
        paymentMethod: 'Card',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success'
      },
      {
        id: 'txn-3',
        orderId: 'ORD-2025-1043',
        customerName: 'Raj Kumar',
        amount: 380,
        paymentMethod: 'Cash',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'success'
      }
    ];

    // Initialize cashier stats
    const cashierStats: CashierStats[] = [
      {
        todaysSales: 1113,
        pendingBills: 0,
        activeTables: 12,
        shiftHours: 6.5,
        transactionsToday: 3,
        avgTransactionValue: 371
      }
    ];

    // Initialize order type tabs
    const orderTypeTabs: OrderTypeTab[] = [
      { id: 'dine_in', name: 'Dine In', icon: 'fas fa-utensils', active: true },
      { id: 'dine_direct', name: 'Dine Direct', icon: 'fas fa-concierge-bell', active: false },
      { id: 'takeaway', name: 'Takeaway', icon: 'fas fa-shopping-bag', active: false },
      { id: 'online', name: 'Online', icon: 'fas fa-globe', active: false }
    ];

    // Initialize dine in sub-tabs
    const dineInSubTabs: DineInSubTab[] = [
      { id: 'with_app', name: 'With App', active: true },
      { id: 'without_app', name: 'Without App', active: false }
    ];

    // Initialize menu categories
    const menuCategories: MenuCategory[] = [
      { id: 'appetizers', name: 'Appetizers', icon: 'fas fa-leaf', color: 'bg-green-500' },
      { id: 'mains', name: 'Main Course', icon: 'fas fa-utensils', color: 'bg-blue-500' },
      { id: 'beverages', name: 'Beverages', icon: 'fas fa-coffee', color: 'bg-orange-500' },
      { id: 'desserts', name: 'Desserts', icon: 'fas fa-ice-cream', color: 'bg-pink-500' }
    ];

    // Initialize food menu categories with items
    const foodMenuCategories: FoodMenuCategory[] = [
      {
        key: 'appetizers',
        name: 'Appetizers',
        icon: 'fas fa-leaf',
        isActive: true,
        items: [
          {
            id: 'app-1',
            name: 'Spring Rolls',
            description: 'Crispy vegetable spring rolls with sweet chili sauce',
            price: 120,
            category: 'appetizers',
            image: 'https://images.unsplash.com/photo-1541599468348-e96984315621?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 10
          },
          {
            id: 'app-2',
            name: 'Chicken Wings',
            description: 'Spicy buffalo chicken wings with ranch dip',
            price: 180,
            category: 'appetizers',
            image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: false,
            isSpicy: true,
            preparationTime: 15
          }
        ]
      },
      {
        key: 'main-course',
        name: 'Main Course',
        icon: 'fas fa-utensils',
        isActive: true,
        items: [
          {
            id: 'main-1',
            name: 'Butter Chicken',
            description: 'Creamy tomato-based curry with tender chicken pieces',
            price: 320,
            category: 'main-course',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhcHDKHodUP73sbQofmFqGyCRqgBK3_PmA8w&s',
            isAvailable: true,
            isVegetarian: false,
            isSpicy: true,
            preparationTime: 20
          },
          {
            id: 'main-2',
            name: 'Paneer Tikka Masala',
            description: 'Grilled paneer cubes in rich tomato gravy',
            price: 280,
            category: 'main-course',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: true,
            preparationTime: 18
          },
          {
            id: 'main-3',
            name: 'Biryani',
            description: 'Aromatic basmati rice with meat and spices',
            price: 280,
            category: 'main-course',
            image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: false,
            isSpicy: true,
            preparationTime: 25
          },
          {
            id: 'main-4',
            name: 'Pasta Alfredo',
            description: 'Creamy fettuccine pasta with parmesan cheese',
            price: 250,
            category: 'main-course',
            image: 'https://images.unsplash.com/photo-1551892376-c73ba8b86735?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 15
          }
        ]
      },
      {
        key: 'salads',
        name: 'Salads',
        icon: 'fas fa-seedling',
        isActive: true,
        items: [
          {
            id: 'salad-1',
            name: 'Caesar Salad',
            description: 'Crisp romaine lettuce with caesar dressing',
            price: 180,
            category: 'salads',
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 10
          },
          {
            id: 'salad-2',
            name: 'Greek Salad',
            description: 'Mediterranean salad with feta cheese and olives',
            price: 200,
            category: 'salads',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 8
          }
        ]
      },
      {
        key: 'beverages',
        name: 'Beverages',
        icon: 'fas fa-coffee',
        isActive: true,
        items: [
          {
            id: 'bev-1',
            name: 'Fresh Juice',
            description: 'Freshly squeezed seasonal fruit juice',
            price: 80,
            category: 'beverages',
            image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 5
          },
          {
            id: 'bev-2',
            name: 'Coffee',
            description: 'Premium arabica coffee',
            price: 90,
            category: 'beverages',
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 3
          }
        ]
      },
      {
        key: 'desserts',
        name: 'Desserts',
        icon: 'fas fa-ice-cream',
        isActive: true,
        items: [
          {
            id: 'dessert-1',
            name: 'Chocolate Brownie',
            description: 'Rich chocolate brownie with vanilla ice cream',
            price: 150,
            category: 'desserts',
            image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isSpicy: false,
            preparationTime: 5
          }
        ]
      }
    ];

    // Initialize alert rules
    const alertRules: AlertRule[] = [
      {
        id: '1',
        name: 'New Order Alerts',
        description: 'Notify kitchen when new orders are placed',
        icon: 'fas fa-utensils',
        recipients: 'Kitchen Staff',
        frequency: 'Real-time',
        enabled: true
      },
      {
        id: '2',
        name: 'Payment Failures',
        description: 'Alert managers about failed payment attempts',
        icon: 'fas fa-credit-card',
        recipients: 'Managers',
        frequency: 'Immediate',
        enabled: true
      },
      {
        id: '3',
        name: 'Low Inventory',
        description: 'Warn about items running low in stock',
        icon: 'fas fa-boxes',
        recipients: 'Managers',
        frequency: 'Daily',
        enabled: false
      },
      {
        id: '4',
        name: 'Staff Shift Reminders',
        description: 'Send shift start/end reminders to staff',
        icon: 'fas fa-clock',
        recipients: 'All Staff',
        frequency: '15 min before',
        enabled: true
      }
    ];

    // Initialize restaurant notifications
    const restaurantNotifications: RestaurantNotification[] = [
      {
        id: 'notif-1',
        title: 'New Order Received',
        message: 'Order #ORD-2025-1045 for Hyderabadi Biryani has been placed. Please confirm preparation.',
        type: 'order',
        status: 'delivered',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        recipients: 1,
        sentBy: 'System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'high'
      },
      {
        id: 'notif-2',
        title: 'Payment Failed Alert',
        message: 'Card payment of ₹760 failed for Order #ORD-2025-1044. Customer needs to retry payment.',
        type: 'payment',
        status: 'sent',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        recipients: 1,
        sentBy: 'Payment Gateway',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'high'
      },
      {
        id: 'notif-3',
        title: 'Low Inventory Alert',
        message: 'Margherita Pizza base running low (5 units remaining). Consider reordering soon.',
        type: 'inventory',
        status: 'read',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        recipients: 1,
        sentBy: 'Inventory System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'medium'
      },
      {
        id: 'notif-4',
        title: 'Staff Shift Update',
        message: 'Emma Thompson started her evening shift at 6:00 PM. All staff are now present.',
        type: 'staff',
        status: 'delivered',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        recipients: 1,
        sentBy: 'Staff Management',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'low'
      },
      {
        id: 'notif-5',
        title: 'Menu Item Updated',
        message: 'You successfully updated the price of Chicken Biryani from ₹250 to ₹280.',
        type: 'activity',
        status: 'delivered',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Menu Management',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'low'
      },
      {
        id: 'notif-6',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM. System may be temporarily unavailable.',
        type: 'system',
        status: 'failed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Platform Admin',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'medium'
      },
      {
        id: 'notif-7',
        title: 'Daily Sales Report',
        message: 'Today\'s sales: ₹12,450 with 45 orders. 15% increase from yesterday.',
        type: 'activity',
        status: 'delivered',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Reports System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: true,
        priority: 'low'
      },
      {
        id: 'notif-8',
        title: 'New Customer Registration',
        message: 'John Doe registered as a new customer and placed their first order.',
        type: 'activity',
        status: 'sent',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
        recipients: 1,
        sentBy: 'Customer System',
        targetRoles: ['restaurant_owner'],
        readCount: 1,
        isRead: false,
        priority: 'low'
      }
    ];

    // Initialize loyalty program
    const loyaltyProgram: LoyaltyProgram = {
      name: 'Cafe-X Loyalty Club',
      pointsPerRupee: 1,
      pointsToRupee: 100,
      expiryDays: 365,
      welcomeBonus: 50,
      isActive: true,
      description: 'Earn points on every purchase and redeem for great rewards!'
    };

    // Initialize top loyalty customers
    const loyaltyCustomers: LoyaltyCustomer[] = [
      {
        id: '6',
        name: 'Amit Patil',
        points: 240,
        totalSpent: 12400,
        rank: 1
      },
      {
        id: '7',
        name: 'Sarah Johnson',
        points: 180,
        totalSpent: 8900,
        rank: 2
      }
    ];

    // Initialize loyalty stats
    const loyaltyStatsManage: LoyaltyStatsManage = {
      activeOffers: 0, // Will be calculated from offers
      loyalCustomers: loyaltyCustomers.length,
      avgRedemption: 68,
      revenueBoost: 15000
    };

    // Initialize recent activities
    const recentActivities: any[] = [
      {
        id: '1',
        title: 'Offer Created',
        description: '20% off on all beverages created successfully',
        type: 'offer',
        status: 'active',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Points Redeemed',
        description: 'Amit Patil redeemed 100 points for ₹100 cashback',
        type: 'redemption',
        status: 'completed',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Loyalty Member Added',
        description: 'New customer Sarah Johnson joined loyalty program',
        type: 'customer',
        status: 'active',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    // Initialize payment methods
    const paymentMethods: PaymentMethod[] = [
      {
        id: 'cash',
        name: 'Cash',
        description: 'Cash payment method',
        icon: 'fas fa-money-bill-wave',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        fee: '0%',
        settlement: 'Instant',
        enabled: true
      },
      {
        id: 'card',
        name: 'Card',
        description: 'Credit/Debit card payment',
        icon: 'fas fa-credit-card',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        fee: '1.5%',
        settlement: '2-3 business days',
        enabled: true
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Unified Payments Interface',
        icon: 'fas fa-mobile-alt',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        fee: '0.5%',
        settlement: 'Instant',
        enabled: true
      },
      {
        id: 'wallet',
        name: 'Wallet',
        description: 'Digital wallet payment',
        icon: 'fas fa-wallet',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        fee: '1%',
        settlement: 'Instant',
        enabled: true
      }
    ];

    // Initialize quick amounts
    const quickAmounts: number[] = [100, 200, 500, 1000, 2000];

    // Initialize payment processing configurations
    const paymentGateways: PaymentGatewayConfig[] = [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Popular Indian payment gateway',
        icon: 'fab fa-ravelry',
        fee: '2.0% + ₹3',
        settlement: 'T+1',
        status: 'Active',
        enabled: true
      },
      {
        id: 'payu',
        name: 'PayU',
        description: 'Global payment processing',
        icon: 'fas fa-credit-card',
        fee: '2.5% + ₹3',
        settlement: 'T+2',
        status: 'Active',
        enabled: false
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'International payments',
        icon: 'fab fa-stripe-s',
        fee: '2.9% + ₹30',
        settlement: 'T+7',
        status: 'Inactive',
        enabled: false
      },
      {
        id: 'cashfree',
        name: 'Cashfree',
        description: 'Complete payment solution',
        icon: 'fas fa-university',
        fee: '2.0% + ₹3',
        settlement: 'T+1',
        status: 'Active',
        enabled: true
      }
    ];

    const paymentMethodSettings: PaymentMethods = {
      cards: true,
      upi: true,
      cash: true,
      wallets: false
    };

    const recentCustomerTransactions: RecentCustomerTransaction[] = [
      {
        id: '1',
        description: 'Order #ORD-2025-1045',
        customerName: 'Amit Patil',
        amount: 1264,
        icon: 'fas fa-utensils',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'Success',
        gateway: 'Razorpay'
      },
      {
        id: '2',
        description: 'Order #ORD-2025-1044',
        customerName: 'Sarah Johnson',
        amount: 760,
        icon: 'fas fa-utensils',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'Success',
        gateway: 'Cashfree'
      },
      {
        id: '3',
        description: 'Order #ORD-2025-1043',
        customerName: 'Ravi Kumar',
        amount: 1980,
        icon: 'fas fa-utensils',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'Failed',
        gateway: 'Razorpay'
      },
      {
        id: '4',
        description: 'Order #ORD-2025-1042',
        customerName: 'Emma Thompson',
        amount: 450,
        icon: 'fas fa-utensils',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'Success',
        gateway: 'Cash'
      }
    ];

    const paymentStatsData: PaymentStatsData = {
      todayRevenue: 45280,
      successRate: 97,
      failedPayments: 3,
      avgTransaction: 144
    };

    const paymentStatusConfigs: PaymentStatusConfig[] = [
      { status: 'active', badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-600', label: 'Active' },
      { status: 'inactive', badgeClass: 'bg-gray-100 dark:bg-gray-700 text-gray-600', label: 'Inactive' },
      { status: 'pending', badgeClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', label: 'Pending' },
      { status: 'error', badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-600', label: 'Error' },
      { status: 'success', badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-600', label: 'Success' },
      { status: 'failed', badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-600', label: 'Failed' },
      { status: 'refunded', badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', label: 'Refunded' }
    ];

    // Initialize settings configuration data
    const settingsFilterCategories: SettingsFilterOption[] = [
      { value: 'all', label: 'All Categories' },
      { value: 'general', label: 'General' },
      { value: 'hours', label: 'Business Hours' },
      { value: 'payments', label: 'Payments' },
      { value: 'operations', label: 'Operations' },
      { value: 'notifications', label: 'Notifications' }
    ];

    const settingsFilterStatuses: SettingsFilterOption[] = [
      { value: 'all', label: 'All Status' },
      { value: 'configured', label: 'Configured' },
      { value: 'default', label: 'Default' },
      { value: 'disabled', label: 'Disabled' }
    ];

    const paymentMethodDescriptions: PaymentMethodDescription[] = [
      { method: 'cash', description: 'Physical currency payments' },
      { method: 'card', description: 'Credit/Debit card payments' },
      { method: 'upi', description: 'UPI digital payments' },
      { method: 'wallet', description: 'Digital wallet payments' }
    ];

    const notificationConfigs: NotificationConfig[] = [
      {
        key: 'lowStockAlerts',
        label: 'Low Stock Alerts',
        desc: 'Get notified when inventory items are running low',
        icon: 'fas fa-exclamation-triangle',
        color: 'text-orange-500'
      },
      {
        key: 'orderAlerts',
        label: 'Order Alerts',
        desc: 'Receive notifications for new orders and order status changes',
        icon: 'fas fa-receipt',
        color: 'text-blue-500'
      },
      {
        key: 'paymentAlerts',
        label: 'Payment Alerts',
        desc: 'Notifications for payment processing and failures',
        icon: 'fas fa-credit-card',
        color: 'text-green-500'
      },
      {
        key: 'staffAlerts',
        label: 'Staff Alerts',
        desc: 'Alerts for staff schedule changes and performance issues',
        icon: 'fas fa-users',
        color: 'text-purple-500'
      }
    ];

    const businessDays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const tipOptions: number[] = [5, 10, 15, 20, 25];

    // Initialize staff configuration data
    const staffFormDefaults: StaffFormDefaults = {
      role: 'waiter',
      status: 'active',
      shift: 'morning',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    };

    const scheduleFormDefaults: ScheduleFormDefaults = {
      shift: 'morning',
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled'
    };

    const shiftTimeConfigs: ShiftTimeConfig[] = [
      { shift: 'morning', startTime: '09:00', endTime: '17:00', displayText: 'Morning (9 AM - 5 PM)' },
      { shift: 'afternoon', startTime: '14:00', endTime: '22:00', displayText: 'Afternoon (2 PM - 10 PM)' },
      { shift: 'evening', startTime: '18:00', endTime: '02:00', displayText: 'Evening (6 PM - 2 AM)' },
      { shift: 'night', startTime: '22:00', endTime: '06:00', displayText: 'Night (10 PM - 6 AM)' }
    ];

    const statusBadgeClasses: BadgeClassConfig[] = [
      { value: 'active', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
      { value: 'inactive', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600' },
      { value: 'on_leave', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' }
    ];

    const roleBadgeClasses: BadgeClassConfig[] = [
      { value: 'restaurant_manager', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
      { value: 'kitchen_manager', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
      { value: 'cashier', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
      { value: 'waiter', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' }
    ];

    const statusDisplayTexts: DisplayTextConfig[] = [
      { value: 'active', displayText: 'Active' },
      { value: 'inactive', displayText: 'Inactive' },
      { value: 'on_leave', displayText: 'On Leave' }
    ];

    const roleOptions: SelectOption[] = [
      { value: 'waiter', label: 'Waiter' },
      { value: 'cashier', label: 'Cashier' },
      { value: 'kitchen_manager', label: 'Kitchen Manager' },
      { value: 'restaurant_manager', label: 'Restaurant Manager' }
    ];

    const statusOptions: SelectOption[] = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'on_leave', label: 'On Leave' }
    ];

    const shiftOptions: SelectOption[] = [
      { value: 'morning', label: 'Morning (9 AM - 5 PM)' },
      { value: 'afternoon', label: 'Afternoon (2 PM - 10 PM)' },
      { value: 'evening', label: 'Evening (6 PM - 2 AM)' },
      { value: 'night', label: 'Night (10 PM - 6 AM)' }
    ];

    const scheduleStatusOptions: SelectOption[] = [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'completed', label: 'Completed' },
      { value: 'absent', label: 'Absent' },
      { value: 'late', label: 'Late' }
    ];

    const defaultAvatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face';

    // Initialize owner dashboard configuration data
    const ownerDashboardConfig: OwnerDashboardConfig = {
      badgeClasses: {
        summary: [
          { value: 'excellent', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'good', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { value: 'average', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
          { value: 'poor', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' }
        ],
        performance: [
          { value: '95', className: 'bg-green-500' },
          { value: '85', className: 'bg-blue-500' },
          { value: '75', className: 'bg-yellow-500' },
          { value: 'default', className: 'bg-red-500' }
        ],
        transactionStatus: [
          { value: 'completed', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'pending', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
          { value: 'failed', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' }
        ],
        staffPerformance: [
          { value: '4.5', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: '4.0', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { value: '3.5', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
          { value: 'default', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' }
        ],
        orderStatus: [
          { value: 'completed', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'preparing', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
          { value: 'ready', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { value: 'served', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' }
        ],
        staffStatus: [
          { value: 'active', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'break', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
          { value: 'offline', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600' }
        ],
        paymentStatus: [
          { value: 'paid', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'pending', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
          { value: 'failed', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' }
        ],
        status: [
          { value: 'completed', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'preparing', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
          { value: 'ready', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { value: 'served', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' }
        ],
        metric: [
          { value: 'excellent', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
          { value: 'good', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { value: 'average', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
          { value: 'poor', className: 'bg-red-100 dark:bg-red-900/30 text-red-600' }
        ]
      },
      trendIcons: [
        { trend: 'up', iconClass: 'fas fa-arrow-up text-green-500' },
        { trend: 'down', iconClass: 'fas fa-arrow-down text-red-500' },
        { trend: 'stable', iconClass: 'fas fa-minus text-gray-500' }
      ],
      navigationRoutes: [
        { key: 'menu', route: '/restaurant/menu' },
        { key: 'staff', route: '/restaurant/staff' },
        { key: 'inventory', route: '/restaurant/inventory' },
        { key: 'analytics', route: '/restaurant/analytics' }
      ],
      periodFilterOptions: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' }
      ]
    };

    // Initialize owner dashboard mock data
    const ownerDashboardData: ResOwnerDashboardData = {
      // Key Metrics
      totalRevenue: 245680,
      totalOrders: 1247,
      totalCustomers: 892,
      avgOrderValue: 197,

      // Today's Performance
      todayRevenue: 45680,
      todayOrders: 247,
      todayCustomers: 189,
      todayAvgOrderValue: 185,

      // Recent Orders
      recentOrders: [
        {
          id: 'ORD-2025-1045',
          time: '14:32',
          customer: 'John Doe',
          items: 3,
          amount: 460,
          status: 'Completed',
          paymentMethod: 'Cash'
        },
        {
          id: 'ORD-2025-1044',
          time: '14:28',
          customer: 'Jane Smith',
          items: 2,
          amount: 250,
          status: 'Preparing',
          paymentMethod: 'Card'
        },
        {
          id: 'ORD-2025-1043',
          time: '14:25',
          customer: 'Mike Johnson',
          items: 4,
          amount: 380,
          status: 'Ready',
          paymentMethod: 'UPI'
        },
        {
          id: 'ORD-2025-1042',
          time: '14:20',
          customer: 'Sarah Wilson',
          items: 1,
          amount: 180,
          status: 'Served',
          paymentMethod: 'Cash'
        },
        {
          id: 'ORD-2025-1041',
          time: '14:15',
          customer: 'Tom Brown',
          items: 2,
          amount: 320,
          status: 'Completed',
          paymentMethod: 'Card'
        }
      ],

      // Staff Status
      activeStaff: 8,
      totalStaff: 12,
      staffOnBreak: 2,
      staffPerformance: [
        {
          name: 'Rahul Singh',
          role: 'Cashier',
          ordersProcessed: 89,
          revenue: 16500,
          avgServiceTime: '3.2m',
          rating: 4.8,
          performance: 96,
          status: 'Active'
        },
        {
          name: 'Priya Sharma',
          role: 'Waiter',
          ordersProcessed: 76,
          revenue: 14200,
          avgServiceTime: '3.8m',
          rating: 4.6,
          performance: 92,
          status: 'Active'
        },
        {
          name: 'Amit Kumar',
          role: 'Chef',
          ordersProcessed: 82,
          revenue: 14980,
          avgServiceTime: '3.5m',
          rating: 4.7,
          performance: 94,
          status: 'Active'
        }
      ],

      // Inventory Alerts
      lowStockItems: [
        { name: 'Chicken Breast', current: 5, minimum: 10, unit: 'kg' },
        { name: 'Tomatoes', current: 8, minimum: 15, unit: 'kg' },
        { name: 'Rice', current: 12, minimum: 20, unit: 'kg' }
      ],
      outOfStockItems: [
        { name: 'Special Sauce', current: 0, minimum: 5, unit: 'bottles' },
        { name: 'Garlic Bread', current: 0, minimum: 20, unit: 'pieces' }
      ],

      // Popular Items
      popularItems: [
        { name: 'Butter Chicken', orders: 45, revenue: 13500, trend: 'up' },
        { name: 'Paneer Tikka', orders: 38, revenue: 9500, trend: 'up' },
        { name: 'Biryani', orders: 32, revenue: 12800, trend: 'down' },
        { name: 'Naan', orders: 28, revenue: 1400, trend: 'stable' },
        { name: 'Dal Makhani', orders: 25, revenue: 6250, trend: 'up' }
      ],

      // Financial Summary
      monthlyRevenue: 425680,
      monthlyGrowth: 12.5,
      expenses: 285000,
      profit: 140680,

      // Quick Stats
      pendingOrders: 5,
      completedOrders: 242,
      avgServiceTime: '4.2 min',
      customerSatisfaction: 4.7
    };

    // Initialize shift reports configuration data
    const shiftReportsConfig: ShiftReportsConfig = {
      defaultHoursPerShift: 24,
      dateRangePeriods: [
        { key: 'today', label: 'Today', days: 0 },
        { key: 'week', label: 'This Week', days: 7 },
        { key: 'month', label: 'This Month', days: 30 },
        { key: 'quarter', label: 'This Quarter', days: 90 }
      ],
      shiftBadgeClasses: [
        { value: 'morning', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
        { value: 'afternoon', className: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
        { value: 'evening', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
        { value: 'night', className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' }
      ],
      approvalBadgeClasses: [
        { value: 'approved', className: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
        { value: 'pending', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' }
      ],
      performanceScoreParams: {
        revenueWeight: 1000,
        ordersWeight: 2,
        complaintsPenalty: 5,
        maxScore: 100
      },
      revenueGrowthParams: {
        minGrowth: 5,
        maxGrowth: 25
      },
      shiftTypes: ['morning', 'afternoon', 'evening', 'night'],
      periodFilterOptions: [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'custom', label: 'Custom Range' }
      ],
      shiftFilterOptions: [
        { value: 'morning', label: 'Morning' },
        { value: 'afternoon', label: 'Afternoon' },
        { value: 'evening', label: 'Evening' },
        { value: 'night', label: 'Night' }
      ]
    };

    // Initialize sample menu items
    const sampleMenuItems: MenuItem[] = [
      {
        id: '1',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry',
        price: 320,
        category: 'Main Course',
        image: '',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: true,
        preparationTime: 20
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        description: 'Classic pizza with cheese',
        price: 250,
        category: 'Main Course',
        image: '',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 15
      },
      {
        id: '3',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce salad',
        price: 180,
        category: 'Appetizers',
        image: '',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 10
      }
    ];

    // Initialize sample orders
    const now = new Date();
    const sampleOrders: Order[] = [
      {
        id: 'ORD-2025-1045',
        customerId: 'customer-1',
        customerName: 'Amit Patil',
        tableNumber: 'T-07',
        items: [
          {
            id: 'order-item-1',
            menuItemId: 'item-1',
            menuItemName: 'Hyderabadi Biryani',
            quantity: 2,
            unitPrice: 280,
            totalPrice: 560,
            status: 'ready'
          },
          {
            id: 'order-item-2',
            menuItemId: 'item-2',
            menuItemName: 'Margherita Pizza',
            quantity: 1,
            unitPrice: 250,
            totalPrice: 250,
            status: 'ready'
          }
        ],
        status: 'ready',
        orderType: 'dine_in',
        paymentStatus: 'pending',
        totalAmount: 810,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1044',
        customerId: 'customer-2',
        customerName: 'Sarah Johnson',
        tableNumber: 'T-12',
        items: [
          {
            id: 'order-item-3',
            menuItemId: 'item-2',
            menuItemName: 'Margherita Pizza',
            quantity: 2,
            unitPrice: 250,
            totalPrice: 500,
            status: 'ready'
          }
        ],
        status: 'ready',
        orderType: 'dine_in',
        paymentStatus: 'pending',
        totalAmount: 500,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1043',
        customerId: 'customer-3',
        customerName: 'Raj Kumar',
        tableNumber: 'T-05',
        items: [
          {
            id: 'order-item-4',
            menuItemId: 'item-3',
            menuItemName: 'Butter Chicken',
            quantity: 1,
            unitPrice: 320,
            totalPrice: 320,
            status: 'preparing'
          }
        ],
        status: 'preparing',
        orderType: 'dine_in',
        paymentStatus: 'pending',
        totalAmount: 320,
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000)
      }
    ];

    // Initialize available printers
    const availablePrinters: Printer[] = [
      { id: 'thermal-1', name: 'Thermal Printer 1', type: 'thermal', status: 'online' },
      { id: 'thermal-2', name: 'Thermal Printer 2', type: 'thermal', status: 'offline' },
      { id: 'laser-1', name: 'Laser Printer', type: 'laser', status: 'online' }
    ];

    // Initialize available languages
    const availableLanguages = [
      { code: 'en-IN', name: 'English (India)' },
      { code: 'hi-IN', name: 'हिंदी (India)' },
      { code: 'mr-IN', name: 'मराठी (India)' },
      { code: 'en-US', name: 'English (US)' }
    ];

    // Initialize available currencies
    const availableCurrencies = [
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' }
    ];

    // Initialize default cashier settings
    const defaultCashierSettings: CashierSettings[] = [
      {
        // Display Settings
        theme: 'auto',
        language: 'en-IN',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',

        // Cash Management
        enableCashDrawer: true,
        cashDrawerPort: 'COM1',
        autoOpenDrawer: true,
        cashAlertThreshold: 500,

        // Security Settings
        sessionTimeout: 30,
        requirePasswordForSettings: true,
        enableBiometricLogin: false,
        auditTrailEnabled: true,

        // Notification Settings
        orderReadySound: true,
        paymentSuccessSound: true,
        errorAlerts: true,
        lowCashAlerts: true,

        // Keyboard Shortcuts
        shortcuts: {
          'F1': 'New Order',
          'F2': 'Search Order',
          'F3': 'Payment',
          'F4': 'Print Receipt',
          'F5': 'Hold Bill',
          'F6': 'Void Item',
          'F7': 'Discount',
          'F8': 'Split Bill',
          'F9': 'Manager Override',
          'F10': 'Cash Management',
          'F11': 'Settings',
          'F12': 'Logout'
        }
      }
    ];

    // Initialize current shift report
    const currentShiftNow = new Date();
    const shiftStart = new Date(currentShiftNow.getTime() - 8 * 60 * 60 * 1000); // 8 hours ago
    const currentShiftReport: CashierShiftReport = {
      id: 'SHIFT-' + Date.now(),
      cashierId: '5', // Default cashier ID
      cashierName: 'Amit Kumar',
      shiftStart: shiftStart,
      shiftEnd: currentShiftNow,
      reportType: 'X',
      totalSales: 45280,
      cashSales: 15848,
      cardSales: 20416,
      upiSales: 6792,
      walletSales: 2264,
      totalTransactions: 127,
      averageTransaction: 356,
      openingCash: 5000,
      cashReceived: 15848,
      cashPaidOut: 1200,
      expectedCash: 19648,
      actualCash: 0,
      cashDifference: 0,
      voidedItems: 3,
      voidedAmount: 480,
      discountsApplied: 5,
      discountAmount: 1200,
      refundsProcessed: 1,
      refundAmount: 250,
      status: 'open',
      generatedAt: currentShiftNow
    };

    // Initialize previous shift reports
    const previousShiftReports: CashierShiftReport[] = [
      {
        id: 'SHIFT-20241201-001',
        cashierId: '5',
        cashierName: 'Amit Kumar',
        shiftStart: new Date(currentShiftNow.getTime() - 24 * 60 * 60 * 1000),
        shiftEnd: new Date(currentShiftNow.getTime() - 16 * 60 * 60 * 1000),
        reportType: 'Z',
        totalSales: 38750,
        cashSales: 13512,
        cardSales: 17538,
        upiSales: 5812,
        walletSales: 1888,
        totalTransactions: 98,
        averageTransaction: 395,
        openingCash: 5000,
        cashReceived: 13512,
        cashPaidOut: 800,
        expectedCash: 17712,
        actualCash: 17712,
        cashDifference: 0,
        voidedItems: 2,
        voidedAmount: 320,
        discountsApplied: 4,
        discountAmount: 950,
        refundsProcessed: 0,
        refundAmount: 0,
        status: 'closed',
        generatedAt: new Date(currentShiftNow.getTime() - 16 * 60 * 60 * 1000)
      },
      {
        id: 'SHIFT-20241130-002',
        cashierId: '5',
        cashierName: 'Amit Kumar',
        shiftStart: new Date(currentShiftNow.getTime() - 48 * 60 * 60 * 1000),
        shiftEnd: new Date(currentShiftNow.getTime() - 40 * 60 * 60 * 1000),
        reportType: 'Z',
        totalSales: 42100,
        cashSales: 14735,
        cardSales: 19040,
        upiSales: 6310,
        walletSales: 2015,
        totalTransactions: 112,
        averageTransaction: 376,
        openingCash: 5000,
        cashReceived: 14735,
        cashPaidOut: 950,
        expectedCash: 18785,
        actualCash: 18785,
        cashDifference: 0,
        voidedItems: 1,
        voidedAmount: 180,
        discountsApplied: 6,
        discountAmount: 1350,
        refundsProcessed: 1,
        refundAmount: 320,
        status: 'closed',
        generatedAt: new Date(currentShiftNow.getTime() - 40 * 60 * 60 * 1000)
      }
    ];

    // Initialize payment method summary
    const paymentMethodSummary: PaymentMethodSummary[] = [
      {
        method: 'Card',
        amount: currentShiftReport.cardSales,
        percentage: (currentShiftReport.cardSales / currentShiftReport.totalSales) * 100,
        transactions: Math.round(currentShiftReport.totalTransactions * 0.45),
        color: 'bg-blue-500'
      },
      {
        method: 'Cash',
        amount: currentShiftReport.cashSales,
        percentage: (currentShiftReport.cashSales / currentShiftReport.totalSales) * 100,
        transactions: Math.round(currentShiftReport.totalTransactions * 0.35),
        color: 'bg-yellow-500'
      },
      {
        method: 'UPI',
        amount: currentShiftReport.upiSales,
        percentage: (currentShiftReport.upiSales / currentShiftReport.totalSales) * 100,
        transactions: Math.round(currentShiftReport.totalTransactions * 0.15),
        color: 'bg-purple-500'
      },
      {
        method: 'Wallet',
        amount: currentShiftReport.walletSales,
        percentage: (currentShiftReport.walletSales / currentShiftReport.totalSales) * 100,
        transactions: Math.round(currentShiftReport.totalTransactions * 0.05),
        color: 'bg-green-500'
      }
    ];

    // Initialize hourly sales data
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const hourlySalesData: HourlySalesData[] = hours.map(hour => ({
      hour,
      sales: Math.floor(Math.random() * 5000) + 2000,
      transactions: Math.floor(Math.random() * 15) + 5
    }));

    // Initialize transaction search data
    const transactionNow = new Date();
    const transactionSearchResults: TransactionSearchResult[] = [
      {
        orderId: 'ORD-20241201-001',
        customerName: 'Amit Patil',
        tableNumber: 'T-07',
        totalAmount: 483,
        paymentMethod: 'Card',
        status: 'completed',
        timestamp: new Date(transactionNow.getTime() - 2 * 60 * 60 * 1000),
        cashierName: 'Amit Kumar',
        items: [
          { name: 'Hyderabadi Biryani', quantity: 2, price: 280 },
          { name: 'Margherita Pizza', quantity: 1, price: 250 }
        ]
      },
      {
        orderId: 'ORD-20241201-002',
        customerName: 'Sarah Johnson',
        tableNumber: 'T-12',
        totalAmount: 250,
        paymentMethod: 'Cash',
        status: 'completed',
        timestamp: new Date(transactionNow.getTime() - 4 * 60 * 60 * 1000),
        cashierName: 'Amit Kumar',
        items: [
          { name: 'Margherita Pizza', quantity: 2, price: 250 }
        ]
      },
      {
        orderId: 'ORD-20241201-003',
        customerName: 'Raj Kumar',
        tableNumber: 'T-05',
        totalAmount: 320,
        paymentMethod: 'UPI',
        status: 'refunded',
        timestamp: new Date(transactionNow.getTime() - 6 * 60 * 60 * 1000),
        cashierName: 'Amit Kumar',
        items: [
          { name: 'Butter Chicken', quantity: 1, price: 320 }
        ],
        modifications: [
          {
            type: 'refund',
            amount: 320,
            reason: 'Customer complaint - cold food',
            timestamp: new Date(transactionNow.getTime() - 5 * 60 * 60 * 1000)
          }
        ]
      },
      {
        orderId: 'ORD-20241130-045',
        customerName: 'Priya Sharma',
        tableNumber: 'T-08',
        totalAmount: 1250,
        paymentMethod: 'Card',
        status: 'completed',
        timestamp: new Date(transactionNow.getTime() - 24 * 60 * 60 * 1000),
        cashierName: 'Amit Kumar',
        items: [
          { name: 'Paneer Butter Masala', quantity: 2, price: 350 },
          { name: 'Garlic Naan', quantity: 4, price: 80 },
          { name: 'Ras Malai', quantity: 2, price: 120 }
        ]
      },
      {
        orderId: 'ORD-20241201-004',
        customerName: 'David Chen',
        tableNumber: 'T-15',
        totalAmount: 180,
        paymentMethod: 'Wallet',
        status: 'voided',
        timestamp: new Date(transactionNow.getTime() - 30 * 60 * 1000),
        cashierName: 'Amit Kumar',
        items: [
          { name: 'Coffee', quantity: 2, price: 90 }
        ],
        modifications: [
          {
            type: 'void',
            amount: 180,
            reason: 'Wrong order entry',
            timestamp: new Date(transactionNow.getTime() - 25 * 60 * 1000)
          }
        ]
      }
    ];

    // Initialize available options for transaction search
    const availablePaymentMethods = ['Cash', 'Card', 'UPI', 'Wallet'];
    const availableStatuses = ['completed', 'refunded', 'voided', 'pending'];
    const availableCashiers = ['Amit Kumar'];

    // Initialize API management data
    const apiKeys: APIKey[] = [
      {
        id: '1',
        name: 'Production API Key',
        key: 'cafex_prod_1234567890abcdef',
        maskedKey: 'cafe...cdef',
        createdBy: 'admin@cafex.com',
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        permissions: ['read', 'write', 'delete'],
        rateLimit: 5000,
        status: 'active',
        usage: {
          requests: 15420,
          limit: 5000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '2',
        name: 'Development API Key',
        key: 'cafex_dev_abcdef1234567890',
        maskedKey: 'cafe...890',
        createdBy: 'dev@cafex.com',
        createdAt: new Date('2024-02-01'),
        lastUsed: new Date(Date.now() - 30 * 60 * 1000),
        permissions: ['read', 'write'],
        rateLimit: 1000,
        status: 'active',
        usage: {
          requests: 450,
          limit: 1000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '3',
        name: 'Mobile App API Key',
        key: 'cafex_mobile_0987654321fedcba',
        maskedKey: 'cafe...cba',
        createdBy: 'mobile@cafex.com',
        createdAt: new Date('2024-03-10'),
        lastUsed: new Date(Date.now() - 15 * 60 * 1000),
        permissions: ['read'],
        rateLimit: 2000,
        status: 'active',
        usage: {
          requests: 2890,
          limit: 2000,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    ];

    const apiEndpoints: APIEndpoint[] = [
      {
        id: '1',
        path: '/api/auth/login',
        method: 'POST',
        description: 'Authenticate user and return JWT token',
        category: 'authentication',
        version: 'v1',
        rateLimit: 10,
        requiresAuth: false,
        status: 'active',
        lastCalled: new Date(Date.now() - 5 * 60 * 1000),
        callCount: 1250
      },
      {
        id: '2',
        path: '/api/restaurants',
        method: 'GET',
        description: 'Get list of restaurants with filters',
        category: 'restaurants',
        version: 'v1',
        rateLimit: 100,
        requiresAuth: true,
        status: 'active',
        lastCalled: new Date(Date.now() - 2 * 60 * 1000),
        callCount: 8900
      },
      {
        id: '3',
        path: '/api/orders',
        method: 'POST',
        description: 'Create a new order',
        category: 'orders',
        version: 'v1',
        rateLimit: 50,
        requiresAuth: true,
        status: 'active',
        lastCalled: new Date(Date.now() - 1 * 60 * 1000),
        callCount: 12500
      },
      {
        id: '4',
        path: '/api/menu/items',
        method: 'GET',
        description: 'Get menu items for a restaurant',
        category: 'restaurants',
        version: 'v1',
        rateLimit: 200,
        requiresAuth: false,
        status: 'active',
        lastCalled: new Date(Date.now() - 10 * 60 * 1000),
        callCount: 6700
      },
      {
        id: '5',
        path: '/api/analytics/revenue',
        method: 'GET',
        description: 'Get revenue analytics data',
        category: 'analytics',
        version: 'v1',
        rateLimit: 20,
        requiresAuth: true,
        status: 'active',
        lastCalled: new Date(Date.now() - 30 * 60 * 1000),
        callCount: 3800
      },
      {
        id: '6',
        path: '/api/webhooks/orders',
        method: 'POST',
        description: 'Webhook endpoint for order events',
        category: 'webhooks',
        version: 'v1',
        rateLimit: 1000,
        requiresAuth: false,
        status: 'active',
        lastCalled: new Date(Date.now() - 3 * 60 * 1000),
        callCount: 450
      }
    ];

    const apiMetrics: APIMetrics = {
      totalRequests: 45280,
      activeKeys: 23,
      failedRequests: 145,
      averageResponseTime: 245,
      uptime: 99.7,
      topEndpoints: [
        { endpoint: '/api/orders', calls: 12500 },
        { endpoint: '/api/restaurants', calls: 8900 },
        { endpoint: '/api/menu', calls: 6700 },
        { endpoint: '/api/users', calls: 5200 },
        { endpoint: '/api/analytics', calls: 3800 }
      ]
    };

    // Initialize integrations data
    const integrations: Integration[] = [
      {
        id: 'stripe',
        name: 'Stripe Payments',
        description: 'Accept credit card payments securely',
        category: 'payment',
        provider: 'Stripe Inc.',
        icon: 'fab fa-stripe-s',
        status: 'connected',
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'sk_test_...',
          webhookUrl: 'https://api.cafex.com/webhooks/stripe'
        },
        features: ['Credit Cards', 'Digital Wallets', 'Refunds', 'Subscriptions'],
        pricing: {
          plan: 'Standard',
          cost: 29,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Indian payment gateway for UPI, cards, and net banking',
        category: 'payment',
        provider: 'Razorpay Software Pvt Ltd',
        icon: 'fas fa-credit-card',
        status: 'connected',
        lastSync: new Date(Date.now() - 15 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'rzp_test_...',
          apiSecret: 'secret_...',
          webhookUrl: 'https://api.cafex.com/webhooks/razorpay'
        },
        features: ['UPI', 'Credit Cards', 'Net Banking', 'Wallets'],
        pricing: {
          plan: 'Business',
          cost: 0,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'swiggy',
        name: 'Swiggy Delivery',
        description: 'Food delivery integration with Swiggy platform',
        category: 'delivery',
        provider: 'Swiggy',
        icon: 'fas fa-truck',
        status: 'connected',
        lastSync: new Date(Date.now() - 45 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'swiggy_api_...',
          webhookUrl: 'https://api.cafex.com/webhooks/swiggy'
        },
        features: ['Order Sync', 'Real-time Tracking', 'Delivery Updates'],
        pricing: {
          plan: 'Premium',
          cost: 499,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'zomato',
        name: 'Zomato Partner',
        description: 'Integration with Zomato food delivery network',
        category: 'delivery',
        provider: 'Zomato',
        icon: 'fas fa-utensils',
        status: 'disconnected',
        syncStatus: 'failed',
        config: {},
        features: ['Menu Sync', 'Order Management', 'Reviews'],
        pricing: {
          plan: 'Gold',
          cost: 799,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'twilio',
        name: 'Twilio SMS',
        description: 'Send SMS notifications to customers and staff',
        category: 'communication',
        provider: 'Twilio Inc.',
        icon: 'fas fa-sms',
        status: 'connected',
        lastSync: new Date(Date.now() - 60 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'SK_...',
          apiSecret: 'secret_...'
        },
        features: ['SMS Notifications', 'OTP Verification', 'Marketing Messages'],
        pricing: {
          plan: 'Starter',
          cost: 15,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'sendgrid',
        name: 'SendGrid Email',
        description: 'Transactional and marketing email delivery',
        category: 'communication',
        provider: 'SendGrid',
        icon: 'fas fa-envelope',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'SG_...'
        },
        features: ['Transactional Emails', 'Marketing Campaigns', 'Templates'],
        pricing: {
          plan: 'Essentials',
          cost: 20,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'google_analytics',
        name: 'Google Analytics',
        description: 'Track website and app usage analytics',
        category: 'analytics',
        provider: 'Google',
        icon: 'fab fa-google',
        status: 'connected',
        lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000),
        syncStatus: 'success',
        config: {
          apiKey: 'GA_...'
        },
        features: ['User Tracking', 'Conversion Tracking', 'Custom Reports'],
        pricing: {
          plan: 'Free',
          cost: 0,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'facebook_pixel',
        name: 'Facebook Pixel',
        description: 'Track conversions and optimize Facebook ads',
        category: 'social',
        provider: 'Meta',
        icon: 'fab fa-facebook',
        status: 'configuring',
        config: {},
        features: ['Conversion Tracking', 'Audience Building', 'Retargeting'],
        pricing: {
          plan: 'Free',
          cost: 0,
          billingCycle: 'monthly'
        }
      },
      {
        id: 'square_pos',
        name: 'Square POS',
        description: 'Alternative POS system integration',
        category: 'pos',
        provider: 'Square Inc.',
        icon: 'fas fa-cash-register',
        status: 'error',
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
        syncStatus: 'failed',
        config: {
          apiKey: 'sq0_...'
        },
        features: ['POS Sync', 'Inventory Management', 'Payment Processing'],
        pricing: {
          plan: 'Plus',
          cost: 29,
          billingCycle: 'monthly'
        }
      }
    ];

    const integrationMetrics: IntegrationMetrics = {
      totalIntegrations: 12,
      activeIntegrations: 9,
      failedSyncs: 2,
      dataTransferred: 245680,
      uptime: 98.5
    };

    // Initialize navigation management data
    const navigationRoles: string[] = ['platform_owner', 'restaurant_owner', 'restaurant_manager', 'cashier', 'kitchen_manager', 'waiter', 'customer', 'all'];
    const navigationStatuses: string[] = ['active', 'inactive'];

    // Initialize plan management data
    const subscriptionPlans: SubscriptionPlan[] = [
      {
        id: 'starter',
        name: 'starter',
        displayName: 'Starter Plan',
        description: 'Perfect for small restaurants getting started with digital transformation',
        price: 999,
        currency: 'INR',
        billingCycle: 'monthly',
        maxRestaurants: 1,
        maxUsers: 5,
        features: ['basic_pos', 'menu_management', 'order_management', 'basic_reports'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        subscriberCount: 45,
        revenue: 44555
      },
      {
        id: 'professional',
        name: 'professional',
        displayName: 'Professional Plan',
        description: 'Advanced features for growing restaurants with multiple locations',
        price: 2499,
        currency: 'INR',
        billingCycle: 'monthly',
        maxRestaurants: 5,
        maxUsers: 25,
        features: ['basic_pos', 'menu_management', 'order_management', 'advanced_reports', 'inventory_management', 'staff_management', 'customer_loyalty'],
        isActive: true,
        isPopular: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        subscriberCount: 28,
        revenue: 69720
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        displayName: 'Enterprise Plan',
        description: 'Complete solution for large restaurant chains with advanced analytics',
        price: 4999,
        currency: 'INR',
        billingCycle: 'monthly',
        maxRestaurants: -1, // unlimited
        maxUsers: -1, // unlimited
        features: ['basic_pos', 'menu_management', 'order_management', 'advanced_reports', 'inventory_management', 'staff_management', 'customer_loyalty', 'advanced_analytics', 'api_access', 'white_label', 'priority_support'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        subscriberCount: 8,
        revenue: 39920
      }
    ];

    const planFeatures: PlanFeature[] = [
      { id: 'basic_pos', name: 'Basic POS System', description: 'Essential point of sale functionality', category: 'core', isEnabled: true },
      { id: 'menu_management', name: 'Menu Management', description: 'Digital menu creation and management', category: 'core', isEnabled: true },
      { id: 'order_management', name: 'Order Management', description: 'Online and offline order processing', category: 'core', isEnabled: true },
      { id: 'basic_reports', name: 'Basic Reports', description: 'Essential sales and performance reports', category: 'core', isEnabled: true },
      { id: 'advanced_reports', name: 'Advanced Reports', description: 'Detailed analytics and custom reports', category: 'advanced', isEnabled: true },
      { id: 'inventory_management', name: 'Inventory Management', description: 'Stock tracking and supplier management', category: 'advanced', isEnabled: true },
      { id: 'staff_management', name: 'Staff Management', description: 'Employee scheduling and performance tracking', category: 'advanced', isEnabled: true },
      { id: 'customer_loyalty', name: 'Customer Loyalty', description: 'Loyalty programs and customer insights', category: 'advanced', isEnabled: true },
      { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'AI-powered insights and predictions', category: 'premium', isEnabled: true },
      { id: 'api_access', name: 'API Access', description: 'Full API access for integrations', category: 'premium', isEnabled: true },
      { id: 'white_label', name: 'White Label Solution', description: 'Custom branding and white-label options', category: 'premium', isEnabled: true },
      { id: 'priority_support', name: 'Priority Support', description: '24/7 priority customer support', category: 'premium', isEnabled: true }
    ];

    // Initialize platform dashboard data
    const platformDashboardData = {
      revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [32000, 35000, 38000, 42000, 45000, 45600]
      },
      subscriptionChart: {
        labels: ['Pro Plan', 'Starter Plan', 'Enterprise'],
        data: [12, 6, 6]
      }
    };

    // Initialize restaurant data
    const restaurants: Restaurant[] = [
      {
        id: 1,
        name: "RK's Cafe",
        email: 'powner@cafex.com',
        phone: '98765 43217',
        owner_name: 'Rishabh Khandekar',
        owner_email: 'powner@cafex.com',
        owner_phone: '+91 98765 43217',
        subscription_plan: 'Pro Plan',
        subscription_start_date: new Date('2024-01-15'),
        subscription_end_date: new Date('2025-01-15'),
        gst_number: 'GST123456789',
        license_number: 'LIC123456',
        status: 'ACTIVE',
        is_active: true,
        description: 'A cozy cafe in Mumbai',
        state: 1,
        city: 'Mumbai',
        pincode: 400001,
        address: '123 Main Street',
        lat: 19.0760,
        long: 72.8777,
        created_at: new Date('2024-01-15'),
        created_by: 1,
        updated_at: new Date('2024-01-15'),
        updated_by: 1
      },
      {
        id: 2,
        name: "Res-Owner User's Restaurant",
        email: 'rowner@restaurant.com',
        phone: '98765 43210',
        owner_name: 'Res-Owner User',
        owner_email: 'rowner@restaurant.com',
        owner_phone: '+91 98765 43210',
        subscription_plan: 'Starter Plan',
        subscription_start_date: new Date('2024-02-20'),
        subscription_end_date: new Date('2025-02-20'),
        gst_number: 'GST987654321',
        license_number: 'LIC987654',
        status: 'ACTIVE',
        is_active: true,
        description: 'Business dining in Delhi',
        state: 2,
        city: 'Delhi',
        pincode: 110001,
        address: '456 Business Avenue',
        lat: 28.7041,
        long: 77.1025,
        created_at: new Date('2024-02-20'),
        created_by: 2,
        updated_at: new Date('2024-02-20'),
        updated_by: 2
      },
      {
        id: 3,
        name: 'Premium Dine',
        email: 'rmanager@cafex.com',
        phone: '98765 43211',
        owner_name: 'Priya Sharma',
        owner_email: 'rmanager@cafex.com',
        owner_phone: '+91 98765 43211',
        subscription_plan: 'Enterprise',
        subscription_start_date: new Date('2024-03-10'),
        subscription_end_date: new Date('2025-03-10'),
        gst_number: 'GST456789123',
        license_number: 'LIC456789',
        status: 'ACTIVE',
        is_active: true,
        description: 'Premium dining experience in Bangalore',
        state: 3,
        city: 'Bangalore',
        pincode: 560001,
        address: '789 Food Court',
        lat: 12.9716,
        long: 77.5946,
        created_at: new Date('2024-03-10'),
        created_by: 3,
        updated_at: new Date('2024-03-10'),
        updated_by: 3
      }
    ];

    // Initialize security policies
    const securityPolicies: SecurityPolicy[] = [
      {
        id: 'password_policy',
        name: 'Password Policy',
        description: 'Enforce strong password requirements and regular changes',
        category: 'authentication',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'two_factor_auth',
        name: 'Two-Factor Authentication',
        description: 'Require 2FA for all administrative accounts',
        category: 'authentication',
        enabled: true,
        severity: 'critical',
        lastUpdated: new Date(),
        violations: 2
      },
      {
        id: 'session_management',
        name: 'Session Management',
        description: 'Automatic session timeout and concurrent session limits',
        category: 'authentication',
        enabled: true,
        severity: 'medium',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'role_based_access',
        name: 'Role-Based Access Control',
        description: 'Enforce role-based permissions and access restrictions',
        category: 'authorization',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 1
      },
      {
        id: 'data_encryption',
        name: 'Data Encryption',
        description: 'Encrypt sensitive data at rest and in transit',
        category: 'encryption',
        enabled: true,
        severity: 'critical',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'audit_logging',
        name: 'Audit Logging',
        description: 'Log all security-relevant events and activities',
        category: 'monitoring',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 0
      },
      {
        id: 'intrusion_detection',
        name: 'Intrusion Detection',
        description: 'Monitor and detect suspicious activities',
        category: 'monitoring',
        enabled: true,
        severity: 'high',
        lastUpdated: new Date(),
        violations: 3
      },
      {
        id: 'gdpr_compliance',
        name: 'GDPR Compliance',
        description: 'Ensure compliance with data protection regulations',
        category: 'compliance',
        enabled: true,
        severity: 'critical',
        lastUpdated: new Date(),
        violations: 0
      }
    ];

    // Initialize security logs
    const securityLogs: SecurityLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        event: 'Failed Login Attempt',
        user: 'unknown',
        ipAddress: '192.168.1.100',
        severity: 'medium',
        status: 'failure',
        details: 'Multiple failed login attempts from IP address'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        event: 'Password Changed',
        user: 'admin@cafex.com',
        ipAddress: '10.0.0.1',
        severity: 'low',
        status: 'success',
        details: 'User password successfully updated'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        event: 'Suspicious Activity',
        user: 'user@restaurant.com',
        ipAddress: '203.0.113.1',
        severity: 'high',
        status: 'warning',
        details: 'Unusual login pattern detected'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        event: 'Role Permission Changed',
        user: 'admin@cafex.com',
        ipAddress: '10.0.0.1',
        severity: 'medium',
        status: 'success',
        details: 'User role permissions updated'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        event: 'Security Scan Completed',
        user: 'system',
        ipAddress: '127.0.0.1',
        severity: 'low',
        status: 'success',
        details: 'Automated security scan completed successfully'
      }
    ];

    // Initialize security metrics
    const securityMetrics: SecurityMetrics = {
      totalUsers: 245,
      activeSessions: 89,
      failedLoginAttempts: 23,
      blockedIPs: 5,
      securityAlerts: 3,
      lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      complianceScore: 94.2
    };

    // Initialize subscription metrics
    const subscriptionMetrics: SubscriptionMetrics = {
      totalRevenue: 154195,
      monthlyRecurringRevenue: 44555,
      annualRecurringRevenue: 109640,
      totalSubscribers: 81,
      activeSubscribers: 73,
      churnRate: 8.5,
      averageRevenuePerUser: 1901,
      lifetimeValue: 22812,
      conversionRate: 67.3
    };

    // Initialize plan analytics
    const planAnalytics: PlanAnalytics[] = [
      {
        planId: 'starter',
        planName: 'Starter Plan',
        subscriberCount: 45,
        revenue: 44555,
        churnRate: 12.5,
        growthRate: 8.2,
        averageTenure: 8.5
      },
      {
        planId: 'professional',
        planName: 'Professional Plan',
        subscriberCount: 28,
        revenue: 69720,
        churnRate: 5.2,
        growthRate: 15.8,
        averageTenure: 12.3
      },
      {
        planId: 'enterprise',
        planName: 'Enterprise Plan',
        subscriberCount: 8,
        revenue: 39920,
        churnRate: 2.1,
        growthRate: 22.4,
        averageTenure: 18.7
      }
    ];

    // Initialize revenue data
    const revenueData: RevenueData[] = [
      { month: 'Jan', revenue: 32000, newSubscribers: 8, churnedSubscribers: 2, planBreakdown: { starter: 8000, professional: 16000, enterprise: 8000 } },
      { month: 'Feb', revenue: 35000, newSubscribers: 12, churnedSubscribers: 3, planBreakdown: { starter: 10000, professional: 18000, enterprise: 7000 } },
      { month: 'Mar', revenue: 38000, newSubscribers: 15, churnedSubscribers: 4, planBreakdown: { starter: 12000, professional: 20000, enterprise: 6000 } },
      { month: 'Apr', revenue: 42000, newSubscribers: 18, churnedSubscribers: 3, planBreakdown: { starter: 14000, professional: 22000, enterprise: 6000 } },
      { month: 'May', revenue: 45000, newSubscribers: 20, churnedSubscribers: 5, planBreakdown: { starter: 15000, professional: 24000, enterprise: 6000 } },
      { month: 'Jun', revenue: 45600, newSubscribers: 8, churnedSubscribers: 2, planBreakdown: { starter: 15600, professional: 24000, enterprise: 6000 } }
    ];

        // Initialize broadcast messages
    const broadcastMessages: BroadcastMessage[] = [
      {
        id: 'broadcast-1',
        title: 'Platform Maintenance Notice',
        message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM IST. All services will be temporarily unavailable.',
        type: 'maintenance',
        priority: 'high',
        status: 'sent',
        targetAudience: 'all',
        sentBy: 'Platform Admin',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalRecipients: 1500,
        readCount: 1200,
        engagementRate: 80,
        deliveryStatus: 'completed'
      },
      {
        id: 'broadcast-2',
        title: 'New Feature: Digital Menu Updates',
        message: 'Exciting news! You can now update your restaurant menus digitally. Check out the new menu management features.',
        type: 'update',
        priority: 'medium',
        status: 'scheduled',
        targetAudience: 'restaurants',
        sentBy: 'Product Team',
        scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000),
        totalRecipients: 24,
        readCount: 0,
        engagementRate: 0,
        deliveryStatus: 'pending',
        ctaText: 'Explore New Features',
        ctaUrl: '/restaurant/menu'
      },
      {
        id: 'broadcast-3',
        title: 'Happy Hour Promotion',
        message: 'Enjoy 20% off on all beverages during happy hour (5-7 PM)! Limited time offer for our valued customers.',
        type: 'promotion',
        priority: 'medium',
        status: 'sent',
        targetAudience: 'customers',
        sentBy: 'Marketing Team',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        totalRecipients: 1200,
        readCount: 800,
        engagementRate: 67,
        deliveryStatus: 'completed',
        ctaText: 'Order Now',
        ctaUrl: '/customer/menu'
      },
      {
        id: 'broadcast-4',
        title: 'Emergency: System Alert',
        message: 'URGENT: System experiencing high load. Some services may be slow. We are working to resolve this immediately.',
        type: 'emergency',
        priority: 'critical',
        status: 'sent',
        targetAudience: 'all',
        sentBy: 'System Admin',
        sentAt: new Date(Date.now() - 30 * 60 * 1000),
        totalRecipients: 1500,
        readCount: 1450,
        engagementRate: 97,
        deliveryStatus: 'completed'
      }
    ];

        // Initialize feature access control data
    const features: Feature[] = [
      {
        id: 'basic_pos',
        name: 'Basic POS System',
        description: 'Essential point of sale functionality with order processing',
        category: 'core',
        module: 'POS',
        isEnabled: true,
        requiresPlan: ['starter', 'professional', 'enterprise']
      },
      {
        id: 'menu_management',
        name: 'Menu Management',
        description: 'Create and manage digital menus with categories and pricing',
        category: 'core',
        module: 'Menu',
        isEnabled: true,
        requiresPlan: ['starter', 'professional', 'enterprise']
      },
      {
        id: 'inventory_management',
        name: 'Inventory Management',
        description: 'Track stock levels, suppliers, and automatic reorder alerts',
        category: 'advanced',
        module: 'Inventory',
        isEnabled: true,
        requiresPlan: ['professional', 'enterprise'],
        restrictions: { maxUsage: 1000 }
      },
      {
        id: 'staff_management',
        name: 'Staff Management',
        description: 'Employee scheduling, time tracking, and performance analytics',
        category: 'advanced',
        module: 'Staff',
        isEnabled: true,
        requiresPlan: ['professional', 'enterprise'],
        restrictions: { userLimit: 25 }
      },
      {
        id: 'customer_loyalty',
        name: 'Customer Loyalty Program',
        description: 'Loyalty points, rewards, and customer retention tools',
        category: 'advanced',
        module: 'CRM',
        isEnabled: true,
        requiresPlan: ['professional', 'enterprise']
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'AI-powered insights, predictive analytics, and custom reports',
        category: 'premium',
        module: 'Analytics',
        isEnabled: true,
        requiresPlan: ['enterprise'],
        dependencies: ['basic_reports']
      },
      {
        id: 'api_access',
        name: 'API Access',
        description: 'Full REST API access for custom integrations',
        category: 'premium',
        module: 'Integration',
        isEnabled: true,
        requiresPlan: ['enterprise']
      },
      {
        id: 'white_label',
        name: 'White Label Solution',
        description: 'Custom branding, domain, and white-label options',
        category: 'premium',
        module: 'Branding',
        isEnabled: true,
        requiresPlan: ['enterprise']
      }
    ];

    const planFeatureAccess: PlanFeatureAccess[] = [
      {
        planId: 'starter',
        planName: 'Starter Plan',
        features: {
          basic_pos: true,
          menu_management: true,
          inventory_management: false,
          staff_management: false,
          customer_loyalty: false,
          advanced_analytics: false,
          api_access: false,
          white_label: false
        },
        limits: {}
      },
      {
        planId: 'professional',
        planName: 'Professional Plan',
        features: {
          basic_pos: true,
          menu_management: true,
          inventory_management: true,
          staff_management: true,
          customer_loyalty: true,
          advanced_analytics: false,
          api_access: false,
          white_label: false
        },
        limits: {
          inventory_management: { maxUsage: 1000 },
          staff_management: { userLimit: 25 }
        }
      },
      {
        planId: 'enterprise',
        planName: 'Enterprise Plan',
        features: {
          basic_pos: true,
          menu_management: true,
          inventory_management: true,
          staff_management: true,
          customer_loyalty: true,
          advanced_analytics: true,
          api_access: true,
          white_label: true
        },
        limits: {}
      }
    ];

    const roleFeatureAccess: RoleFeatureAccess[] = [
      {
        roleId: 'platform_owner',
        roleName: 'Platform Owner',
        features: {
          basic_pos: true,
          menu_management: true,
          inventory_management: true,
          staff_management: true,
          customer_loyalty: true,
          advanced_analytics: true,
          api_access: true,
          white_label: true
        },
        permissions: {
          basic_pos: ['create', 'read', 'update', 'delete'],
          menu_management: ['create', 'read', 'update', 'delete'],
          inventory_management: ['create', 'read', 'update', 'delete'],
          staff_management: ['create', 'read', 'update', 'delete'],
          customer_loyalty: ['create', 'read', 'update', 'delete'],
          advanced_analytics: ['read'],
          api_access: ['create', 'read', 'update', 'delete'],
          white_label: ['create', 'read', 'update', 'delete']
        }
      },
      {
        roleId: 'restaurant_owner',
        roleName: 'Restaurant Owner',
        features: {
          basic_pos: true,
          menu_management: true,
          inventory_management: true,
          staff_management: true,
          customer_loyalty: true,
          advanced_analytics: false,
          api_access: false,
          white_label: false
        },
        permissions: {
          basic_pos: ['create', 'read', 'update', 'delete'],
          menu_management: ['create', 'read', 'update', 'delete'],
          inventory_management: ['create', 'read', 'update', 'delete'],
          staff_management: ['create', 'read', 'update', 'delete'],
          customer_loyalty: ['create', 'read', 'update', 'delete']
        }
      }
    ];

        // Initialize system alerts
    const systemAlerts: SystemAlert[] = [
      {
        id: 'alert-1',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for tonight from 2:00 AM to 4:00 AM IST. Platform will be unavailable during this period.',
        type: 'system',
        priority: 'high',
        status: 'unread',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        alertType: 'maintenance',
        severity: 'medium',
        affectedUsers: 1500
      },
      {
        id: 'alert-2',
        title: 'High CPU Usage Detected',
        message: 'Server CPU usage has exceeded 85% for the last 30 minutes. Performance may be impacted.',
        type: 'system',
        priority: 'high',
        status: 'read',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        alertType: 'performance',
        severity: 'high',
        affectedUsers: 800,
        resolutionTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        resolvedBy: 'System Admin'
      },
      {
        id: 'alert-3',
        title: 'Security Alert: Failed Login Attempts',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100. Account has been temporarily locked.',
        type: 'system',
        priority: 'high',
        status: 'read',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        alertType: 'security',
        severity: 'critical',
        affectedUsers: 1,
        resolutionTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        resolvedBy: 'Security Team'
      },
      {
        id: 'alert-4',
        title: 'Billing System Update',
        message: 'Monthly billing cycle completed successfully. All subscriptions have been renewed.',
        type: 'system',
        priority: 'medium',
        status: 'read',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        alertType: 'billing',
        severity: 'low',
        affectedUsers: 1200
      }
    ];

    // Initialize system settings
    const systemSettings: SystemSettings = {
      id : 1, 
      updatedBy : 0, 
      updatedAt : new Date(),
      createdAt : new Date(),
      platform_name: 'CafeX POS',
      platform_url: 'https://cafex.com',
      platform_logo: '',
      default_language: 'en-IN',
      maintenance_mode: false,
      maintenance_message: 'The system is currently under maintenance. Please try again later.',
      file_upload_max_size: 10,
      backup_enabled: true,
      backup_frequency: 'daily',
      support_email: 'support@cafex.com',
      support_phone: '+91 98765 43210',
      terms_url: 'https://cafex.com/terms',
      privacy_url: 'https://cafex.com/privacy',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      max_concurrent_users: 1000,
      cache_enabled: true,
      cache_ttl: 3600,
      session_timeout: 30,
      password_min_length: 8,
      two_factor_required: false,
      email_notifications: true,
      sms_notifications: false,
      notification_batch_size: 100,
      api_rate_limit: 1000,
      webhook_retries: 3
    };

    // Initialize user notifications
    const userNotifications: UserNotification[] = [
      {
        id: 'notif-1',
        title: 'New Menu Item Available',
        message: 'Butter Chicken has been added to the menu. Check it out in your restaurant dashboard.',
        type: 'staff',
        priority: 'medium',
        status: 'unread',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        targetUsers: [],
        targetRoles: ['restaurant_owner', 'restaurant_manager'],
        sentBy: 'Platform Admin',
        deliveryStatus: 'delivered',
        readCount: 3,
        totalRecipients: 5
      },
      {
        id: 'notif-2',
        title: 'Payment Processing Update',
        message: 'Your payment gateway has been updated. Please verify your integration settings.',
        type: 'staff',
        priority: 'high',
        status: 'read',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        targetUsers: ['1'], // Specific user ID
        targetRoles: [],
        sentBy: 'System Admin',
        deliveryStatus: 'delivered',
        readCount: 1,
        totalRecipients: 1
      },
      {
        id: 'notif-3',
        title: 'Training Session Reminder',
        message: 'Staff training session scheduled for tomorrow at 10 AM. All restaurant managers must attend.',
        type: 'staff',
        priority: 'high',
        status: 'unread',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        targetUsers: [],
        targetRoles: ['restaurant_manager'],
        sentBy: 'HR Department',
        deliveryStatus: 'sent',
        readCount: 2,
        totalRecipients: 4,
        scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000)
      }
    ];

    // Initialize analytics data
    const customerSegments: CustomerSegment[] = [
      { name: 'New Customers', percentage: 35 },
      { name: 'Regular Customers', percentage: 45 },
      { name: 'VIP Customers', percentage: 20 }
    ];

    const loyaltyStats: LoyaltyStats = {
      activeMembers: 1250,
      avgPoints: 450,
      redemptionRate: 68
    };

    const satisfactionScores: SatisfactionScores = {
      food: 4.2,
      service: 4.5,
      overall: 4.3
    };

    const revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [82000, 95000, 91000, 110000, 124000, 132000]
    };

    const ordersChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [540, 610, 590, 700, 760, 780]
    };

    const paymentChartData = [48, 32, 15, 5];

    const itemsChartData = {
      labels: ['Biryani', 'Pizza', 'Butter Chicken', 'Pasta', 'Burger', 'Salad'],
      data: [1240, 1050, 980, 850, 720, 650]
    };

    const customerSatisfaction = 94;
    const satisfactionGrowth = 5;

    // Initialize order processing configurations
    const orderStatusConfigs: OrderStatusConfig[] = [
      {
        status: 'pending',
        label: 'Pending',
        icon: 'fas fa-clock',
        borderClass: 'border-yellow-500',
        badgeClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
        text: 'Pending'
      },
      {
        status: 'confirmed',
        label: 'Confirmed',
        icon: 'fas fa-check-circle',
        borderClass: 'border-blue-500',
        badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
        text: 'Confirmed'
      },
      {
        status: 'preparing',
        label: 'Preparing',
        icon: 'fas fa-fire',
        borderClass: 'border-orange-500',
        badgeClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
        text: 'Preparing'
      },
      {
        status: 'ready',
        label: 'Ready',
        icon: 'fas fa-utensils',
        borderClass: 'border-green-500',
        badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-600',
        text: 'Ready'
      },
      {
        status: 'on_the_way',
        label: 'On the Way',
        icon: 'fas fa-truck',
        borderClass: 'border-purple-500',
        badgeClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
        text: 'On the Way'
      },
      {
        status: 'served',
        label: 'Served',
        icon: 'fas fa-check-double',
        borderClass: 'border-indigo-500',
        badgeClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
        text: 'Served'
      },
      {
        status: 'completed',
        label: 'Completed',
        icon: 'fas fa-check-circle',
        borderClass: 'border-gray-500',
        badgeClass: 'bg-gray-100 dark:bg-gray-700 text-gray-600',
        text: 'Completed'
      },
      {
        status: 'cancelled',
        label: 'Cancelled',
        icon: 'fas fa-times-circle',
        borderClass: 'border-red-500',
        badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-600',
        text: 'Cancelled'
      }
    ];

    const orderFilterOptions: OrderFilterOption[] = [
      { value: 'all', label: 'All Orders', active: true },
      { value: 'pending', label: 'Pending', active: false },
      { value: 'confirmed', label: 'Confirmed', active: false },
      { value: 'preparing', label: 'Preparing', active: false },
      { value: 'ready', label: 'Ready', active: false },
      { value: 'served', label: 'Served', active: false },
      { value: 'completed', label: 'Completed', active: false },
      { value: 'cancelled', label: 'Cancelled', active: false }
    ];

    const orderSortOptions: OrderSortOption[] = [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'amount-high', label: 'Highest Amount' },
      { value: 'amount-low', label: 'Lowest Amount' }
    ];

    // Emit initial data
    this.usersSubject.next(users);
    this.rolesSubject.next(roles);
    this.menuItemsSubject.next(menuItems);
    this.ordersSubject.next(orders);
    this.notificationsSubject.next(notifications);
    this.inventorySubject.next(inventory);
    this.recipesSubject.next(recipes);
    this.offersSubject.next(offers);
    this.customersSubject.next(customers);
    this.navigationMenusSubject.next(navigationMenus);
    this.staffSubject.next(staffMembers);
    this.shiftSchedulesSubject.next(shiftSchedules);
    this.shiftReportsSubject.next(shiftReports);
    this.restaurantSettingsSubject.next(restaurantSettings);
    this.cashDrawersSubject.next(cashDrawers);
    this.cashTransactionsSubject.next(cashTransactions);
    this.shiftReconciliationsSubject.next(shiftReconciliations);
    this.quickActionsSubject.next(quickActions);
    this.recentTransactionsSubject.next(recentTransactions);
    this.cashierStatsSubject.next(cashierStats);
    this.orderTypeTabsSubject.next(orderTypeTabs);
    this.dineInSubTabsSubject.next(dineInSubTabs);
    this.menuCategoriesSubject.next(menuCategories);
    this.foodMenuCategoriesSubject.next(foodMenuCategories);
    this.alertRulesSubject.next(alertRules);
    this.restaurantNotificationsSubject.next(restaurantNotifications);
    this.loyaltyProgramSubject.next(loyaltyProgram);
    this.loyaltyCustomersSubject.next(loyaltyCustomers);
    this.loyaltyStatsManageSubject.next(loyaltyStatsManage);
    this.recentActivitiesSubject.next(recentActivities);
    this.paymentMethodsSubject.next(paymentMethods);
    this.quickAmountsSubject.next(quickAmounts);
    this.sampleMenuItemsSubject.next(sampleMenuItems);
    this.sampleOrdersSubject.next(sampleOrders);

    // Emit payment processing configurations
    this.paymentGatewaysSubject.next(paymentGateways);
    this.paymentMethodSettingsSubject.next(paymentMethodSettings);
    this.recentCustomerTransactionsSubject.next(recentCustomerTransactions);
    this.paymentStatsDataSubject.next(paymentStatsData);
    this.paymentStatusConfigsSubject.next(paymentStatusConfigs);

    // Emit settings configuration data
    this.settingsFilterCategoriesSubject.next(settingsFilterCategories);
    this.settingsFilterStatusesSubject.next(settingsFilterStatuses);
    this.paymentMethodDescriptionsSubject.next(paymentMethodDescriptions);
    this.notificationConfigsSubject.next(notificationConfigs);
    this.businessDaysSubject.next(businessDays);
    this.tipOptionsSubject.next(tipOptions);

    // Emit staff configuration data
    this.staffFormDefaultsSubject.next(staffFormDefaults);
    this.scheduleFormDefaultsSubject.next(scheduleFormDefaults);
    this.shiftTimeConfigsSubject.next(shiftTimeConfigs);
    this.statusBadgeClassesSubject.next(statusBadgeClasses);
    this.roleBadgeClassesSubject.next(roleBadgeClasses);
    this.statusDisplayTextsSubject.next(statusDisplayTexts);
    this.roleOptionsSubject.next(roleOptions);
    this.statusOptionsSubject.next(statusOptions);
    this.shiftOptionsSubject.next(shiftOptions);
    this.scheduleStatusOptionsSubject.next(scheduleStatusOptions);
    this.defaultAvatarUrlSubject.next(defaultAvatarUrl);

    // Emit shift reports configuration data
    this.shiftReportsConfigSubject.next(shiftReportsConfig);

    // Emit owner dashboard configuration data
    this.ownerDashboardConfigSubject.next(ownerDashboardConfig);
    this.ownerDashboardDataSubject.next(ownerDashboardData);
    this.availablePrintersSubject.next(availablePrinters);
    this.availableLanguagesSubject.next(availableLanguages);
    this.availableCurrenciesSubject.next(availableCurrencies);
    this.defaultCashierSettingsSubject.next(defaultCashierSettings);
    this.currentShiftReportSubject.next(currentShiftReport);
    this.previousShiftReportsSubject.next(previousShiftReports);
    this.paymentMethodSummarySubject.next(paymentMethodSummary);
    this.hourlySalesDataSubject.next(hourlySalesData);
    this.transactionSearchResultsSubject.next(transactionSearchResults);
    this.availablePaymentMethodsSubject.next(availablePaymentMethods);
    this.availableStatusesSubject.next(availableStatuses);
    this.availableCashiersSubject.next(availableCashiers);
    this.apiKeysSubject.next(apiKeys);
    this.apiEndpointsSubject.next(apiEndpoints);
    this.apiMetricsSubject.next(apiMetrics);
    this.integrationsSubject.next(integrations);
    this.integrationMetricsSubject.next(integrationMetrics);
    this.navigationRolesSubject.next(navigationRoles);
    this.navigationStatusesSubject.next(navigationStatuses);
    this.subscriptionPlansSubject.next(subscriptionPlans);
    this.planFeaturesSubject.next(planFeatures);
    this.platformDashboardDataSubject.next(platformDashboardData);
    this.restaurantsSubject.next(restaurants);
    this.securityPoliciesSubject.next(securityPolicies);
    this.securityLogsSubject.next(securityLogs);
    this.securityMetricsSubject.next(securityMetrics);
    this.subscriptionMetricsSubject.next(subscriptionMetrics);
    this.planAnalyticsSubject.next(planAnalytics);
    this.revenueDataSubject.next(revenueData);
    this.broadcastMessagesSubject.next(broadcastMessages);
    this.featuresSubject.next(features);
    this.planFeatureAccessSubject.next(planFeatureAccess);
    this.roleFeatureAccessSubject.next(roleFeatureAccess);
    this.systemAlertsSubject.next(systemAlerts);
    this.systemSettingsSubject.next(systemSettings);
    this.userNotificationsSubject.next(userNotifications);
    this.customerSegmentsSubject.next(customerSegments);
    this.loyaltyStatsSubject.next(loyaltyStats);
    this.satisfactionScoresSubject.next(satisfactionScores);
    this.revenueChartDataSubject.next(revenueChartData);
    this.ordersChartDataSubject.next(ordersChartData);
    this.paymentChartDataSubject.next(paymentChartData);
    this.itemsChartDataSubject.next(itemsChartData);
    this.customerSatisfactionSubject.next(customerSatisfaction);
    this.satisfactionGrowthSubject.next(satisfactionGrowth);

    // Emit order processing configurations
    this.orderStatusConfigsSubject.next(orderStatusConfigs);
    this.orderFilterOptionsSubject.next(orderFilterOptions);
    this.orderSortOptionsSubject.next(orderSortOptions);

  }

  // User methods
  getUsers(): Observable<User[]> {
    return this.users$;
  }

  getUserById(id: string): User | undefined {
    return this.usersSubject.value.find(user => user.id === id);
  }

  getUserByRole(role: User['role']): User | undefined {
    return this.usersSubject.value.find(user => user.role === role);
  }

  // Role methods
  getRoles(): Observable<Role[]> {
    return this.roles$;
  }

  getRoleById(id: number): Role | undefined {
    return this.rolesSubject.value.find(role => role.id === id);
  }

  getRoleByCode(code: string): Role | undefined {
    return this.rolesSubject.value.find(role => role.code === code);
  }

  getRoleByRoleId(roleId: string): Role | undefined {
    return this.rolesSubject.value.find(role => role.role_id === roleId);
  }

  addRole(role: Role): void {
    const roles = [...this.rolesSubject.value];
    roles.push(role);
    this.rolesSubject.next(roles);
  }

  updateRole(role: Role): void {
    const roles = [...this.rolesSubject.value];
    const index = roles.findIndex(r => r.id === role.id);
    if (index !== -1) {
      roles[index] = role;
      this.rolesSubject.next(roles);
    }
  }

  deleteRole(roleId: number): void {
    const roles = [...this.rolesSubject.value];
    const filteredRoles = roles.filter(r => r.id !== roleId);
    this.rolesSubject.next(filteredRoles);
  }

  toggleRoleStatus(roleId: number): void {
    const roles = [...this.rolesSubject.value];
    const role = roles.find(r => r.id === roleId);
    if (role && !role.is_system_role) {
      role.is_active = !role.is_active;
      role.updated_at = new Date();
      this.rolesSubject.next(roles);
    }
  }

  // Menu methods
  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems$;
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return this.menuItemsSubject.value.find(item => item.id === id);
  }

  // Order methods
  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  getOrderById(id: string): Order | undefined {
    return this.ordersSubject.value.find(order => order.id === id);
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = [...this.ordersSubject.value];
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date();
      this.ordersSubject.next(orders);
    }
  }

  // Notification methods
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  markNotificationAsRead(notificationId: string): void {
    const notifications = [...this.notificationsSubject.value];
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      notifications[notificationIndex].status = 'read';
      this.notificationsSubject.next(notifications);
    }
  }

  // Inventory methods
  getInventory(): Observable<InventoryItem[]> {
    return this.inventory$;
  }

  updateInventoryStock(ingredientId: string, quantityUsed: number): void {
    const inventory = [...this.inventorySubject.value];
    const itemIndex = inventory.findIndex(item => item.id === ingredientId);
    if (itemIndex !== -1) {
      inventory[itemIndex].currentStock = Math.max(0, inventory[itemIndex].currentStock - quantityUsed);
      inventory[itemIndex].lastUpdated = new Date();
      this.inventorySubject.next(inventory);
    }
  }

  getItemIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'vegetables': 'fas fa-leaf',
      'meat': 'fas fa-drumstick-bite',
      'grains': 'fas fa-seedling',
      'dairy': 'fas fa-cheese',
      'bakery': 'fas fa-bread-slice',
      'spices': 'fas fa-pepper-hot',
      'beverages': 'fas fa-coffee',
      'fruits': 'fas fa-apple-alt',
      'seafood': 'fas fa-fish',
      'condiments': 'fas fa-utensils'
    };
    return iconMap[category] || 'fas fa-circle';
  }

  // Recipe methods
  getRecipes(): Observable<Recipe[]> {
    return this.recipes$;
  }

  getRecipeById(id: string): Recipe | undefined {
    return this.recipesSubject.value.find(recipe => recipe.id === id);
  }

  getRecipeByMenuItemId(menuItemId: string): Recipe | undefined {
    return this.recipesSubject.value.find(recipe => recipe.menuItemId === menuItemId);
  }

  // Offer methods
  getOffers(): Observable<Offer[]> {
    return this.offers$;
  }

  // Customer methods
  getCustomers(): Observable<Customer[]> {
    return this.customers$;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customersSubject.value.find(customer => customer.id === id);
  }

  // Analytics data methods
  getCustomerSegments(): Observable<CustomerSegment[]> {
    return this.customerSegments$;
  }

  getLoyaltyStats(): Observable<LoyaltyStats | null> {
    return this.loyaltyStats$;
  }

  getSatisfactionScores(): Observable<SatisfactionScores | null> {
    return this.satisfactionScores$;
  }

  getRevenueChartData(): Observable<{ labels: string[]; data: number[] }> {
    return this.revenueChartData$;
  }

  getOrdersChartData(): Observable<{ labels: string[]; data: number[] }> {
    return this.ordersChartData$;
  }

  getPaymentChartData(): Observable<number[]> {
    return this.paymentChartData$;
  }

  getItemsChartData(): Observable<{ labels: string[]; data: number[] }> {
    return this.itemsChartData$;
  }

  getCustomerSatisfaction(): Observable<number> {
    return this.customerSatisfaction$;
  }

  getSatisfactionGrowth(): Observable<number> {
    return this.satisfactionGrowth$;
  }

  // Order processing configuration getters
  getOrderStatusConfigs(): Observable<OrderStatusConfig[]> {
    return this.orderStatusConfigs$;
  }

  getOrderFilterOptions(): Observable<OrderFilterOption[]> {
    return this.orderFilterOptions$;
  }

  getOrderSortOptions(): Observable<OrderSortOption[]> {
    return this.orderSortOptions$;
  }

  getOrderStatusConfig(status: string): OrderStatusConfig | undefined {
    return this.orderStatusConfigsSubject.value.find(config => config.status === status);
  }
  // Staff methods
  getStaff(): Observable<StaffMember[]> {
    return this.staff$;
  }

  getStaffById(id: string): StaffMember | undefined {
    return this.staffSubject.value.find(staff => staff.id === id);
  }

  getStaffByRole(role: StaffMember['role']): StaffMember[] {
    return this.staffSubject.value.filter(staff => staff.role === role);
  }

  // Shift schedule methods
  getShiftSchedules(): Observable<ShiftSchedule[]> {
    return this.shiftSchedules$;
  }

  getShiftSchedulesByDate(date: Date): ShiftSchedule[] {
    return this.shiftSchedulesSubject.value.filter(schedule =>
      schedule.date.toDateString() === date.toDateString()
    );
  }

  // Shift reports methods
  getShiftReports(): Observable<ShiftReport[]> {
    return this.shiftReports$;
  }

  getShiftReportsByDateRange(startDate: Date, endDate: Date): ShiftReport[] {
    return this.shiftReportsSubject.value.filter(report =>
      report.date >= startDate && report.date <= endDate
    );
  }

  // Restaurant settings methods
  getRestaurantSettings(): Observable<RestaurantSettings[]> {
    return this.restaurantSettings$;
  }

  getRestaurantSettingsById(id: string): RestaurantSettings | undefined {
    return this.restaurantSettingsSubject.value.find(settings => settings.id === id);
  }

  // Cash management methods
  getCashDrawers(): Observable<CashDrawer[]> {
    return this.cashDrawers$;
  }

  getCashDrawerById(id: string): CashDrawer | undefined {
    return this.cashDrawersSubject.value.find(drawer => drawer.id === id);
  }

  getCashTransactions(): Observable<CashTransaction[]> {
    return this.cashTransactions$;
  }

  getCashTransactionsByCashier(cashierId: string): CashTransaction[] {
    return this.cashTransactionsSubject.value.filter(txn => txn.cashierId === cashierId);
  }

  getShiftReconciliations(): Observable<ShiftReconciliation[]> {
    return this.shiftReconciliations$;
  }

  getShiftReconciliationById(id: string): ShiftReconciliation | undefined {
    return this.shiftReconciliationsSubject.value.find(recon => recon.id === id);
  }

  addCashTransaction(transaction: CashTransaction): void {
    const transactions = [...this.cashTransactionsSubject.value];
    transactions.unshift(transaction);
    this.cashTransactionsSubject.next(transactions);
  }

  updateCashDrawer(drawerId: string, updates: Partial<CashDrawer>): void {
    const drawers = [...this.cashDrawersSubject.value];
    const drawerIndex = drawers.findIndex(drawer => drawer.id === drawerId);
    if (drawerIndex !== -1) {
      drawers[drawerIndex] = { ...drawers[drawerIndex], ...updates };
      this.cashDrawersSubject.next(drawers);
    }
  }

  updateShiftReconciliation(reconId: string, updates: Partial<ShiftReconciliation>): void {
    const reconciliations = [...this.shiftReconciliationsSubject.value];
    const reconIndex = reconciliations.findIndex(recon => recon.id === reconId);
    if (reconIndex !== -1) {
      reconciliations[reconIndex] = { ...reconciliations[reconIndex], ...updates };
      this.shiftReconciliationsSubject.next(reconciliations);
    }
  }

  // Cashier dashboard methods
  getQuickActions(): Observable<QuickAction[]> {
    return this.quickActions$;
  }

  getRecentTransactions(): Observable<RecentTransaction[]> {
    return this.recentTransactions$;
  }

  getCashierStats(): Observable<CashierStats[]> {
    return this.cashierStats$;
  }

  addRecentTransaction(transaction: RecentTransaction): void {
    const transactions = [...this.recentTransactionsSubject.value];
    transactions.unshift(transaction);
    // Keep only last 10 transactions
    if (transactions.length > 10) {
      transactions.splice(10);
    }
    this.recentTransactionsSubject.next(transactions);
  }

  updateCashierStats(stats: CashierStats): void {
    this.cashierStatsSubject.next([stats]);
  }

  // Cashier interface methods
  getOrderTypeTabs(): Observable<OrderTypeTab[]> {
    return this.orderTypeTabs$;
  }

  getDineInSubTabs(): Observable<DineInSubTab[]> {
    return this.dineInSubTabs$;
  }

  getMenuCategories(): Observable<MenuCategory[]> {
    return this.menuCategories$;
  }

  getFoodMenuCategories(): Observable<FoodMenuCategory[]> {
    return this.foodMenuCategories$;
  }

  getAlertRules(): Observable<AlertRule[]> {
    return this.alertRules$;
  }

  getRestaurantNotifications(): Observable<RestaurantNotification[]> {
    return this.restaurantNotifications$;
  }

  getLoyaltyProgram(): Observable<LoyaltyProgram | null> {
    return this.loyaltyProgram$;
  }

  getLoyaltyCustomers(): Observable<LoyaltyCustomer[]> {
    return this.loyaltyCustomers$;
  }

  getLoyaltyStatsManage(): Observable<LoyaltyStatsManage | null> {
    return this.loyaltyStatsManage$;
  }

  getRecentActivities(): Observable<any[]> {
    return this.recentActivities$;
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.paymentMethods$;
  }

  // Payment processing configuration getters
  getPaymentGateways(): Observable<PaymentGatewayConfig[]> {
    return this.paymentGateways$;
  }

  getPaymentMethodSettings(): Observable<PaymentMethods> {
    return this.paymentMethodSettings$;
  }

  getRecentCustomerTransactions(): Observable<RecentCustomerTransaction[]> {
    return this.recentCustomerTransactions$;
  }

  getPaymentStatsData(): Observable<PaymentStatsData | null> {
    return this.paymentStatsData$;
  }

  getPaymentStatusConfigs(): Observable<PaymentStatusConfig[]> {
    return this.paymentStatusConfigs$;
  }

  getPaymentStatusConfig(status: string): PaymentStatusConfig | undefined {
    return this.paymentStatusConfigsSubject.value.find(config => config.status === status);
  }

  // Settings configuration getters
  getSettingsFilterCategories(): Observable<SettingsFilterOption[]> {
    return this.settingsFilterCategories$;
  }

  getSettingsFilterStatuses(): Observable<SettingsFilterOption[]> {
    return this.settingsFilterStatuses$;
  }

  getPaymentMethodDescriptions(): Observable<PaymentMethodDescription[]> {
    return this.paymentMethodDescriptions$;
  }

  getNotificationConfigs(): Observable<NotificationConfig[]> {
    return this.notificationConfigs$;
  }

  getBusinessDays(): Observable<string[]> {
    return this.businessDays$;
  }

  getTipOptions(): Observable<number[]> {
    return this.tipOptions$;
  }

  // Staff configuration getters
  getStaffFormDefaults(): Observable<StaffFormDefaults | null> {
    return this.staffFormDefaults$;
  }

  getScheduleFormDefaults(): Observable<ScheduleFormDefaults | null> {
    return this.scheduleFormDefaults$;
  }

  getShiftTimeConfigs(): Observable<ShiftTimeConfig[]> {
    return this.shiftTimeConfigs$;
  }

  getStatusBadgeClasses(): Observable<BadgeClassConfig[]> {
    return this.statusBadgeClasses$;
  }

  getRoleBadgeClasses(): Observable<BadgeClassConfig[]> {
    return this.roleBadgeClasses$;
  }

  getStatusDisplayTexts(): Observable<DisplayTextConfig[]> {
    return this.statusDisplayTexts$;
  }

  getRoleOptions(): Observable<SelectOption[]> {
    return this.roleOptions$;
  }

  getStatusOptions(): Observable<SelectOption[]> {
    return this.statusOptions$;
  }

  getShiftOptions(): Observable<SelectOption[]> {
    return this.shiftOptions$;
  }

  getScheduleStatusOptions(): Observable<SelectOption[]> {
    return this.scheduleStatusOptions$;
  }

  getDefaultAvatarUrl(): Observable<string> {
    return this.defaultAvatarUrl$;
  }

  // Helper methods for staff configuration
  getShiftTimeConfig(shift: StaffMember['shift']): ShiftTimeConfig | undefined {
    return this.shiftTimeConfigsSubject.value.find(config => config.shift === shift);
  }

  getStatusBadgeClass(status: StaffMember['status']): string {
    const config = this.statusBadgeClassesSubject.value.find(config => config.value === status);
    return config ? config.className : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getRoleBadgeClass(role: StaffMember['role']): string {
    const config = this.roleBadgeClassesSubject.value.find(config => config.value === role);
    return config ? config.className : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getStatusDisplayText(status: StaffMember['status']): string {
    const config = this.statusDisplayTextsSubject.value.find(config => config.value === status);
    return config ? config.displayText : status;
  }

  getShiftStartTime(shift: StaffMember['shift']): string {
    const config = this.getShiftTimeConfig(shift);
    return config ? config.startTime : '09:00';
  }

  getShiftEndTime(shift: StaffMember['shift']): string {
    const config = this.getShiftTimeConfig(shift);
    return config ? config.endTime : '17:00';
  }

  // Shift reports configuration getters
  getShiftReportsConfig(): Observable<ShiftReportsConfig | null> {
    return this.shiftReportsConfig$;
  }

  // Helper methods for shift reports configuration
  getDateRangePeriodConfig(period: string): DateRangePeriod | undefined {
    const config = this.shiftReportsConfigSubject.value;
    return config?.dateRangePeriods.find(p => p.key === period);
  }

  getShiftBadgeClass(shift: string): string {
    const config = this.shiftReportsConfigSubject.value;
    const badgeConfig = config?.shiftBadgeClasses.find(c => c.value === shift);
    return badgeConfig ? badgeConfig.className : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getApprovalBadgeClass(approved: boolean): string {
    const config = this.shiftReportsConfigSubject.value;
    const value = approved ? 'approved' : 'pending';
    const badgeConfig = config?.approvalBadgeClasses.find(c => c.value === value);
    return badgeConfig ? badgeConfig.className : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getPerformanceScoreParams(): PerformanceScoreParams | null {
    return this.shiftReportsConfigSubject.value?.performanceScoreParams || null;
  }

  getRevenueGrowthParams(): RevenueGrowthParams | null {
    return this.shiftReportsConfigSubject.value?.revenueGrowthParams || null;
  }

  getShiftTypes(): string[] {
    return this.shiftReportsConfigSubject.value?.shiftTypes || [];
  }

  getPeriodFilterOptions(): SelectOption[] {
    return this.shiftReportsConfigSubject.value?.periodFilterOptions || [];
  }

  getShiftFilterOptions(): SelectOption[] {
    return this.shiftReportsConfigSubject.value?.shiftFilterOptions || [];
  }

  getDefaultHoursPerShift(): number {
    return this.shiftReportsConfigSubject.value?.defaultHoursPerShift || 24;
  }

  // Utility methods for shift reports
  calculatePerformanceScore(revenue: number, ordersProcessed: number, customerComplaints: number): number {
    const params = this.getPerformanceScoreParams();
    if (!params) return 0;

    const baseScore = (revenue / params.revenueWeight) + (ordersProcessed * params.ordersWeight);
    const penalty = customerComplaints * params.complaintsPenalty;
    return Math.max(0, Math.min(params.maxScore, Math.round(baseScore - penalty)));
  }

  calculateRevenueGrowth(): number {
    const params = this.getRevenueGrowthParams();
    if (!params) return 0;

    // Generate random growth between min and max (in real app, this would be calculated from actual data)
    return Math.floor(Math.random() * (params.maxGrowth - params.minGrowth + 1)) + params.minGrowth;
  }

  getDateRangeForPeriod(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    const periodConfig = this.getDateRangePeriodConfig(period);
    if (periodConfig) {
      switch (periodConfig.key) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate.setDate(endDate.getDate() - periodConfig.days);
          break;
      }
    }

    return { startDate, endDate };
  }

  // Owner dashboard configuration getters
  getOwnerDashboardConfig(): Observable<OwnerDashboardConfig | null> {
    return this.ownerDashboardConfig$;
  }

  getOwnerDashboardData(): Observable<ResOwnerDashboardData | null> {
    return this.ownerDashboardData$;
  }

  // Helper methods for owner dashboard configuration
  getBadgeClass(type: string, value: string | number): string {
    const config = this.ownerDashboardConfigSubject.value;
    if (!config?.badgeClasses[type]) return 'bg-gray-100 dark:bg-gray-700 text-gray-600';

    const badgeConfig = config.badgeClasses[type].find(c => c.value === value.toString());
    return badgeConfig ? badgeConfig.className : 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getTrendIconClass(trend: string): string {
    const config = this.ownerDashboardConfigSubject.value;
    const trendConfig = config?.trendIcons.find(t => t.trend === trend);
    return trendConfig ? trendConfig.iconClass : 'fas fa-minus text-gray-500';
  }

  getNavigationRoute(key: string): string {
    const config = this.ownerDashboardConfigSubject.value;
    const routeConfig = config?.navigationRoutes.find(r => r.key === key);
    return routeConfig ? routeConfig.route : '';
  }

  getOwnerDashboardPeriodFilterOptions(): SelectOption[] {
    return this.ownerDashboardConfigSubject.value?.periodFilterOptions || [];
  }

  getPaymentMethodDescription(method: string): string {
    const desc = this.paymentMethodDescriptionsSubject.value.find(d => d.method === method);
    return desc ? desc.description : 'Payment method';
  }

  getQuickAmounts(): Observable<number[]> {
    return this.quickAmounts$;
  }

  getSampleMenuItems(): Observable<MenuItem[]> {
    return this.sampleMenuItems$;
  }

  getSampleOrders(): Observable<Order[]> {
    return this.sampleOrders$;
  }

  // Cashier settings methods
  getAvailablePrinters(): Observable<Printer[]> {
    return this.availablePrinters$;
  }

  getAvailableLanguages(): Observable<any[]> {
    return this.availableLanguages$;
  }

  getAvailableCurrencies(): Observable<any[]> {
    return this.availableCurrencies$;
  }

  getDefaultCashierSettings(): Observable<CashierSettings[]> {
    return this.defaultCashierSettings$;
  }

  // Cashier shift reports methods
  getCurrentShiftReport(): Observable<CashierShiftReport | null> {
    return this.currentShiftReport$;
  }

  getPreviousShiftReports(): Observable<CashierShiftReport[]> {
    return this.previousShiftReports$;
  }

  getPaymentMethodSummary(): Observable<PaymentMethodSummary[]> {
    return this.paymentMethodSummary$;
  }

  getHourlySalesData(): Observable<HourlySalesData[]> {
    return this.hourlySalesData$;
  }

  updateCurrentShiftReport(report: CashierShiftReport): void {
    this.currentShiftReportSubject.next(report);
  }

  addPreviousShiftReport(report: CashierShiftReport): void {
    const reports = [...this.previousShiftReportsSubject.value];
    reports.unshift(report);
    this.previousShiftReportsSubject.next(reports);
  }

  // Transaction search methods
  getTransactionSearchResults(): Observable<TransactionSearchResult[]> {
    return this.transactionSearchResults$;
  }

  getAvailablePaymentMethods(): Observable<string[]> {
    return this.availablePaymentMethods$;
  }

  getAvailableStatuses(): Observable<string[]> {
    return this.availableStatuses$;
  }

  getAvailableCashiers(): Observable<string[]> {
    return this.availableCashiers$;
  }

  updateTransactionStatus(orderId: string, status: TransactionSearchResult['status']): void {
    const transactions = [...this.transactionSearchResultsSubject.value];
    const transactionIndex = transactions.findIndex(t => t.orderId === orderId);
    if (transactionIndex !== -1) {
      transactions[transactionIndex].status = status;
      this.transactionSearchResultsSubject.next(transactions);
    }
  }

  addTransactionModification(orderId: string, modification: any): void {
    const transactions = [...this.transactionSearchResultsSubject.value];
    const transactionIndex = transactions.findIndex(t => t.orderId === orderId);
    if (transactionIndex !== -1) {
      if (!transactions[transactionIndex].modifications) {
        transactions[transactionIndex].modifications = [];
      }
      transactions[transactionIndex].modifications!.push(modification);
      this.transactionSearchResultsSubject.next(transactions);
    }
  }

  updateOrderTypeTab(tabId: string, active: boolean): void {
    const tabs = [...this.orderTypeTabsSubject.value];
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
      tabs.forEach(tab => tab.active = false); // Deactivate all
      tabs[tabIndex].active = active;
      this.orderTypeTabsSubject.next(tabs);
    }
  }

  updateDineInSubTab(subTabId: string, active: boolean): void {
    const subTabs = [...this.dineInSubTabsSubject.value];
    const subTabIndex = subTabs.findIndex(subTab => subTab.id === subTabId);
    if (subTabIndex !== -1) {
      subTabs.forEach(subTab => subTab.active = false); // Deactivate all
      subTabs[subTabIndex].active = active;
      this.dineInSubTabsSubject.next(subTabs);
    }
  }

  // API Management methods
  getAPIKeys(): Observable<APIKey[]> {
    return this.apiKeys$;
  }

  getAPIEndpoints(): Observable<APIEndpoint[]> {
    return this.apiEndpoints$;
  }

  getAPIMetrics(): Observable<APIMetrics | null> {
    return this.apiMetrics$;
  }

  updateAPIKeyStatus(keyId: string, status: APIKey['status']): void {
    const keys = [...this.apiKeysSubject.value];
    const keyIndex = keys.findIndex(key => key.id === keyId);
    if (keyIndex !== -1) {
      keys[keyIndex].status = status;
      this.apiKeysSubject.next(keys);
    }
  }

  updateAPIEndpointStatus(endpointId: string, status: APIEndpoint['status']): void {
    const endpoints = [...this.apiEndpointsSubject.value];
    const endpointIndex = endpoints.findIndex(endpoint => endpoint.id === endpointId);
    if (endpointIndex !== -1) {
      endpoints[endpointIndex].status = status;
      this.apiEndpointsSubject.next(endpoints);
    }
  }

  // Integrations methods
  getIntegrations(): Observable<Integration[]> {
    return this.integrations$;
  }

  getIntegrationMetrics(): Observable<IntegrationMetrics | null> {
    return this.integrationMetrics$;
  }

  updateIntegrationStatus(integrationId: string, status: Integration['status']): void {
    const integrations = [...this.integrationsSubject.value];
    const integrationIndex = integrations.findIndex(integration => integration.id === integrationId);
    if (integrationIndex !== -1) {
      integrations[integrationIndex].status = status;
      this.integrationsSubject.next(integrations);
    }
  }

  updateIntegrationSyncStatus(integrationId: string, syncStatus: Integration['syncStatus']): void {
    const integrations = [...this.integrationsSubject.value];
    const integrationIndex = integrations.findIndex(integration => integration.id === integrationId);
    if (integrationIndex !== -1) {
      integrations[integrationIndex].syncStatus = syncStatus;
      integrations[integrationIndex].lastSync = new Date();
      this.integrationsSubject.next(integrations);
    }
  }

  getIntegrationsByCategory(category: string): Integration[] {
    return this.integrationsSubject.value.filter(integration => integration.category === category);
  }

  // Navigation management methods
  getNavigationRoles(): Observable<string[]> {
    return this.navigationRoles$;
  }

  getNavigationStatuses(): Observable<string[]> {
    return this.navigationStatuses$;
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'platform_owner': 'Platform Owner',
      'restaurant_owner': 'Restaurant Owner',
      'restaurant_manager': 'Restaurant Manager',
      'cashier': 'Cashier',
      'kitchen_manager': 'Kitchen Manager',
      'waiter': 'Waiter',
      'customer': 'Customer',
      'all': 'All Roles'
    };
    return roleNames[role] || role;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'platform_owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'restaurant_owner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'restaurant_manager': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cashier': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'kitchen_manager': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'waiter': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'customer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getRolePermissions(role: string): string {
    const permissions: { [key: string]: string } = {
      'platform_owner': 'full platform administration',
      'restaurant_owner': 'restaurant management and analytics',
      'restaurant_manager': 'staff supervision and operations',
      'cashier': 'order processing and payments',
      'kitchen_manager': 'menu management and kitchen operations',
      'waiter': 'table service and customer interaction',
      'customer': 'ordering and account management'
    };
    return permissions[role] || 'basic user access';
  }

  // Plan management methods
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.subscriptionPlans$;
  }

  getPlanFeatures(): Observable<PlanFeature[]> {
    return this.planFeatures$;
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.subscriptionPlansSubject.value.find(plan => plan.id === planId);
  }

  getFeatureById(featureId: string): PlanFeature | undefined {
    return this.planFeaturesSubject.value.find(feature => feature.id === featureId);
  }

  getFeaturesByCategory(category: string): PlanFeature[] {
    return this.planFeaturesSubject.value.filter(feature => feature.category === category);
  }

  // Platform dashboard methods
  getPlatformDashboardData(): Observable<any> {
    return this.platformDashboardData$;
  }

  // Restaurant management methods
  getRestaurants(): Observable<Restaurant[]> {
    return this.restaurants$;
  }

  getRestaurantById(id: number): Restaurant | undefined {
    return this.restaurantsSubject.value.find(restaurant => restaurant.id === id);
  }

  // Security settings methods
  getSecurityPolicies(): Observable<SecurityPolicy[]> {
    return this.securityPolicies$;
  }

  getSecurityLogs(): Observable<SecurityLog[]> {
    return this.securityLogs$;
  }

  getSecurityMetrics(): Observable<SecurityMetrics | null> {
    return this.securityMetrics$;
  }

  // Subscription analytics methods
  getSubscriptionMetrics(): Observable<SubscriptionMetrics | null> {
    return this.subscriptionMetrics$;
  }

  getPlanAnalytics(): Observable<PlanAnalytics[]> {
    return this.planAnalytics$;
  }

  getRevenueData(): Observable<RevenueData[]> {
    return this.revenueData$;
  }

  // Broadcast Messages methods
  getBroadcastMessages(): Observable<BroadcastMessage[]> {
    return this.broadcastMessages$;
  }

  updateBroadcastMessageStatus(messageId: string, status: BroadcastMessage['status']): void {
    const messages = [...this.broadcastMessagesSubject.value];
    const messageIndex = messages.findIndex(message => message.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].status = status;
      this.broadcastMessagesSubject.next(messages);
    }
  }

  updateBroadcastMessageDeliveryStatus(messageId: string, deliveryStatus: BroadcastMessage['deliveryStatus']): void {
    const messages = [...this.broadcastMessagesSubject.value];
    const messageIndex = messages.findIndex(message => message.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].deliveryStatus = deliveryStatus;
      this.broadcastMessagesSubject.next(messages);
    }
  }

  addBroadcastMessage(message: BroadcastMessage): void {
    const messages = [...this.broadcastMessagesSubject.value];
    messages.unshift(message);
    this.broadcastMessagesSubject.next(messages);
  }

  // Feature Access Control methods
  getFeatures(): Observable<Feature[]> {
    return this.features$;
  }

  getPlanFeatureAccess(): Observable<PlanFeatureAccess[]> {
    return this.planFeatureAccess$;
  }

  getRoleFeatureAccess(): Observable<RoleFeatureAccess[]> {
    return this.roleFeatureAccess$;
  }

  updatePlanFeatureAccess(planId: string, featureId: string, enabled: boolean): void {
    const plans = [...this.planFeatureAccessSubject.value];
    const plan = plans.find(p => p.planId === planId);
    if (plan) {
      plan.features[featureId] = enabled;
      this.planFeatureAccessSubject.next(plans);
    }
  }

  updateRoleFeatureAccess(roleId: string, featureId: string, enabled: boolean): void {
    const roles = [...this.roleFeatureAccessSubject.value];
    const role = roles.find(r => r.roleId === roleId);
    if (role) {
      role.features[featureId] = enabled;
      this.roleFeatureAccessSubject.next(roles);
    }
  }

  // System alerts methods
  getSystemAlerts(): Observable<SystemAlert[]> {
    return this.systemAlerts$;
  }

  updateSystemAlertStatus(alertId: string, status: SystemAlert['status']): void {
    const alerts = [...this.systemAlertsSubject.value];
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      alerts[alertIndex].status = status;
      this.systemAlertsSubject.next(alerts);
    }
  }

  resolveSystemAlert(alertId: string, resolvedBy: string): void {
    const alerts = [...this.systemAlertsSubject.value];
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      alerts[alertIndex].resolutionTime = new Date();
      alerts[alertIndex].resolvedBy = resolvedBy;
      this.systemAlertsSubject.next(alerts);
    }
  }

  addSystemAlert(alert: SystemAlert): void {
    const alerts = [...this.systemAlertsSubject.value];
    alerts.unshift(alert);
    this.systemAlertsSubject.next(alerts);
  }

  // User notifications methods
  getUserNotifications(): Observable<UserNotification[]> {
    return this.userNotifications$;
  }

  getUserNotificationById(id: string): UserNotification | undefined {
    return this.userNotificationsSubject.value.find(notification => notification.id === id);
  }

  updateUserNotificationStatus(notificationId: string, status: UserNotification['status']): void {
    const notifications = [...this.userNotificationsSubject.value];
    const notificationIndex = notifications.findIndex(notification => notification.id === notificationId);
    if (notificationIndex !== -1) {
      notifications[notificationIndex].status = status;
      this.userNotificationsSubject.next(notifications);
    }
  }

  updateUserNotificationDeliveryStatus(notificationId: string, deliveryStatus: UserNotification['deliveryStatus']): void {
    const notifications = [...this.userNotificationsSubject.value];
    const notificationIndex = notifications.findIndex(notification => notification.id === notificationId);
    if (notificationIndex !== -1) {
      notifications[notificationIndex].deliveryStatus = deliveryStatus;
      this.userNotificationsSubject.next(notifications);
    }
  }

  addUserNotification(notification: UserNotification): void {
    const notifications = [...this.userNotificationsSubject.value];
    notifications.unshift(notification);
    this.userNotificationsSubject.next(notifications);
  }

  // System settings methods
  getSystemSettings(): Observable<SystemSettings> {
    return this.systemSettings$;
  }

  getSystemSettingById(id: string): SystemSettings | undefined {
    // Since we now have a single object, return the entire settings if id matches
    return this.systemSettingsSubject.value.id === parseInt(id) ? this.systemSettingsSubject.value : undefined;
  }

  getSystemSettingsByCategory(category: string): any {
    const settings = this.systemSettingsSubject.value;
    return settings[category as keyof SystemSettings] || {};
  }

  updateSystemSetting(settingId: string, newValue: any): void {
    const settings = { ...this.systemSettingsSubject.value };
    const path = settingId.split('.');
    let current: any = settings;

    // Navigate to the nested property
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }

    // Update the final property
    current[path[path.length - 1]] = newValue;
    settings.updatedAt = new Date();
    this.systemSettingsSubject.next(settings);
  }

  updateSystemSettings(settings: SystemSettings): void {
    const updatedSettings = { ...settings, updatedAt: new Date() };
    this.systemSettingsSubject.next(updatedSettings);
  }

  resetSystemSetting(settingId: string): void {
    // Reset to default values - for now, we'll reset to initial mock values
    const defaultSettings: SystemSettings = {
      id: 1,
      updatedBy: 1,
      updatedAt: new Date(),
      createdAt: new Date(),
      platform_name: 'CafeX POS',
      platform_url: 'https://cafex.com',
      platform_logo: '',
      default_language: 'en-IN',
      maintenance_mode: false,
      maintenance_message: 'The system is currently under maintenance. Please try again later.',
      file_upload_max_size: 10,
      backup_enabled: true,
      backup_frequency: 'daily',
      support_email: 'support@cafex.com',
      support_phone: '+91 98765 43210',
      terms_url: 'https://cafex.com/terms',
      privacy_url: 'https://cafex.com/privacy',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      max_concurrent_users: 1000,
      cache_enabled: true,
      cache_ttl: 3600,
      session_timeout: 30,
      password_min_length: 8,
      two_factor_required: false,
      email_notifications: true,
      sms_notifications: false,
      notification_batch_size: 100,
      api_rate_limit: 1000,
      webhook_retries: 3
    };

    const path = settingId.split('.');
    let current: any = defaultSettings;

    // Navigate to the nested property in default settings
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    const defaultValue = current[path[path.length - 1]];
    this.updateSystemSetting(settingId, defaultValue);
  }

  resetAllSystemSettings(): void {
    // Reset to default values
    const defaultSettings: SystemSettings = {
      id: 1,
      updatedBy: 1,
      updatedAt: new Date(),
      createdAt: new Date(),
      platform_name: 'CafeX POS',
      platform_url: 'https://cafex.com',
      platform_logo: '',
      default_language: 'en-IN',
      maintenance_mode: false,
      maintenance_message: 'The system is currently under maintenance. Please try again later.',
      file_upload_max_size: 10,
      backup_enabled: true,
      backup_frequency: 'daily',
      support_email: 'support@cafex.com',
      support_phone: '+91 98765 43210',
      terms_url: 'https://cafex.com/terms',
      privacy_url: 'https://cafex.com/privacy',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      max_concurrent_users: 1000,
      cache_enabled: true,
      cache_ttl: 3600,
      session_timeout: 30,
      password_min_length: 8,
      two_factor_required: false,
      email_notifications: true,
      sms_notifications: false,
      notification_batch_size: 100,
      api_rate_limit: 1000,
      webhook_retries: 3
    };
    this.systemSettingsSubject.next(defaultSettings);
  }

  // Navigation menu methods
  getNavigationMenus(): Observable<NavigationMenu[]> {
    return this.navigationMenus$;
  }

  getNavigationMenusByRole(role: User['role'] | 'all'): NavigationMenu[] {
    const allMenus = this.navigationMenusSubject.value;
    return this.buildMenuHierarchy(allMenus.filter(menu => menu.rolePermissions && menu.rolePermissions[role]));
  }

  private buildMenuHierarchy(menus: NavigationMenu[]): NavigationMenu[] {
    const menuMap = new Map<string, NavigationMenu>();
    const rootMenus: NavigationMenu[] = [];

    // Create map of all menus
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Build hierarchy
    menus.forEach(menu => {
      const menuWithChildren = menuMap.get(menu.id)!;
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children!.push(menuWithChildren);
        }
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    // Sort by order
    const sortMenus = (menus: NavigationMenu[]) => {
      menus.sort((a, b) => a.order - b.order);
      menus.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };

    sortMenus(rootMenus);
    return rootMenus;
  }

  // Kitchen display methods
  getKitchenDisplayOrders(): Order[] {
    return this.ordersSubject.value.filter(order =>
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    );
  }

  // Recipe management methods
  addRecipe(recipe: Recipe): void {
    const recipes = [...this.recipesSubject.value];
    recipes.push(recipe);
    this.recipesSubject.next(recipes);
  }

  updateRecipe(recipe: Recipe): void {
    const recipes = [...this.recipesSubject.value];
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index !== -1) {
      recipes[index] = recipe;
      this.recipesSubject.next(recipes);
    }
  }

  deleteRecipe(recipeId: string): void {
    const recipes = [...this.recipesSubject.value];
    const filteredRecipes = recipes.filter(r => r.id !== recipeId);
    this.recipesSubject.next(filteredRecipes);
  }

  toggleRecipeStatus(recipeId: string): void {
    const recipes = [...this.recipesSubject.value];
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      recipe.isActive = !recipe.isActive;
      recipe.updatedAt = new Date();
      this.recipesSubject.next(recipes);
    }
  }

  // Utility methods
  generateOrderId(): string {
    const timestamp = new Date().getFullYear().toString().slice(-2) +
                      ('0' + (new Date().getMonth() + 1)).slice(-2) +
                      ('0' + new Date().getDate()).slice(-2);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}