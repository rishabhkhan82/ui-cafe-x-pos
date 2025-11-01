// ============================================
// 📊 Cafe-X POS Database Schema
// ============================================
// Professional categorization for enterprise-grade POS system
// Total Tables: 76 | Last Updated: 2025-01-26
// ============================================

// 🏢 CORE BUSINESS ENTITIES
// ============================================
// Foundation tables for the entire platform

// 1. Users Table (Complete user information for all roles)
export const UsersTable = {
  id: "string", // Primary key
  username: "string", // Unique username for login
  password: "string", // Hashed password
  email: "string", // Email address
  phone: "string", // Phone number
  name: "string", // Full display name
  role: "string", // platform_owner | restaurant_owner | restaurant_manager | kitchen_manager | cashier | waiter | customer
  avatar: "string", // Profile picture URL
  restaurantId: "string", // Reference to restaurant (nullable for platform users)
  isActive: "boolean", // Account status
  lastLogin: "Date", // Last login timestamp

  // Staff-specific fields (for restaurant_owner, restaurant_manager, kitchen_manager, cashier, waiter)
  hireDate: "Date", // Date of hire
  salary: "number", // Monthly salary
  shift: "string", // morning | afternoon | evening | night
  skills: "string[]", // Array of skills
  performanceRating: "number", // Performance rating (1-5)
  emergencyContact: {
    name: "string",
    phone: "string",
    relationship: "string"
  },
  staffAddress: {
    street: "string",
    city: "string",
    state: "string",
    pincode: "string"
  },

  // Customer-specific fields (for customer role)
  memberSince: "Date", // Membership date
  totalOrders: "number", // Total orders placed
  totalSpent: "number", // Total amount spent
  loyaltyPoints: "number", // Current loyalty points
  favoriteItems: "string[]", // Array of favorite menu item IDs
  dietaryRestrictions: "string[]", // Dietary restrictions
  preferredPaymentMethod: "string", // Preferred payment method

  // Audit fields
  createdAt: "Date", // Account creation date
  updatedAt: "Date" // Last update timestamp
};

// 💰 FINANCIAL MANAGEMENT
// ============================================
// Payment processing, cash operations, and financial compliance
export const UserRolesTable = {
  id: "string", // Primary key
  name: "string", // Role display name
  code: "string", // Role code (platform_owner, restaurant_owner, etc.)
  description: "string", // Role description
  permissions: "string[]", // Array of permission strings
  isSystemRole: "boolean", // Whether this is a system-defined role
  isActive: "boolean", // Role status
  createdBy: "string", // User ID who created this role
  updatedAt: "Date",
  createdAt: "Date"
};

// 7. Navigation Menus Table (Menu structure and navigation items)
export const NavigationMenusTable = {
  id: "string", // Primary key
  name: "string", // Menu item name
  parentId: "string", // Parent menu ID (null for root level)
  role: "string", // Role this menu belongs to (or 'all' for shared)
  path: "string", // Route path
  icon: "string", // Icon class name
  order: "number", // Display order
  type: "string", // 'parent' | 'action'
  isActive: "boolean", // Menu item status
  createdAt: "Date",
  updatedAt: "Date"
};

// 8. Menu Access Permissions Table (Role-based access control)
export const MenuAccessPermissionsTable = {
  id: "string", // Primary key
  menuId: "string", // Foreign key to NavigationMenus
  roleId: "string", // Foreign key to UserRoles
  canView: "boolean", // Can view this menu item
  canEdit: "boolean", // Can edit menu item properties
  canDelete: "boolean", // Can delete menu item
  canCreate: "boolean", // Can create child menu items
  allowedUsers: "string[]", // Specific user IDs (optional override)
  additionalPermissions: "string[]", // Extra permissions
  updatedAt: "Date",
  createdAt: "Date"
};

// ============================================
// CORE SYSTEM TABLES (Foundation)
// ============================================

// 2. Restaurants Table
export const RestaurantsTable = {
  id: "string", // Primary key
  name: "string", // Restaurant name
  description: "string", // Restaurant description
  address: {
    street: "string",
    city: "string",
    state: "string",
    pincode: "string",
    country: "string"
  },
  contact: {
    phone: "string",
    email: "string",
    website: "string"
  },
  businessHours: {
    monday: { open: "string", close: "string", closed: "boolean" },
    tuesday: { open: "string", close: "string", closed: "boolean" },
    wednesday: { open: "string", close: "string", closed: "boolean" },
    thursday: { open: "string", close: "string", closed: "boolean" },
    friday: { open: "string", close: "string", closed: "boolean" },
    saturday: { open: "string", close: "string", closed: "boolean" },
    sunday: { open: "string", close: "string", closed: "boolean" }
  },
  taxSettings: {
    gstNumber: "string",
    gstPercentage: "number",
    serviceChargePercentage: "number"
  },
  paymentSettings: {
    acceptedPayments: "string[]", // ['cash', 'card', 'upi', 'wallet']
    defaultPayment: "string",
    tipEnabled: "boolean",
    tipOptions: "number[]" // [5, 10, 15, 20]
  },
  operationalSettings: {
    tableCount: "number",
    avgServiceTime: "number", // in minutes
    reservationEnabled: "boolean",
    onlineOrderingEnabled: "boolean",
    loyaltyProgramEnabled: "boolean"
  },
  notifications: {
    lowStockAlerts: "boolean",
    orderAlerts: "boolean",
    paymentAlerts: "boolean",
    staffAlerts: "boolean"
  },
  ownerId: "string", // Reference to Users table (restaurant_owner)
  subscriptionPlan: "string", // Subscription plan type
  isActive: "boolean", // Restaurant status
  createdAt: "Date",
  updatedAt: "Date"
};

// 3. System Configurations - Independent Tables for Different Config Types

// 3.1 General System Configurations Table
export const GeneralSystemConfigurationsTable = {
  id: "string", // Primary key
  platformName: "string", // Platform display name
  platformLogo: "string", // Logo URL
  defaultLanguage: "string", // Default language code
  defaultTimezone: "string", // Default timezone
  defaultCurrency: "string", // Default currency code
  maintenanceMode: "boolean", // Enable maintenance mode
  maintenanceMessage: "string", // Maintenance mode message
  apiRateLimit: "number", // API requests per minute
  fileUploadMaxSize: "number", // Max file upload size in MB
  sessionTimeout: "number", // Session timeout in minutes
  cacheEnabled: "boolean", // Enable caching
  cacheDuration: "number", // Cache duration in minutes
  backupEnabled: "boolean", // Enable automatic backups
  backupFrequency: "string", // 'daily' | 'weekly' | 'monthly'
  supportEmail: "string", // Support contact email
  supportPhone: "string", // Support contact phone
  termsUrl: "string", // Terms of service URL
  privacyUrl: "string", // Privacy policy URL
  updatedBy: "string",
  updatedAt: "Date",
  createdAt: "Date"
};

// 3.2 Payment Gateway Configurations Table
export const PaymentGatewayConfigurationsTable = {
  id: "string", // Primary key
  stripeApiKey: "string", // Stripe API key
  stripeWebhookSecret: "string", // Stripe webhook secret
  razorpayKeyId: "string", // Razorpay key ID
  razorpayKeySecret: "string", // Razorpay key secret
  razorpayWebhookSecret: "string", // Razorpay webhook secret
  defaultGateway: "string", // 'stripe' | 'razorpay'
  supportedCurrencies: "string[]", // ['INR', 'USD']
  testMode: "boolean", // Enable test/sandbox mode
  updatedBy: "string", // User ID who last updated
  updatedAt: "Date",
  createdAt: "Date"
};

// 3.2 Email Service Configurations Table
export const EmailServiceConfigurationsTable = {
  id: "string", // Primary key
  provider: "string", // 'sendgrid' | 'mailgun' | 'smtp'
  apiKey: "string", // Service API key
  fromEmail: "string", // Default from email
  fromName: "string", // Default from name
  smtpHost: "string", // SMTP host (if using SMTP)
  smtpPort: "number", // SMTP port
  smtpUsername: "string", // SMTP username
  smtpPassword: "string", // SMTP password
  templates: {
    orderConfirmation: "string", // Template ID for order confirmations
    passwordReset: "string", // Template ID for password resets
    welcomeEmail: "string", // Template ID for welcome emails
    paymentReceipt: "string" // Template ID for payment receipts
  },
  updatedBy: "string",
  updatedAt: "Date",
  createdAt: "Date"
};

// 3.3 Business Rules Configurations Table
export const BusinessRulesConfigurationsTable = {
  id: "string", // Primary key
  minimumOrderValue: "number", // Minimum order value in rupees
  freeDeliveryThreshold: "number", // Free delivery above this amount
  loyaltyPointsPerRupee: "number", // Points earned per rupee spent
  maxDiscountPercentage: "number", // Maximum discount percentage allowed
  serviceChargePercentage: "number", // Service charge percentage
  gstPercentage: "number", // GST percentage
  reservationAdvanceHours: "number", // Hours in advance for reservations
  tableTurnoverTime: "number", // Minutes for table turnover
  updatedBy: "string",
  updatedAt: "Date",
  createdAt: "Date"
};

// 3.4 Notification Configurations Table
export const NotificationConfigurationsTable = {
  id: "string", // Primary key
  emailNotifications: "boolean", // Enable email notifications
  smsNotifications: "boolean", // Enable SMS notifications
  pushNotifications: "boolean", // Enable push notifications
  orderAlerts: "boolean", // Alert on new orders
  paymentAlerts: "boolean", // Alert on payment issues
  lowStockAlerts: "boolean", // Alert on low inventory
  staffAlerts: "boolean", // Alert on staff issues
  smsProvider: "string", // 'twilio' | 'msg91' | 'aws-sns'
  smsApiKey: "string", // SMS service API key
  pushServerKey: "string", // FCM/VAPID key for push notifications
  updatedBy: "string",
  updatedAt: "Date",
  createdAt: "Date"
};

// 3.5 Security Configurations Table
export const SecurityConfigurationsTable = {
  id: "string", // Primary key
  sessionTimeout: "number", // Session timeout in minutes
  passwordMinLength: "number", // Minimum password length
  passwordRequireSpecialChars: "boolean", // Require special characters
  passwordRequireNumbers: "boolean", // Require numbers
  maxLoginAttempts: "number", // Max failed login attempts
  lockoutDuration: "number", // Lockout duration in minutes
  twoFactorEnabled: "boolean", // Enable 2FA
  auditLogRetention: "number", // Days to retain audit logs
  ipWhitelist: "string[]", // Allowed IP addresses
  updatedBy: "string",
  updatedAt: "Date",
  createdAt: "Date"
};

// 👥 HUMAN CAPITAL MANAGEMENT
// ============================================
// Workforce management, performance tracking, and development
export const CustomersTable = {
  id: "string", // Primary key (same as Users.id for customers)
  userId: "string", // Foreign key to Users table
  name: "string", // Customer full name
  email: "string", // Email address
  phone: "string", // Phone number
  avatar: "string", // Profile picture URL
  memberSince: "Date", // Membership date
  totalOrders: "number", // Total orders placed
  totalSpent: "number", // Total amount spent
  loyaltyPoints: "number", // Current loyalty points
  favoriteItems: "string[]", // Array of favorite menu item IDs
  preferredPaymentMethod: "string", // Preferred payment method
  isActive: "boolean", // Customer account status
  lastOrderDate: "Date", // Date of last order
  createdAt: "Date",
  updatedAt: "Date"
};

// 10. Customer Addresses Table (Customer delivery/pickup addresses)
export const CustomerAddressesTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  type: "string", // 'home' | 'work' | 'other'
  label: "string", // Custom label for the address
  street: "string", // Street address
  city: "string", // City
  state: "string", // State
  pincode: "string", // Postal code
  landmark: "string", // Nearby landmark
  latitude: "number", // GPS latitude
  longitude: "number", // GPS longitude
  isDefault: "boolean", // Is this the default address
  isActive: "boolean", // Address status
  createdAt: "Date",
  updatedAt: "Date"
};

// 11. Customer Preferences Table (Customer dietary preferences and settings)
export const CustomerPreferencesTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  notifications: "boolean", // Enable push notifications
  emailMarketing: "boolean", // Subscribe to email marketing
  smsMarketing: "boolean", // Subscribe to SMS marketing
  dietaryRestrictions: "string[]", // ['vegetarian', 'vegan', 'gluten-free', 'nut-free']
  favoriteCategories: "string[]", // Preferred menu categories
  spiceLevel: "string", // 'mild' | 'medium' | 'hot' | 'extra-hot'
  allergens: "string[]", // Known allergens
  preferredLanguage: "string", // Preferred language
  timezone: "string", // Customer timezone
  createdAt: "Date",
  updatedAt: "Date"
};

// 12. Loyalty Programs Table (Loyalty points and reward programs)
export const LoyaltyProgramsTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  programName: "string", // Loyalty program name
  pointsBalance: "number", // Current points balance
  totalPointsEarned: "number", // Total points earned all time
  totalPointsRedeemed: "number", // Total points redeemed
  tier: "string", // 'bronze' | 'silver' | 'gold' | 'platinum'
  tierExpiryDate: "Date", // When current tier expires
  lastActivityDate: "Date", // Last points earning/redeeming activity
  isActive: "boolean", // Program status
  createdAt: "Date",
  updatedAt: "Date"
};

// 🍽️ OPERATIONS MANAGEMENT
// ============================================
// Order fulfillment, kitchen operations, and service delivery
export const MenuItemsTable = {
  id: "string", // Primary key
  name: "string", // Item name
  description: "string", // Item description
  price: "number", // Base price
  originalPrice: "number", // Original price (for discounts)
  category: "string", // Menu category
  subcategory: "string", // Subcategory within main category
  image: "string", // Item image URL
  isAvailable: "boolean", // Item availability status
  isActive: "boolean", // Item active status
  isVegetarian: "boolean", // Vegetarian flag
  isVegan: "boolean", // Vegan flag
  isSpicy: "boolean", // Spicy flag
  isPopular: "boolean", // Popular item flag
  preparationTime: "number", // Preparation time in minutes
  allergens: "string[]", // Array of allergens
  nutritionalInfo: {
    calories: "number",
    protein: "number", // in grams
    carbs: "number", // in grams
    fat: "number", // in grams
    fiber: "number" // in grams
  },
  restaurantId: "string", // Foreign key to Restaurants table
  createdBy: "string", // User ID who created this item
  createdAt: "Date",
  updatedAt: "Date"
};

// 14. Menu Customizations Table (Customization options for menu items)
export const MenuCustomizationsTable = {
  id: "string", // Primary key
  menuItemId: "string", // Foreign key to Menu Items table
  name: "string", // Customization name (e.g., "Extra Cheese", "Spice Level")
  type: "string", // 'single' | 'multiple' (single choice vs multiple selections)
  required: "boolean", // Is this customization required
  maxSelections: "number", // Maximum selections allowed (for multiple type)
  minSelections: "number", // Minimum selections required
  displayOrder: "number", // Display order
  isActive: "boolean", // Customization status
  createdAt: "Date",
  updatedAt: "Date"
};

// 15. Recipes Table (Recipe details for kitchen preparation)
export const RecipesTable = {
  id: "string", // Primary key
  name: "string", // Recipe name
  description: "string", // Recipe description
  category: "string", // Recipe category
  type: "string", // 'prepared' | 'prepare_on_order'
  prepTime: "number", // Preparation time in minutes
  cookTime: "number", // Cooking time in minutes
  servings: "number", // Number of servings
  difficulty: "string", // 'easy' | 'medium' | 'hard'
  costPerServing: "number", // Cost per serving
  isActive: "boolean", // Recipe status
  menuItemId: "string", // Linked menu item ID
  restaurantId: "string", // Foreign key to Restaurants table
  createdBy: "string", // User ID who created this recipe
  createdAt: "Date",
  updatedAt: "Date"
};

// 16. Recipe Ingredients Table (Ingredients required for each recipe)
export const RecipeIngredientsTable = {
  id: "string", // Primary key
  recipeId: "string", // Foreign key to Recipes table
  ingredientId: "string", // Foreign key to Inventory Items table
  ingredientName: "string", // Ingredient name (for quick reference)
  quantity: "number", // Required quantity
  unit: "string", // Unit of measurement
  cost: "number", // Cost for this quantity
  isOptional: "boolean", // Whether ingredient is optional
  substituteAllowed: "boolean", // Can be substituted
  createdAt: "Date",
  updatedAt: "Date"
};

// ============================================
// ORDER MANAGEMENT
// ============================================

// 17. Orders Table (Main order records with customer and timing details)
export const OrdersTable = {
  id: "string", // Primary key
  orderNumber: "string", // Human-readable order number
  customerId: "string", // Foreign key to Customers table
  customerName: "string", // Customer name (for quick reference)
  tableNumber: "string", // Table number (for dine-in)
  status: "string", // 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'served' | 'completed' | 'cancelled' | 'billing_requested'
  orderType: "string", // 'dine_in' | 'takeaway' | 'delivery'
  totalAmount: "number", // Total order amount
  taxAmount: "number", // Tax amount
  discountAmount: "number", // Discount applied
  finalAmount: "number", // Final amount after tax and discount
  paymentStatus: "string", // 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: "string", // 'cash' | 'card' | 'upi' | 'wallet'
  specialInstructions: "string", // Customer special instructions
  estimatedReadyTime: "Date", // Estimated ready time
  actualReadyTime: "Date", // Actual ready time
  deliveredAt: "Date", // Delivery/pickup time
  priority: "string", // 'low' | 'medium' | 'high'
  assignedStaff: "string", // Staff member assigned to order
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date",
  updatedAt: "Date"
};

// 18. Order Items Table (Individual items within each order)
export const OrderItemsTable = {
  id: "string", // Primary key
  orderId: "string", // Foreign key to Orders table
  menuItemId: "string", // Foreign key to Menu Items table
  menuItemName: "string", // Item name (for quick reference)
  quantity: "number", // Quantity ordered
  unitPrice: "number", // Price per unit
  totalPrice: "number", // Total price for this item
  category: "string", // Menu category
  specialInstructions: "string", // Item-specific instructions
  status: "string", // Item preparation status
  preparedBy: "string", // Staff who prepared this item
  preparedAt: "Date", // When item was prepared
  createdAt: "Date",
  updatedAt: "Date"
};

// 19. Order Customizations Table (Selected customizations for order items)
export const OrderCustomizationsTable = {
  id: "string", // Primary key
  orderItemId: "string", // Foreign key to Order Items table
  customizationId: "string", // Foreign key to Menu Customizations table
  customizationName: "string", // Customization name
  optionId: "string", // Selected option ID
  optionName: "string", // Selected option name
  additionalPrice: "number", // Additional cost
  createdAt: "Date"
};

// 📊 BUSINESS INTELLIGENCE
// ============================================
// Operational analytics, financial insights, and performance dashboards
export const InventoryItemsTable = {
  id: "string", // Primary key
  name: "string", // Item name
  sku: "string", // Stock keeping unit
  category: "string", // Inventory category
  subcategory: "string", // Subcategory
  unit: "string", // Unit of measurement
  currentStock: "number", // Current stock level
  minStockLevel: "number", // Minimum stock level (reorder point)
  maxStockLevel: "number", // Maximum stock level
  reorderQuantity: "number", // Standard reorder quantity
  unitCost: "number", // Cost per unit
  supplierId: "string", // Foreign key to Suppliers table
  supplierName: "string", // Supplier name (for quick reference)
  description: "string", // Item description
  expiryDate: "Date", // Expiry date (for perishable items)
  location: "string", // Storage location in kitchen
  isActive: "boolean", // Item status
  restaurantId: "string", // Foreign key to Restaurants table
  lastUpdated: "Date",
  createdAt: "Date",
  updatedAt: "Date"
};

// 21. Supplier Information Table (Supplier details for inventory items)
export const SupplierInformationTable = {
  id: "string", // Primary key
  name: "string", // Supplier name
  contactPerson: "string", // Primary contact person
  email: "string", // Contact email
  phone: "string", // Contact phone
  address: {
    street: "string",
    city: "string",
    state: "string",
    pincode: "string",
    country: "string"
  },
  paymentTerms: "string", // Payment terms (e.g., "Net 30", "COD")
  deliveryTime: "number", // Average delivery time in days
  minimumOrderValue: "number", // Minimum order value
  categories: "string[]", // Categories supplied
  rating: "number", // Supplier rating (1-5)
  isActive: "boolean", // Supplier status
  contractStartDate: "Date", // Contract start date
  contractEndDate: "Date", // Contract end date
  createdAt: "Date",
  updatedAt: "Date"
};

// 22. Stock Adjustments Table (Inventory adjustments and stock movements)
export const StockAdjustmentsTable = {
  id: "string", // Primary key
  inventoryItemId: "string", // Foreign key to Inventory Items table
  adjustmentType: "string", // 'addition' | 'reduction' | 'correction' | 'damage' | 'expiry'
  quantity: "number", // Quantity adjusted (positive for addition, negative for reduction)
  previousStock: "number", // Stock level before adjustment
  newStock: "number", // Stock level after adjustment
  reason: "string", // Reason for adjustment
  reference: "string", // Reference number (PO, invoice, etc.)
  cost: "number", // Cost associated with adjustment
  performedBy: "string", // User ID who performed adjustment
  notes: "string", // Additional notes
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date"
};

// 🔧 PLATFORM INFRASTRUCTURE
// ============================================
// System administration, security, and third-party integrations
export const TransactionsTable = {
  id: "string", // Primary key
  orderId: "string", // Foreign key to Orders table
  transactionId: "string", // External transaction ID (from payment gateway)
  amount: "number", // Transaction amount
  currency: "string", // Transaction currency
  paymentMethod: "string", // 'cash' | 'card' | 'upi' | 'wallet'
  gateway: "string", // 'stripe' | 'razorpay' | 'cash'
  status: "string", // 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  gatewayResponse: "object", // Raw gateway response
  processedBy: "string", // User ID who processed payment
  processedAt: "Date", // When payment was processed
  refundedAmount: "number", // Amount refunded (if any)
  refundReason: "string", // Reason for refund
  refundedAt: "Date", // When refund was processed
  refundedBy: "string", // User ID who processed refund
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date",
  updatedAt: "Date"
};

// 24. Payment Methods Table (Available payment methods and configurations)
export const PaymentMethodsTable = {
  id: "string", // Primary key
  name: "string", // Payment method name
  type: "string", // 'cash' | 'card' | 'digital' | 'wallet'
  provider: "string", // Provider name (Visa, Mastercard, Paytm, etc.)
  isActive: "boolean", // Method availability
  processingFee: "number", // Processing fee percentage
  minAmount: "number", // Minimum transaction amount
  maxAmount: "number", // Maximum transaction amount
  settlementPeriod: "number", // Settlement period in days
  configuration: "object", // Method-specific configuration
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date",
  updatedAt: "Date"
};

// 25. Offers Table (Discounts, coupons, and promotional offers)
export const OffersTable = {
  id: "string", // Primary key
  name: "string", // Offer name
  title: "string", // Display title
  description: "string", // Offer description
  type: "string", // 'percentage' | 'fixed' | 'buy_one_get_one' | 'free_item' | 'loyalty'
  value: "number", // Discount value (percentage or amount)
  discountValue: "number", // Actual discount amount
  minOrderValue: "number", // Minimum order value required
  applicableItems: "string[]", // Specific menu item IDs
  applicableCategories: "string[]", // Applicable categories
  applicableCustomers: "string[]", // Specific customer IDs (optional)
  startDate: "Date", // Offer start date
  endDate: "Date", // Offer end date
  usageLimit: "number", // Total usage limit
  usageCount: "number", // Current usage count
  maxUsagePerCustomer: "number", // Max uses per customer
  isActive: "boolean", // Offer status
  autoApply: "boolean", // Auto-apply to eligible orders
  code: "string", // Promo code (optional)
  terms: "string", // Terms and conditions
  restaurantId: "string", // Foreign key to Restaurants table
  createdBy: "string", // User ID who created offer
  createdAt: "Date",
  updatedAt: "Date"
};

// 🎯 CUSTOMER EXPERIENCE
// ============================================
// Customer relationship management and personalization
export const ShiftSchedulesTable = {
  id: "string", // Primary key
  staffId: "string", // Foreign key to Users table
  staffName: "string", // Staff name (for quick reference)
  date: "Date", // Shift date
  shift: "string", // 'morning' | 'afternoon' | 'evening' | 'night'
  startTime: "string", // Shift start time (HH:MM)
  endTime: "string", // Shift end time (HH:MM)
  status: "string", // 'scheduled' | 'confirmed' | 'completed' | 'absent' | 'late' | 'cancelled'
  checkInTime: "Date", // Actual check-in time
  checkOutTime: "Date", // Actual check-out time
  hoursWorked: "number", // Calculated hours worked
  assignedBy: "string", // User ID who assigned shift
  notes: "string", // Shift notes
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date",
  updatedAt: "Date"
};

// 27. Shift Reports Table (End-of-shift reports and summaries)
export const ShiftReportsTable = {
  id: "string", // Primary key
  shiftId: "string", // Foreign key to Shift Schedules table
  staffId: "string", // Foreign key to Users table
  date: "Date", // Report date
  shift: "string", // Shift type
  startTime: "Date", // Shift start time
  endTime: "Date", // Shift end time
  ordersProcessed: "number", // Number of orders processed
  revenue: "number", // Total revenue for shift
  cashSales: "number", // Cash sales amount
  cardSales: "number", // Card sales amount
  upiSales: "number", // UPI/digital sales amount
  openingCash: "number", // Opening cash balance
  cashReceived: "number", // Cash received during shift
  cashPaidOut: "number", // Cash paid out
  expectedCash: "number", // Expected closing cash
  actualCash: "number", // Actual closing cash
  cashDifference: "number", // Cash discrepancy
  voidedItems: "number", // Number of voided items
  voidedAmount: "number", // Total voided amount
  refundsProcessed: "number", // Number of refunds
  refundAmount: "number", // Total refund amount
  customerComplaints: "number", // Number of complaints
  incidents: "string[]", // Incident descriptions
  notes: "string", // Additional notes
  managerApproval: "boolean", // Manager approval status
  generatedAt: "Date", // Report generation time
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date"
};

// 28. Restaurant Settings Table (Restaurant-specific configurations)
export const RestaurantSettingsTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  settingKey: "string", // Setting identifier
  settingValue: "any", // Setting value (flexible type)
  category: "string", // Setting category
  description: "string", // Setting description
  isPublic: "boolean", // Whether client-accessible
  updatedBy: "string", // User ID who last updated
  updatedAt: "Date",
  createdAt: "Date"
};

// 📱 USER EXPERIENCE & COMMUNICATION
// ============================================
// Shared UI components and cross-platform communication
export const NotificationsTable = {
  id: "string", // Primary key
  title: "string", // Notification title
  message: "string", // Notification message
  type: "string", // 'order' | 'system' | 'staff' | 'inventory' | 'payment' | 'promotion'
  priority: "string", // 'low' | 'medium' | 'high'
  status: "string", // 'unread' | 'read' | 'archived'
  recipientId: "string", // Specific recipient user ID
  recipientRole: "string", // Recipient role (for broadcast)
  icon: "string", // Icon class name
  actionUrl: "string", // Action URL (optional)
  actionText: "string", // Action button text
  relatedOrderId: "string", // Related order ID (if applicable)
  relatedEntityId: "string", // Related entity ID
  relatedEntityType: "string", // Related entity type
  expiresAt: "Date", // Expiration date
  sentAt: "Date", // When notification was sent
  readAt: "Date", // When notification was read
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date"
};

// 30. Broadcast Messages Table (Platform-wide announcements and messages)
export const BroadcastMessagesTable = {
  id: "string", // Primary key
  title: "string", // Message title
  message: "string", // Message content
  type: "string", // 'announcement' | 'alert' | 'promotion' | 'maintenance'
  priority: "string", // 'low' | 'medium' | 'high' | 'critical'
  targetAudience: "string", // 'all' | 'customers' | 'staff' | 'restaurant_owners'
  targetRestaurantIds: "string[]", // Specific restaurant IDs (optional)
  targetUserIds: "string[]", // Specific user IDs (optional)
  startDate: "Date", // When to start showing
  endDate: "Date", // When to stop showing
  isActive: "boolean", // Message status
  showOnLogin: "boolean", // Show on login screen
  showOnDashboard: "boolean", // Show on dashboard
  dismissible: "boolean", // Can be dismissed
  dismissedBy: "string[]", // User IDs who dismissed
  sentBy: "string", // User ID who sent message
  sentAt: "Date", // When message was sent
  createdAt: "Date",
  updatedAt: "Date"
};

// 👨‍🍳 SERVICE MANAGEMENT
// ============================================
// Waiter operations and front-of-house service delivery
export const AnalyticsDataTable = {
  id: "string", // Primary key
  date: "Date", // Date of analytics data
  restaurantId: "string", // Foreign key to Restaurants table
  metric: "string", // Metric name (sales, orders, customers, etc.)
  category: "string", // Metric category
  value: "number", // Metric value
  metadata: "object", // Additional metric data
  period: "string", // 'hourly' | 'daily' | 'weekly' | 'monthly'
  createdAt: "Date"
};

// 32. Audit Logs Table (System activity logs for compliance and debugging)
export const AuditLogsTable = {
  id: "string", // Primary key
  userId: "string", // User who performed action
  userName: "string", // User name (for quick reference)
  action: "string", // Action performed
  entityType: "string", // Type of entity affected
  entityId: "string", // ID of affected entity
  entityName: "string", // Name of affected entity
  oldValues: "object", // Previous values (for updates)
  newValues: "object", // New values (for updates/creates)
  ipAddress: "string", // User IP address
  userAgent: "string", // User browser/device info
  timestamp: "Date", // When action occurred
  restaurantId: "string", // Foreign key to Restaurants table
  sessionId: "string", // User session ID
  createdAt: "Date"
};

// 💳 SUBSCRIPTION MANAGEMENT
// ============================================
// SaaS subscription plans and billing management
export const SubscriptionPlansTable = {
  id: "string", // Primary key
  name: "string", // Internal plan name
  displayName: "string", // Display name for customers
  description: "string", // Plan description
  price: "number", // Monthly/Yearly price
  currency: "string", // Currency code (INR, USD, etc.)
  billingCycle: "string", // 'monthly' | 'yearly'
  maxRestaurants: "number", // Maximum restaurants allowed (-1 for unlimited)
  maxUsers: "number", // Maximum users allowed (-1 for unlimited)
  features: "string[]", // Array of feature IDs included
  isActive: "boolean", // Plan availability status
  isPopular: "boolean", // Mark as popular plan
  subscriberCount: "number", // Current subscriber count
  revenue: "number", // Total revenue generated
  trialDays: "number", // Free trial period in days
  setupFee: "number", // One-time setup fee
  createdBy: "string", // User ID who created the plan
  createdAt: "Date",
  updatedAt: "Date"
};

// 34. Plan Features Table (Available features for plans)
export const PlanFeaturesTable = {
  id: "string", // Primary key
  name: "string", // Feature display name
  description: "string", // Feature description
  category: "string", // 'core' | 'advanced' | 'premium'
  isEnabled: "boolean", // Feature availability
  sortOrder: "number", // Display order
  createdAt: "Date",
  updatedAt: "Date"
};

// 35. Restaurant Subscriptions Table (Restaurant plan subscriptions)
export const RestaurantSubscriptionsTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  planId: "string", // Foreign key to Subscription Plans table
  status: "string", // 'active' | 'inactive' | 'cancelled' | 'suspended' | 'trial'
  startDate: "Date", // Subscription start date
  endDate: "Date", // Subscription end date (for fixed plans)
  trialEndDate: "Date", // Trial period end date
  nextBillingDate: "Date", // Next billing cycle date
  billingCycle: "string", // 'monthly' | 'yearly'
  currentPeriodStart: "Date", // Current billing period start
  currentPeriodEnd: "Date", // Current billing period end
  cancelAtPeriodEnd: "boolean", // Cancel at period end
  cancelledAt: "Date", // Cancellation date
  cancellationReason: "string", // Reason for cancellation
  paymentMethodId: "string", // Default payment method
  autoRenew: "boolean", // Auto-renewal enabled
  discountCode: "string", // Applied discount code
  discountAmount: "number", // Discount amount
  finalAmount: "number", // Amount after discount
  createdBy: "string", // User ID who created subscription
  createdAt: "Date",
  updatedAt: "Date"
};

// 36. Subscription Usage Table (Track usage against plan limits)
export const SubscriptionUsageTable = {
  id: "string", // Primary key
  subscriptionId: "string", // Foreign key to Restaurant Subscriptions
  metric: "string", // Usage metric (restaurants, users, orders, etc.)
  currentValue: "number", // Current usage value
  limitValue: "number", // Plan limit (-1 for unlimited)
  periodStart: "Date", // Usage period start
  periodEnd: "Date", // Usage period end
  isApproachingLimit: "boolean", // Near limit warning
  lastUpdated: "Date",
  createdAt: "Date"
};

// 37. Subscription Invoices Table (Billing and payment records)
export const SubscriptionInvoicesTable = {
  id: "string", // Primary key
  subscriptionId: "string", // Foreign key to Restaurant Subscriptions
  invoiceNumber: "string", // Unique invoice number
  amount: "number", // Invoice amount
  currency: "string", // Currency code
  status: "string", // 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  billingPeriodStart: "Date", // Billing period start
  billingPeriodEnd: "Date", // Billing period end
  dueDate: "Date", // Payment due date
  paidAt: "Date", // Payment date
  paymentMethod: "string", // Payment method used
  transactionId: "string", // Payment gateway transaction ID
  pdfUrl: "string", // Invoice PDF URL
  notes: "string", // Invoice notes
  createdAt: "Date",
  updatedAt: "Date"
};

// 38. Feature Access Control Table (Control feature access based on plans)
export const FeatureAccessControlTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  featureId: "string", // Foreign key to Plan Features table
  planId: "string", // Foreign key to Subscription Plans table
  isEnabled: "boolean", // Feature access status
  restrictions: "object", // Feature-specific restrictions
  overrideBy: "string", // User ID who granted override
  overrideReason: "string", // Reason for override
  validUntil: "Date", // Override expiry date
  createdAt: "Date",
  updatedAt: "Date"
};

// 🔐 SECURITY & AUTHENTICATION
// ============================================
// User authentication, sessions, and security management
export const UserSessionsTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table
  sessionToken: "string", // Unique session token
  refreshToken: "string", // Refresh token for session renewal
  deviceInfo: "object", // Device and browser information
  ipAddress: "string", // IP address of the session
  userAgent: "string", // Browser user agent
  location: "object", // Geographic location data
  isActive: "boolean", // Session status
  expiresAt: "Date", // Session expiry time
  lastActivity: "Date", // Last activity timestamp
  createdAt: "Date"
};

// 40. Login Attempts Table (Track login attempts for security)
export const LoginAttemptsTable = {
  id: "string", // Primary key
  username: "string", // Attempted username/email
  ipAddress: "string", // IP address of attempt
  userAgent: "string", // Browser/device info
  attemptTime: "Date", // When attempt was made
  success: "boolean", // Whether login was successful
  failureReason: "string", // Reason for failure (if applicable)
  location: "object", // Geographic location
  deviceFingerprint: "string", // Device fingerprint for tracking
  blocked: "boolean", // Whether IP was blocked after this attempt
  createdAt: "Date"
};

// 41. Password Reset Tokens Table (Handle password reset functionality)
export const PasswordResetTokensTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table
  token: "string", // Secure reset token
  email: "string", // Email address for verification
  expiresAt: "Date", // Token expiry time
  usedAt: "Date", // When token was used (if successful)
  isUsed: "boolean", // Whether token has been used
  ipAddress: "string", // IP address that requested reset
  userAgent: "string", // Browser info
  createdAt: "Date"
};

// 42. Account Lockouts Table (Track account lockouts due to failed attempts)
export const AccountLockoutsTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table
  lockoutStart: "Date", // When lockout began
  lockoutEnd: "Date", // When lockout expires
  reason: "string", // Reason for lockout
  failedAttempts: "number", // Number of failed attempts that triggered lockout
  ipAddresses: "string[]", // IP addresses involved
  isActive: "boolean", // Whether lockout is still active
  unlockedBy: "string", // User/Admin who unlocked account
  unlockedAt: "Date", // When account was unlocked
  createdAt: "Date"
};

// 43. Two Factor Authentication Table (2FA settings and codes)
export const TwoFactorAuthenticationTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table
  isEnabled: "boolean", // Whether 2FA is enabled
  method: "string", // 'sms' | 'email' | 'app' (authenticator app)
  secretKey: "string", // Secret key for TOTP
  backupCodes: "string[]", // Backup recovery codes
  phoneNumber: "string", // Phone for SMS 2FA
  emailAddress: "string", // Email for email 2FA
  verifiedAt: "Date", // When 2FA was last verified
  lastUsed: "Date", // Last time 2FA was used
  createdAt: "Date",
  updatedAt: "Date"
};

// 44. API Keys Table (For API access and integrations)
export const ApiKeysTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table (who created the key)
  restaurantId: "string", // Foreign key to Restaurants table
  name: "string", // Key name/description
  key: "string", // The actual API key
  permissions: "string[]", // Array of permissions granted
  rateLimit: "number", // Requests per minute/hour
  isActive: "boolean", // Key status
  expiresAt: "Date", // Key expiry date
  lastUsed: "Date", // Last usage timestamp
  usageCount: "number", // Total usage count
  ipWhitelist: "string[]", // Allowed IP addresses
  createdAt: "Date",
  updatedAt: "Date"
};

// 🧾 CASHIER OPERATIONS
// ============================================
// Cash handling, drawer management, and transaction processing
export const CashDrawerOperationsTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  cashierId: "string", // Foreign key to Users table (cashier)
  drawerId: "string", // Unique drawer identifier
  status: "string", // 'active' | 'reconciled' | 'closed' | 'suspended'
  startingFloat: "number", // Opening float amount
  currentBalance: "number", // Current cash balance
  expectedBalance: "number", // Expected balance based on transactions
  variance: "number", // Difference between actual and expected
  lastReconciled: "Date", // Last reconciliation timestamp
  reconciledBy: "string", // User ID who performed reconciliation
  shiftId: "string", // Associated shift ID
  openedAt: "Date", // When drawer was opened
  closedAt: "Date", // When drawer was closed
  notes: "string", // Additional notes
  createdAt: "Date",
  updatedAt: "Date"
};

// 46. Cash Transactions Table (Detailed cash movement tracking)
export const CashTransactionsTable = {
  id: "string", // Primary key
  drawerId: "string", // Foreign key to Cash Drawer Operations
  transactionType: "string", // 'deposit' | 'withdrawal' | 'float_start' | 'float_end' | 'safe_deposit' | 'change_fund' | 'sale' | 'refund'
  amount: "number", // Transaction amount (positive for additions, negative for subtractions)
  description: "string", // Transaction description
  reference: "string", // Reference number (order ID, invoice, etc.)
  performedBy: "string", // User ID who performed transaction
  approvedBy: "string", // User ID who approved (for restricted operations)
  approvalRequired: "boolean", // Whether approval was required
  ipAddress: "string", // IP address of transaction
  deviceInfo: "object", // Device/browser information
  balanceBefore: "number", // Cash balance before transaction
  balanceAfter: "number", // Cash balance after transaction
  isVoided: "boolean", // Whether transaction was voided
  voidedBy: "string", // User who voided transaction
  voidedAt: "Date", // When transaction was voided
  voidReason: "string", // Reason for voiding
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date"
};

// 47. Receipt Logs Table (Receipt printing and management)
export const ReceiptLogsTable = {
  id: "string", // Primary key
  orderId: "string", // Foreign key to Orders table
  receiptNumber: "string", // Unique receipt number
  receiptType: "string", // 'original' | 'duplicate' | 'reprint' | 'refund'
  printFormat: "string", // 'thermal' | 'a4' | 'digital'
  printerId: "string", // Printer identifier
  printerName: "string", // Printer name/description
  cashierId: "string", // User ID who printed receipt
  customerEmail: "string", // Email for digital receipts
  customerPhone: "string", // Phone for SMS receipts
  printStatus: "string", // 'success' | 'failed' | 'pending'
  failureReason: "string", // Reason for print failure
  printAttempts: "number", // Number of print attempts
  paperSize: "string", // Paper size used
  templateUsed: "string", // Receipt template identifier
  totalAmount: "number", // Receipt total for verification
  taxAmount: "number", // Tax amount on receipt
  discountAmount: "number", // Discount amount on receipt
  paymentMethod: "string", // Payment method shown on receipt
  qrCode: "string", // QR code data for digital verification
  digitalCopyUrl: "string", // URL for digital receipt copy
  ipAddress: "string", // IP address of print request
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date"
};

// 48. Cashier Sessions Table (Cashier login sessions and activity)
export const CashierSessionsTable = {
  id: "string", // Primary key
  cashierId: "string", // Foreign key to Users table
  restaurantId: "string", // Foreign key to Restaurants table
  sessionToken: "string", // Unique session identifier
  loginTime: "Date", // When cashier logged in
  logoutTime: "Date", // When cashier logged out
  sessionDuration: "number", // Session duration in minutes
  ipAddress: "string", // Login IP address
  deviceInfo: "object", // Device and browser information
  location: "object", // Geographic location data
  drawerId: "string", // Associated cash drawer
  shiftId: "string", // Associated shift
  ordersProcessed: "number", // Number of orders processed in session
  salesAmount: "number", // Total sales amount in session
  refundsProcessed: "number", // Number of refunds processed
  refundAmount: "number", // Total refund amount
  voidsProcessed: "number", // Number of voids processed
  voidAmount: "number", // Total void amount
  cashHandled: "number", // Total cash handled
  sessionStatus: "string", // 'active' | 'completed' | 'terminated' | 'suspended'
  terminationReason: "string", // Reason for early termination
  terminatedBy: "string", // User who terminated session
  notes: "string", // Session notes
  createdAt: "Date",
  updatedAt: "Date"
};

// 🛒 E-COMMERCE & LOYALTY
// ============================================
// Online ordering, cart management, and loyalty programs
export const ShoppingCartTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  restaurantId: "string", // Foreign key to Restaurants table
  sessionId: "string", // Browser session identifier
  cartItems: "object[]", // Array of cart items with menuItemId, quantity, customizations
  subtotal: "number", // Cart subtotal before tax/discount
  taxAmount: "number", // Estimated tax amount
  discountAmount: "number", // Applied discounts
  totalAmount: "number", // Total cart amount
  appliedOffers: "string[]", // Applied offer IDs
  specialInstructions: "string", // Cart-level special instructions
  deliveryAddressId: "string", // Selected delivery address
  orderType: "string", // 'dine_in' | 'takeaway' | 'delivery'
  estimatedDeliveryTime: "Date", // Estimated delivery/prep time
  isActive: "boolean", // Whether cart is active (not expired)
  expiresAt: "Date", // Cart expiration time
  lastModified: "Date", // Last cart modification
  createdAt: "Date"
};

// 50. Customer Payment Methods Table (Saved payment methods for customers)
export const CustomerPaymentMethodsTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  paymentType: "string", // 'card' | 'upi' | 'wallet' | 'net_banking'
  provider: "string", // Payment provider (Visa, Mastercard, Paytm, etc.)
  accountIdentifier: "string", // Masked account number/last 4 digits
  token: "string", // Secure payment token
  expiryMonth: "number", // Card expiry month
  expiryYear: "number", // Card expiry year
  cardholderName: "string", // Name on card
  billingAddressId: "string", // Billing address reference
  isDefault: "boolean", // Default payment method
  isActive: "boolean", // Payment method status
  failedAttempts: "number", // Number of failed payment attempts
  lastUsed: "Date", // Last successful usage
  verificationStatus: "string", // 'verified' | 'pending' | 'failed'
  metadata: "object", // Additional payment method data
  createdAt: "Date",
  updatedAt: "Date"
};

// 51. Points Transactions Table (Detailed loyalty points history)
export const PointsTransactionsTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  transactionType: "string", // 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus'
  points: "number", // Points amount (positive for earned, negative for redeemed)
  balanceBefore: "number", // Points balance before transaction
  balanceAfter: "number", // Points balance after transaction
  referenceType: "string", // 'order' | 'referral' | 'review' | 'birthday' | 'manual'
  referenceId: "string", // Reference entity ID (order ID, etc.)
  description: "string", // Human-readable description
  expiryDate: "Date", // When these points expire
  source: "string", // Source of points (restaurant, platform, etc.)
  restaurantId: "string", // Foreign key to Restaurants table
  processedBy: "string", // User who processed transaction
  notes: "string", // Additional notes
  createdAt: "Date"
};

// 52. Referral Program Table (Customer referral tracking and rewards)
export const ReferralProgramTable = {
  id: "string", // Primary key
  referrerId: "string", // Foreign key to Customers table (who referred)
  refereeId: "string", // Foreign key to Customers table (who was referred)
  referralCode: "string", // Unique referral code used
  referralStatus: "string", // 'pending' | 'completed' | 'expired' | 'cancelled'
  rewardType: "string", // 'points' | 'discount' | 'free_item'
  rewardValue: "number", // Reward amount/value
  rewardStatus: "string", // 'pending' | 'credited' | 'failed'
  refereeFirstOrderId: "string", // First order ID of referee
  refereeSignupDate: "Date", // When referee signed up
  rewardCreditedAt: "Date", // When reward was credited
  expiryDate: "Date", // When referral expires
  termsAccepted: "boolean", // Whether terms were accepted
  ipAddress: "string", // IP address of referral
  deviceInfo: "object", // Device information
  campaignId: "string", // Associated marketing campaign
  notes: "string", // Additional notes
  createdAt: "Date",
  updatedAt: "Date"
};

// 👨‍🍳 KITCHEN OPERATIONS
// ============================================
// Kitchen staff, recipe management, and food preparation tracking
export const KitchenStaffTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table
  restaurantId: "string", // Foreign key to Restaurants table
  role: "string", // 'head_chef' | 'sous_chef' | 'line_cook' | 'prep_cook' | 'dishwasher'
  station: "string", // Assigned station (grill, fry, salad, etc.)
  shift: "string", // 'morning' | 'afternoon' | 'evening' | 'night'
  isActive: "boolean", // Current active status
  hireDate: "Date", // When staff member was hired
  performanceRating: "number", // Current performance rating (1-5)
  skills: "string[]", // Array of skills/certifications
  certifications: "string[]", // Food safety and other certifications
  emergencyContact: "object", // Emergency contact information
  workSchedule: "object", // Weekly work schedule
  currentTask: "string", // Currently assigned task
  lastActive: "Date", // Last activity timestamp
  totalOrdersPrepared: "number", // Total orders prepared
  averagePrepTime: "number", // Average preparation time in minutes
  qualityRating: "number", // Quality rating (1-5)
  attendanceRate: "number", // Attendance percentage
  notes: "string", // Additional notes
  createdAt: "Date",
  updatedAt: "Date"
};

// 54. Kitchen Display Sessions Table (KDS operator sessions and activity)
export const KitchenDisplaySessionsTable = {
  id: "string", // Primary key
  operatorId: "string", // Foreign key to Users table (who operated KDS)
  restaurantId: "string", // Foreign key to Restaurants table
  stationId: "string", // Kitchen station identifier
  sessionStart: "Date", // When session started
  sessionEnd: "Date", // When session ended
  sessionDuration: "number", // Session duration in minutes
  ordersViewed: "number", // Number of orders viewed
  ordersUpdated: "number", // Number of orders status updated
  ordersCompleted: "number", // Number of orders marked completed
  averageResponseTime: "number", // Average time to update order status
  deviceInfo: "object", // Device/browser information
  ipAddress: "string", // IP address of KDS terminal
  screenResolution: "string", // Screen resolution used
  ordersByHour: "object", // Hourly order processing breakdown
  peakHours: "string[]", // Peak processing hours
  bottlenecks: "string[]", // Identified bottlenecks during session
  sessionNotes: "string", // Session notes and observations
  createdAt: "Date"
};

// 55. Recipe Usage Logs Table (Recipe usage tracking for analytics)
export const RecipeUsageLogsTable = {
  id: "string", // Primary key
  recipeId: "string", // Foreign key to Recipes table
  orderId: "string", // Foreign key to Orders table
  orderItemId: "string", // Foreign key to Order Items table
  quantityPrepared: "number", // Quantity prepared for this order
  preparationTime: "number", // Actual preparation time in minutes
  estimatedTime: "number", // Estimated preparation time
  staffId: "string", // Foreign key to Users table (who prepared)
  station: "string", // Kitchen station used
  qualityRating: "number", // Quality rating (1-5)
  wastageAmount: "number", // Amount of wastage in grams/units
  costVariance: "number", // Cost variance from estimated
  specialInstructions: "string", // Special preparation instructions followed
  modifications: "string[]", // Any modifications made to recipe
  customerFeedback: "string", // Customer feedback if any
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date"
};

// 56. Inventory Alerts Table (Persistent inventory alert management)
export const InventoryAlertsTable = {
  id: "string", // Primary key
  inventoryItemId: "string", // Foreign key to Inventory Items table
  alertType: "string", // 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired'
  severity: "string", // 'low' | 'medium' | 'high' | 'critical'
  threshold: "number", // Threshold value that triggered alert
  currentValue: "number", // Current inventory value
  unit: "string", // Unit of measurement
  message: "string", // Alert message
  isActive: "boolean", // Whether alert is still active
  acknowledgedBy: "string", // User ID who acknowledged
  acknowledgedAt: "Date", // When alert was acknowledged
  resolvedBy: "string", // User ID who resolved
  resolvedAt: "Date", // When alert was resolved
  resolutionNotes: "string", // Notes about resolution
  autoGenerated: "boolean", // Whether alert was auto-generated
  escalationLevel: "number", // Escalation level (1-5)
  reminderSent: "boolean", // Whether reminder was sent
  lastReminder: "Date", // Last reminder timestamp
  restaurantId: "string", // Foreign key to Restaurants table
  createdAt: "Date",
  updatedAt: "Date"
};

// 57. Kitchen Performance Metrics Table (Detailed kitchen performance tracking)
export const KitchenPerformanceMetricsTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  date: "Date", // Date of metrics
  shift: "string", // 'morning' | 'afternoon' | 'evening' | 'night'
  totalOrders: "number", // Total orders processed
  completedOrders: "number", // Orders completed on time
  delayedOrders: "number", // Orders delayed
  averagePrepTime: "number", // Average preparation time in minutes
  targetPrepTime: "number", // Target preparation time
  prepTimeVariance: "number", // Variance from target (+/- minutes)
  orderAccuracy: "number", // Order accuracy percentage
  foodWastage: "number", // Food wastage amount/cost
  customerComplaints: "number", // Number of customer complaints
  staffCount: "number", // Number of staff on duty
  peakHourOrders: "number", // Orders during peak hour
  slowHourOrders: "number", // Orders during slow hour
  equipmentDowntime: "number", // Equipment downtime in minutes
  temperatureViolations: "number", // Food safety temperature violations
  qualityScore: "number", // Overall quality score (1-10)
  efficiencyScore: "number", // Operational efficiency score (1-10)
  costPerOrder: "number", // Average cost per order
  revenuePerOrder: "number", // Average revenue per order
  profitMargin: "number", // Profit margin percentage
  topPerformingItems: "string[]", // Top 5 performing menu items
  underPerformingItems: "string[]", // Underperforming items
  bottlenecks: "string[]", // Identified operational bottlenecks
  improvementSuggestions: "string[]", // AI/ML suggested improvements
  createdAt: "Date",
  updatedAt: "Date"
};

// 🏛️ PLATFORM ADMINISTRATION
// ============================================
// Platform management, compliance, and system administration
export const BroadcastMessageRecipientsTable = {
  id: "string", // Primary key
  broadcastId: "string", // Foreign key to Broadcast Messages table
  recipientId: "string", // Foreign key to Users table (recipient)
  recipientType: "string", // 'user' | 'restaurant' | 'customer' | 'staff'
  deliveryStatus: "string", // 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sentAt: "Date", // When message was sent
  deliveredAt: "Date", // When message was delivered
  readAt: "Date", // When message was read/opened
  clickedAt: "Date", // When CTA was clicked (if applicable)
  deviceInfo: "object", // Device/browser information
  ipAddress: "string", // Recipient IP address
  userAgent: "string", // Browser user agent
  location: "object", // Geographic location data
  unsubscribeStatus: "boolean", // Whether user unsubscribed
  complaintStatus: "boolean", // Whether marked as spam/complaint
  engagementScore: "number", // Engagement score (0-100)
  errorMessage: "string", // Delivery error message
  retryCount: "number", // Number of delivery retries
  createdAt: "Date",
  updatedAt: "Date"
};

// 59. Subscription History Table (Subscription lifecycle tracking)
export const SubscriptionHistoryTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  previousPlanId: "string", // Previous subscription plan
  newPlanId: "string", // New subscription plan
  changeType: "string", // 'upgrade' | 'downgrade' | 'renewal' | 'cancellation' | 'reactivation'
  effectiveDate: "Date", // When change takes effect
  previousPrice: "number", // Previous plan price
  newPrice: "number", // New plan price
  priceDifference: "number", // Price change amount
  billingCycleChange: "boolean", // Whether billing cycle changed
  proratedAmount: "number", // Prorated amount for mid-cycle changes
  initiatedBy: "string", // User who initiated the change
  reason: "string", // Reason for change
  notes: "string", // Additional notes
  paymentStatus: "string", // 'pending' | 'completed' | 'failed' | 'refunded'
  paymentId: "string", // Associated payment transaction
  cancellationReason: "string", // If cancelled, reason provided
  churnRiskScore: "number", // Churn risk score at time of change
  retentionActions: "string[]", // Retention actions taken
  createdAt: "Date"
};

// 60. Integration Configurations Table (Third-party integration settings)
export const IntegrationConfigurationsTable = {
  id: "string", // Primary key
  integrationType: "string", // 'payment_gateway' | 'delivery_service' | 'pos_system' | 'analytics' | 'communication'
  provider: "string", // Provider name (Stripe, Razorpay, Zomato, etc.)
  providerId: "string", // Provider's unique identifier
  configurationName: "string", // User-friendly name for this configuration
  apiKey: "string", // Encrypted API key
  apiSecret: "string", // Encrypted API secret
  webhookUrl: "string", // Webhook endpoint URL
  webhookSecret: "string", // Webhook verification secret
  additionalConfig: "object", // Additional provider-specific configuration
  isActive: "boolean", // Whether integration is active
  testMode: "boolean", // Whether in test/sandbox mode
  rateLimits: "object", // API rate limiting configuration
  retryConfig: "object", // Retry logic configuration
  errorHandling: "object", // Error handling configuration
  lastSyncAt: "Date", // Last successful sync timestamp
  syncStatus: "string", // 'success' | 'failed' | 'in_progress' | 'disabled'
  syncErrorMessage: "string", // Last sync error message
  dataMapping: "object", // Field mapping configuration
  restaurantId: "string", // Foreign key to Restaurants table (null for platform-wide)
  configuredBy: "string", // User who configured the integration
  configuredAt: "Date", // When integration was configured
  lastModifiedBy: "string", // User who last modified
  lastModifiedAt: "Date",
  createdAt: "Date",
  updatedAt: "Date"
};

// 61. Notification Templates Table (Reusable notification templates)
export const NotificationTemplatesTable = {
  id: "string", // Primary key
  templateName: "string", // Template identifier/name
  displayName: "string", // User-friendly display name
  category: "string", // 'order' | 'payment' | 'system' | 'marketing' | 'security'
  type: "string", // 'email' | 'sms' | 'push' | 'in_app'
  subject: "string", // Email subject or SMS/push title
  content: "string", // Template content with placeholders
  variables: "string[]", // Available template variables
  language: "string", // Template language (en, hi, etc.)
  isActive: "boolean", // Whether template is active
  isDefault: "boolean", // Whether this is default template for category/type
  priority: "string", // 'low' | 'medium' | 'high' | 'critical'
  sender: "string", // Default sender information
  replyTo: "string", // Reply-to email address
  attachments: "string[]", // Default attachments
  personalization: "boolean", // Whether template supports personalization
  abTestEnabled: "boolean", // Whether A/B testing is enabled
  abTestVariants: "object[]", // A/B test variants
  usageCount: "number", // Number of times template was used
  successRate: "number", // Delivery success rate
  averageResponseTime: "number", // Average user response time
  createdBy: "string", // User who created template
  approvedBy: "string", // User who approved template
  approvedAt: "Date", // When template was approved
  lastUsedAt: "Date", // Last time template was used
  createdAt: "Date",
  updatedAt: "Date"
};

// 62. System Maintenance Logs Table (Maintenance and update tracking)
export const SystemMaintenanceLogsTable = {
  id: "string", // Primary key
  maintenanceType: "string", // 'scheduled' | 'emergency' | 'update' | 'backup' | 'security_patch'
  title: "string", // Maintenance title
  description: "string", // Detailed description
  plannedStartTime: "Date", // Planned maintenance start
  actualStartTime: "Date", // Actual maintenance start
  plannedEndTime: "Date", // Planned maintenance end
  actualEndTime: "Date", // Actual maintenance end
  duration: "number", // Actual duration in minutes
  status: "string", // 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
  impactLevel: "string", // 'none' | 'low' | 'medium' | 'high' | 'critical'
  affectedServices: "string[]", // Services affected by maintenance
  affectedUsers: "number", // Estimated number of affected users
  communicationSent: "boolean", // Whether users were notified
  communicationMethod: "string[]", // Communication methods used
  rollbackPlan: "string", // Rollback procedure if needed
  rollbackExecuted: "boolean", // Whether rollback was executed
  initiatedBy: "string", // User who initiated maintenance
  approvedBy: "string", // User who approved maintenance
  teamMembers: "string[]", // Team members involved
  changeLog: "string[]", // Detailed change log
  preChecks: "string[]", // Pre-maintenance checks performed
  postChecks: "string[]", // Post-maintenance verification
  issuesEncountered: "string[]", // Issues encountered during maintenance
  lessonsLearned: "string", // Lessons learned and improvements
  downtimeMinutes: "number", // Total system downtime in minutes
  userImpactScore: "number", // User impact assessment (1-10)
  successRating: "number", // Maintenance success rating (1-10)
  nextMaintenanceDate: "Date", // Suggested next maintenance date
  createdAt: "Date",
  updatedAt: "Date"
};

// 🏪 RESTAURANT OPERATIONS
// ============================================
// Restaurant-specific operations and management
export const MenuCategoriesTable = {
  id: "string", // Primary key
  name: "string", // Category display name
  key: "string", // Category unique key/slug
  description: "string", // Category description
  icon: "string", // FontAwesome icon class
  color: "string", // Category color theme
  displayOrder: "number", // Display order in menu
  isActive: "boolean", // Whether category is active
  isDefault: "boolean", // Whether this is a default category
  parentCategoryId: "string", // For sub-categories (optional)
  restaurantId: "string", // Foreign key to Restaurants table
  itemCount: "number", // Number of items in this category
  totalValue: "number", // Total value of items in category
  popularityScore: "number", // Category popularity score
  lastOrdered: "Date", // Last time an item from this category was ordered
  createdBy: "string", // User who created the category
  createdAt: "Date",
  updatedAt: "Date"
};

// 64. Payment Gateways Table (Payment gateway configurations)
export const PaymentGatewaysTable = {
  id: "string", // Primary key
  name: "string", // Gateway name (Razorpay, Stripe, etc.)
  provider: "string", // Provider identifier
  description: "string", // Gateway description
  icon: "string", // Gateway icon/logo URL
  apiKey: "string", // Encrypted API key
  apiSecret: "string", // Encrypted API secret
  webhookUrl: "string", // Webhook endpoint URL
  webhookSecret: "string", // Webhook verification secret
  isActive: "boolean", // Whether gateway is active
  isTestMode: "boolean", // Whether in test/sandbox mode
  supportedCurrencies: "string[]", // Supported currencies
  supportedMethods: "string[]", // Supported payment methods
  transactionFee: "number", // Transaction fee percentage
  fixedFee: "number", // Fixed fee amount
  settlementDays: "number", // Days for settlement
  minAmount: "number", // Minimum transaction amount
  maxAmount: "number", // Maximum transaction amount
  dailyLimit: "number", // Daily transaction limit
  monthlyLimit: "number", // Monthly transaction limit
  successRate: "number", // Success rate percentage
  averageProcessingTime: "number", // Average processing time in seconds
  lastTested: "Date", // Last connectivity test timestamp
  testResult: "string", // Last test result
  restaurantId: "string", // Foreign key to Restaurants table (null for platform-wide)
  configuredBy: "string", // User who configured the gateway
  configuredAt: "Date",
  updatedAt: "Date"
};

// 65. Staff Attendance Table (Staff attendance and time tracking)
export const StaffAttendanceTable = {
  id: "string", // Primary key
  staffId: "string", // Foreign key to Staff Members table
  restaurantId: "string", // Foreign key to Restaurants table
  date: "Date", // Attendance date
  shiftId: "string", // Foreign key to Shift Schedules table
  scheduledStartTime: "string", // Scheduled start time
  scheduledEndTime: "string", // Scheduled end time
  actualStartTime: "Date", // Actual clock-in time
  actualEndTime: "Date", // Actual clock-out time
  breakStartTime: "Date", // Break start time
  breakEndTime: "Date", // Break end time
  totalBreakMinutes: "number", // Total break time in minutes
  workedMinutes: "number", // Total worked minutes
  overtimeMinutes: "number", // Overtime minutes
  status: "string", // 'present' | 'absent' | 'late' | 'early_departure' | 'on_break'
  clockInMethod: "string", // 'manual' | 'biometric' | 'app' | 'system'
  clockOutMethod: "string", // 'manual' | 'biometric' | 'app' | 'system'
  location: "object", // GPS location data
  ipAddress: "string", // IP address used for clocking
  deviceInfo: "string", // Device information
  notes: "string", // Attendance notes
  approvedBy: "string", // Supervisor who approved
  approvedAt: "Date", // When approved
  editedBy: "string", // Who edited the attendance
  editedAt: "Date", // When edited
  editReason: "string", // Reason for edit
  createdAt: "Date",
  updatedAt: "Date"
};

// 66. Offer Redemptions Table (Individual offer usage tracking)
export const OfferRedemptionsTable = {
  id: "string", // Primary key
  offerId: "string", // Foreign key to Offers table
  orderId: "string", // Foreign key to Orders table
  customerId: "string", // Foreign key to Customers table
  restaurantId: "string", // Foreign key to Restaurants table
  redemptionCode: "string", // Unique redemption code
  discountAmount: "number", // Actual discount amount applied
  originalAmount: "number", // Original order amount before discount
  finalAmount: "number", // Final order amount after discount
  redemptionMethod: "string", // 'automatic' | 'manual' | 'code' | 'loyalty'
  appliedBy: "string", // Staff member who applied the offer
  appliedAt: "Date", // When offer was applied
  orderItems: "string[]", // Order item IDs that qualified for offer
  conditionsMet: "object", // Conditions that were met for redemption
  usageCount: "number", // How many times this offer was used by customer
  customerLifetimeValue: "number", // Customer's lifetime value at redemption
  isFirstTime: "boolean", // Whether this is customer's first redemption
  deviceType: "string", // Device type used for redemption
  platform: "string", // Platform used (web, mobile, kiosk)
  location: "object", // Geographic location of redemption
  notes: "string", // Additional notes
  createdAt: "Date"
};

// 67. Loyalty Transactions Table (Loyalty point transaction history)
export const LoyaltyTransactionsTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  restaurantId: "string", // Foreign key to Restaurants table
  transactionType: "string", // 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'transferred'
  points: "number", // Points earned/redeemed (positive for earned, negative for redeemed)
  balanceBefore: "number", // Balance before transaction
  balanceAfter: "number", // Balance after transaction
  orderId: "string", // Foreign key to Orders table (if earned from order)
  offerId: "string", // Foreign key to Offers table (if redeemed for offer)
  description: "string", // Transaction description
  reference: "string", // Reference number/code
  expiryDate: "Date", // When these points expire
  earnedFrom: "string", // Source of earning (order, referral, bonus, etc.)
  redeemedFor: "string", // What points were redeemed for
  processedBy: "string", // Staff member who processed transaction
  processedAt: "Date", // When transaction was processed
  approvalRequired: "boolean", // Whether approval was required
  approvedBy: "string", // Who approved the transaction
  approvedAt: "Date", // When approved
  reversalTransactionId: "string", // If this transaction was reversed
  isReversal: "boolean", // Whether this is a reversal transaction
  notes: "string", // Additional notes
  createdAt: "Date"
};

// 68. Restaurant Analytics Table (Restaurant performance data)
export const RestaurantAnalyticsTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  date: "Date", // Analytics date
  period: "string", // 'daily' | 'weekly' | 'monthly' | 'yearly'
  totalOrders: "number", // Total orders for the period
  totalRevenue: "number", // Total revenue for the period
  averageOrderValue: "number", // Average order value
  peakHour: "string", // Peak ordering hour
  peakDay: "string", // Peak ordering day
  topMenuItems: "object[]", // Top performing menu items
  topCategories: "object[]", // Top performing categories
  customerCount: "number", // Unique customers served
  repeatCustomers: "number", // Repeat customer count
  newCustomers: "number", // New customer count
  customerRetentionRate: "number", // Customer retention percentage
  tableTurnoverRate: "number", // Table turnover rate
  averageServiceTime: "number", // Average service time in minutes
  orderAccuracy: "number", // Order accuracy percentage
  customerSatisfaction: "number", // Average customer satisfaction (1-5)
  onlineOrders: "number", // Online orders count
  dineInOrders: "number", // Dine-in orders count
  takeawayOrders: "number", // Takeaway orders count
  deliveryOrders: "number", // Delivery orders count
  paymentMethodBreakdown: "object", // Payment method usage breakdown
  discountUsage: "number", // Total discount amount used
  loyaltyPointsEarned: "number", // Loyalty points earned
  loyaltyPointsRedeemed: "number", // Loyalty points redeemed
  staffEfficiency: "number", // Staff efficiency score
  inventoryTurnover: "number", // Inventory turnover rate
  foodCostPercentage: "number", // Food cost as percentage of revenue
  laborCostPercentage: "number", // Labor cost as percentage of revenue
  profitMargin: "number", // Profit margin percentage
  createdAt: "Date",
  updatedAt: "Date"
};

// 69. Menu Item Analytics Table (Menu item performance metrics)
export const MenuItemAnalyticsTable = {
  id: "string", // Primary key
  menuItemId: "string", // Foreign key to Menu Items table
  restaurantId: "string", // Foreign key to Restaurants table
  date: "Date", // Analytics date
  period: "string", // 'daily' | 'weekly' | 'monthly'
  orderCount: "number", // How many times item was ordered
  quantitySold: "number", // Total quantity sold
  revenue: "number", // Total revenue from this item
  averagePrice: "number", // Average selling price
  discountApplied: "number", // Total discount amount applied
  popularityRank: "number", // Popularity rank among all items
  categoryRank: "number", // Rank within category
  preparationTime: "number", // Average preparation time
  customerRating: "number", // Average customer rating (1-5)
  reorderRate: "number", // Percentage of orders that include this item
  addOnRevenue: "number", // Revenue from add-ons/customizations
  wastageAmount: "number", // Amount of wastage
  costOfGoodsSold: "number", // Cost of goods sold
  grossMargin: "number", // Gross margin percentage
  peakOrderingHour: "string", // Peak ordering hour
  peakOrderingDay: "string", // Peak ordering day
  customerDemographics: "object", // Customer demographic data
  seasonalTrends: "object", // Seasonal ordering patterns
  competitorPrice: "number", // Competitor pricing reference
  priceElasticity: "number", // Price elasticity coefficient
  demandForecast: "number", // Next period demand forecast
  stockoutIncidents: "number", // Number of stockout incidents
  createdAt: "Date",
  updatedAt: "Date"
};

// 70. Restaurant Notifications Table (Restaurant notification management)
export const RestaurantNotificationsTable = {
  id: "string", // Primary key
  restaurantId: "string", // Foreign key to Restaurants table
  title: "string", // Notification title
  message: "string", // Notification message
  type: "string", // 'order' | 'payment' | 'inventory' | 'staff' | 'system' | 'promotion'
  priority: "string", // 'low' | 'medium' | 'high' | 'critical'
  status: "string", // 'unread' | 'read' | 'archived'
  recipientRole: "string", // Target role (owner, manager, staff, all)
  recipientId: "string", // Specific recipient ID (optional)
  relatedOrderId: "string", // Related order ID if applicable
  relatedItemId: "string", // Related menu item ID if applicable
  relatedStaffId: "string", // Related staff member ID if applicable
  actionRequired: "boolean", // Whether action is required
  actionType: "string", // Type of action required
  actionUrl: "string", // URL for action
  expiryDate: "Date", // When notification expires
  sentVia: "string[]", // Delivery methods (app, email, sms)
  readAt: "Date", // When notification was read
  readBy: "string", // Who read the notification
  acknowledgedAt: "Date", // When notification was acknowledged
  acknowledgedBy: "string", // Who acknowledged the notification
  followUpRequired: "boolean", // Whether follow-up is required
  followUpDate: "Date", // Follow-up date
  metadata: "object", // Additional notification data
  createdBy: "string", // System/user who created notification
  createdAt: "Date",
  updatedAt: "Date"
};

// ============================================
// SHARED UI COMPONENTS & USER EXPERIENCE
// ============================================

// 71. User Notification Settings Table (Individual user notification preferences)
export const UserNotificationSettingsTable = {
  id: "string", // Primary key
  userId: "string", // Foreign key to Users table
  settingName: "string", // Setting identifier (e.g., 'Order Updates', 'System Alerts')
  settingKey: "string", // Unique key for the setting
  description: "string", // Human-readable description
  category: "string", // 'orders' | 'system' | 'staff' | 'inventory' | 'payment' | 'promotion'
  enabled: "boolean", // Whether this notification type is enabled
  emailEnabled: "boolean", // Whether email notifications are enabled
  smsEnabled: "boolean", // Whether SMS notifications are enabled
  pushEnabled: "boolean", // Whether push notifications are enabled
  inAppEnabled: "boolean", // Whether in-app notifications are enabled
  frequency: "string", // 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never'
  quietHoursStart: "string", // Start time for quiet hours (HH:MM format)
  quietHoursEnd: "string", // End time for quiet hours (HH:MM format)
  priorityThreshold: "string", // Minimum priority level ('low' | 'medium' | 'high' | 'critical')
  customFilters: "object", // Custom filtering rules
  lastModified: "Date", // When settings were last changed
  createdAt: "Date",
  updatedAt: "Date"
};

// ============================================
// WAITER OPERATIONS & SERVICE MANAGEMENT
// ============================================

// 72. Table Status History Table (Table status change tracking)
export const TableStatusHistoryTable = {
  id: "string", // Primary key
  tableId: "string", // Foreign key to Tables table
  restaurantId: "string", // Foreign key to Restaurants table
  previousStatus: "string", // Previous table status ('available' | 'occupied' | 'reserved' | 'needs_cleaning')
  newStatus: "string", // New table status
  changedBy: "string", // User who changed the status (waiter/manager)
  changeReason: "string", // Reason for status change ('order_placed' | 'order_completed' | 'reservation' | 'cleaning_complete')
  orderId: "string", // Related order ID if applicable
  customerCount: "number", // Number of customers at table
  duration: "number", // Duration in previous status (minutes)
  notes: "string", // Additional notes
  timestamp: "Date", // When status changed
  createdAt: "Date"
};

// 73. Waiter Activity Logs Table (Waiter action tracking)
export const WaiterActivityLogsTable = {
  id: "string", // Primary key
  waiterId: "string", // Foreign key to Staff Members table
  restaurantId: "string", // Foreign key to Restaurants table
  activityType: "string", // 'table_assigned' | 'order_taken' | 'order_delivered' | 'bill_requested' | 'help_called' | 'table_cleaned'
  tableId: "string", // Foreign key to Tables table
  orderId: "string", // Foreign key to Orders table
  customerId: "string", // Foreign key to Customers table
  description: "string", // Human-readable activity description
  duration: "number", // Activity duration in minutes (if applicable)
  success: "boolean", // Whether activity was completed successfully
  notes: "string", // Additional notes or issues encountered
  location: "object", // GPS coordinates if mobile device
  deviceInfo: "string", // Device/app information
  timestamp: "Date", // When activity occurred
  createdAt: "Date"
};

// 74. Table Reservations Table (Table reservation management)
export const TableReservationsTable = {
  id: "string", // Primary key
  tableId: "string", // Foreign key to Tables table
  restaurantId: "string", // Foreign key to Restaurants table
  customerId: "string", // Foreign key to Customers table
  customerName: "string", // Customer name for walk-ins
  customerPhone: "string", // Customer phone number
  customerEmail: "string", // Customer email
  partySize: "number", // Number of guests
  reservationDate: "Date", // Date of reservation
  reservationTime: "string", // Time slot (HH:MM format)
  duration: "number", // Expected duration in minutes
  specialRequests: "string", // Special requests or notes
  status: "string", // 'confirmed' | 'pending' | 'cancelled' | 'no_show' | 'completed'
  createdBy: "string", // User who created the reservation
  confirmedBy: "string", // User who confirmed the reservation
  cancelledBy: "string", // User who cancelled (if applicable)
  cancellationReason: "string", // Reason for cancellation
  checkInTime: "Date", // Actual check-in time
  checkOutTime: "Date", // Actual check-out time
  assignedWaiter: "string", // Assigned waiter ID
  totalSpent: "number", // Total amount spent during visit
  rating: "number", // Customer satisfaction rating (1-5)
  feedback: "string", // Customer feedback
  reminderSent: "boolean", // Whether reminder was sent
  reminderTime: "Date", // When reminder was sent
  createdAt: "Date",
  updatedAt: "Date"
};

// 75. Order Modifications Table (Order change tracking)
export const OrderModificationsTable = {
  id: "string", // Primary key
  orderId: "string", // Foreign key to Orders table
  originalOrderId: "string", // Original order ID before modification
  modificationType: "string", // 'item_added' | 'item_removed' | 'quantity_changed' | 'item_modified' | 'discount_applied' | 'discount_removed'
  modifiedBy: "string", // User who made the modification (waiter/kitchen/manager)
  itemId: "string", // Menu item ID that was modified
  previousValue: "object", // Previous value (quantity, price, etc.)
  newValue: "object", // New value after modification
  reason: "string", // Reason for modification ('customer_request' | 'availability' | 'pricing_error' | 'loyalty_discount')
  priceImpact: "number", // Price change amount (positive or negative)
  approvedBy: "string", // Manager approval if required
  approvalTime: "Date", // When modification was approved
  customerNotified: "boolean", // Whether customer was informed
  notificationMethod: "string", // How customer was notified
  notes: "string", // Additional notes
  timestamp: "Date", // When modification occurred
  createdAt: "Date"
};

// 76. Customer Table Assignments Table (Customer-table relationship tracking)
export const CustomerTableAssignmentsTable = {
  id: "string", // Primary key
  customerId: "string", // Foreign key to Customers table
  tableId: "string", // Foreign key to Tables table
  restaurantId: "string", // Foreign key to Restaurants table
  orderId: "string", // Foreign key to Orders table
  assignmentType: "string", // 'dine_in' | 'reservation' | 'walk_in' | 'waiting_list'
  startTime: "Date", // When customer was seated
  endTime: "Date", // When customer left (order completed)
  duration: "number", // Total duration in minutes
  partySize: "number", // Number of people in party
  waiterId: "string", // Assigned waiter
  status: "string", // 'active' | 'completed' | 'transferred' | 'cancelled'
  totalSpent: "number", // Total amount spent
  averageSpendPerPerson: "number", // Average spend per person
  satisfactionRating: "number", // Customer satisfaction (1-5)
  revisitLikelihood: "number", // Likelihood of returning (1-5)
  specialRequests: "string", // Any special requests or accommodations
  accessibilityNeeds: "string", // Accessibility requirements
  dietaryRestrictions: "string[]", // Customer dietary restrictions
  preferredLanguage: "string", // Preferred communication language
  vipStatus: "boolean", // Whether customer is VIP
  loyaltyPointsEarned: "number", // Points earned during visit
  feedbackProvided: "boolean", // Whether feedback was collected
  nextVisitScheduled: "Date", // Scheduled next visit
  createdAt: "Date",
  updatedAt: "Date"
};

// ----------------------------------- Supporting Tables --------------------------------

// api_key_ip_whitelist
export const ApiKeyIpWhitelistTable = {
  keyId: "bigint", // Foreign key to api_keys.id
  ipAddress: "string" // IP address allowed for API access
};

// api_key_permissions
export const ApiKeyPermissionsTable = {
  keyId: "bigint", // Foreign key to api_keys.id
  permission: "string" // Permission string granted to API key
};

// customer_favorite_items
export const CustomerFavoriteItemsTable = {
  customerId: "bigint", // Foreign key to customers.id
  itemId: "string" // Menu item ID marked as favorite
};

// menu_item_allergens
export const MenuItemAllergensTable = {
  menuItemId: "bigint", // Foreign key to menu_items.id
  allergen: "string" // Allergen name (nuts, dairy, etc.)
};

// supplier_categories
export const SupplierCategoriesTable = {
  supplierId: "bigint", // Foreign key to supplier_information.id
  category: "string" // Category supplied by this supplier
};

// tfa_backup_codes
export const TfaBackupCodesTable = {
  tfaId: "bigint", // Foreign key to two_factor_authentication.id
  backupCode: "string" // Encrypted backup recovery code
};

// user_role_permissions
export const UserRolePermissionsTable = {
  roleId: "bigint", // Foreign key to user_roles.id
  permission: "string" // Permission granted to this role
};

// offer_applicable_categories
export const OfferApplicableCategoriesTable = {
  offerId: "bigint", // Foreign key to offers.id
  category: "string" // Menu category where offer applies
};

// offer_applicable_customers
export const OfferApplicableCustomersTable = {
  offerId: "bigint", // Foreign key to offers.id
  customerId: "bigint" // Foreign key to customers.id
};

// offer_applicable_items
export const OfferApplicableItemsTable = {
  offerId: "bigint", // Foreign key to offers.id
  itemId: "string" // Menu item ID where offer applies
};

// payment_gateway_currencies
export const PaymentGatewayCurrenciesTable = {
  gatewayId: "bigint", // Foreign key to payment_gateways.id
  currency: "string" // Currency code supported (INR, USD, etc.)
};

// payment_gateway_methods
export const PaymentGatewayMethodsTable = {
  gatewayId: "bigint", // Foreign key to payment_gateways.id
  method: "string" // Payment method supported (card, upi, wallet, etc.)
};

// shift_report_incidents
export const ShiftReportIncidentsTable = {
  reportId: "bigint", // Foreign key to shift_reports.id
  incident: "string" // Description of incident during shift
};

// shopping_cart_items_customizations
export const ShoppingCartItemsCustomizationsTable = {
  shoppingCartItemId: "bigint", // Foreign key to shopping_cart_items.id
  customizationsId: "bigint" // Foreign key to order_customizations.id
};

// menu_customizations
// export const MenuCustomizationsTable = {
//   id: "bigint",
//   menuItemId: "bigint", // Foreign key to menu_items.id
//   name: "string",
//   type: "string",
//   required: "boolean",
//   maxSelections: "integer",
//   minSelections: "integer",
//   displayOrder: "integer",
//   isActive: "boolean",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// navigation_menu
export const NavigationMenuTable = {
  id: "bigint",
  menuId: "string",
  name: "string",
  parentId: "string",
  role: "string",
  path: "string",
  icon: "string",
  displayOrder: "integer",
  type: "string",
  isActive: "boolean",
  createdAt: "Date",
  updatedAt: "Date"
};

// notification
export const NotificationTable = {
  id: "bigint",
  title: "string",
  message: "string",
  type: "string",
  priority: "string",
  status: "string",
  recipientId: "bigint",
  recipientRole: "string",
  icon: "string",
  actionUrl: "string",
  actionText: "string",
  relatedOrderId: "bigint",
  relatedEntityId: "bigint",
  relatedEntityType: "string",
  expiresAt: "Date",
  sentAt: "Date",
  readAt: "Date",
  restaurantId: "bigint",
  createdAt: "Date"
};

// broadcast_messages
// export const BroadcastMessagesTable = {
//   id: "bigint",
//   title: "string",
//   message: "string",
//   type: "string",
//   priority: "string",
//   targetAudience: "string",
//   targetRestaurantIds: "string[]",
//   targetUserIds: "string[]",
//   startDate: "Date",
//   endDate: "Date",
//   isActive: "boolean",
//   showOnLogin: "boolean",
//   showOnDashboard: "boolean",
//   dismissible: "boolean",
//   dismissedBy: "string[]",
//   sentBy: "bigint",
//   sentAt: "Date",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// // broadcast_message_recipients
// export const BroadcastMessageRecipientsTable = {
//   id: "bigint",
//   broadcastId: "bigint", // Foreign key to broadcast_messages.id
//   recipientId: "bigint",
//   recipientType: "string",
//   deliveryStatus: "string",
//   sentAt: "Date",
//   deliveredAt: "Date",
//   readAt: "Date",
//   clickedAt: "Date",
//   deviceInfo: "object",
//   ipAddress: "string",
//   userAgent: "string",
//   location: "object",
//   unsubscribeStatus: "boolean",
//   complaintStatus: "boolean",
//   engagementScore: "number",
//   errorMessage: "string",
//   retryCount: "integer",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// // integration_configurations
// export const IntegrationConfigurationsTable = {
//   id: "bigint",
//   integrationType: "string",
//   provider: "string",
//   providerId: "string",
//   configurationName: "string",
//   apiKey: "string",
//   apiSecret: "string",
//   webhookUrl: "string",
//   webhookSecret: "string",
//   additionalConfig: "object",
//   isActive: "boolean",
//   testMode: "boolean",
//   rateLimits: "object",
//   retryConfig: "object",
//   errorHandling: "object",
//   lastSyncAt: "Date",
//   syncStatus: "string",
//   syncErrorMessage: "string",
//   dataMapping: "object",
//   restaurantId: "bigint",
//   configuredBy: "bigint",
//   configuredAt: "Date",
//   lastModifiedBy: "bigint",
//   lastModifiedAt: "Date",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// notification_templates
// export const NotificationTemplatesTable = {
//   id: "bigint",
//   templateName: "string",
//   displayName: "string",
//   category: "string",
//   type: "string",
//   subject: "string",
//   content: "string",
//   variables: "string[]",
//   language: "string",
//   isActive: "boolean",
//   isDefault: "boolean",
//   priority: "string",
//   sender: "string",
//   replyTo: "string",
//   attachments: "string[]",
//   personalization: "boolean",
//   abTestEnabled: "boolean",
//   abTestVariants: "object[]",
//   usageCount: "integer",
//   successRate: "number",
//   averageResponseTime: "number",
//   createdBy: "bigint",
//   approvedBy: "bigint",
//   approvedAt: "Date",
//   lastUsedAt: "Date",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// // system_maintenance_logs
// export const SystemMaintenanceLogsTable = {
//   id: "bigint",
//   maintenanceType: "string",
//   title: "string",
//   description: "string",
//   plannedStartTime: "Date",
//   actualStartTime: "Date",
//   plannedEndTime: "Date",
//   actualEndTime: "Date",
//   duration: "integer",
//   status: "string",
//   impactLevel: "string",
//   affectedServices: "string[]",
//   affectedUsers: "integer",
//   communicationSent: "boolean",
//   communicationMethod: "string[]",
//   rollbackPlan: "string",
//   rollbackExecuted: "boolean",
//   initiatedBy: "bigint",
//   approvedBy: "bigint",
//   teamMembers: "string[]",
//   changeLog: "string[]",
//   preChecks: "string[]",
//   postChecks: "string[]",
//   issuesEncountered: "string[]",
//   lessonsLearned: "string[]",
//   downtimeMinutes: "integer",
//   userImpactScore: "integer",
//   successRating: "integer",
//   nextMaintenanceDate: "Date",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// // subscription_history
// export const SubscriptionHistoryTable = {
//   id: "bigint",
//   restaurantId: "bigint", // Foreign key to restaurants.id
//   previousPlanId: "bigint",
//   newPlanId: "bigint",
//   changeType: "string",
//   effectiveDate: "Date",
//   previousPrice: "number",
//   newPrice: "number",
//   priceDifference: "number",
//   billingCycleChange: "boolean",
//   proratedAmount: "number",
//   initiatedBy: "bigint",
//   reason: "string",
//   notes: "string",
//   paymentStatus: "string",
//   paymentId: "string",
//   cancellationReason: "string",
//   churnRiskScore: "integer",
//   retentionActions: "string[]",
//   createdAt: "Date"
// };

// table_status_history
// export const TableStatusHistoryTable = {
//   id: "bigint",
//   tableId: "bigint", // Foreign key to tables.id
//   restaurantId: "bigint", // Foreign key to restaurants.id
//   previousStatus: "string",
//   newStatus: "string",
//   changedBy: "bigint", // Foreign key to users.id
//   changeReason: "string",
//   customerCount: "integer",
//   duration: "integer",
//   notes: "string",
//   timestamp: "Date",
//   createdAt: "Date"
// };

// // user_notification_settings
// export const UserNotificationSettingsTable = {
//   id: "bigint",
//   userId: "bigint", // Foreign key to users.id
//   settingName: "string",
//   settingKey: "string",
//   description: "string",
//   category: "string",
//   enabled: "boolean",
//   emailEnabled: "boolean",
//   smsEnabled: "boolean",
//   pushEnabled: "boolean",
//   inAppEnabled: "boolean",
//   frequency: "string",
//   quietHoursStart: "string",
//   quietHoursEnd: "string",
//   priorityThreshold: "string",
//   customFilters: "object",
//   lastModified: "Date",
//   createdAt: "Date",
//   updatedAt: "Date"
// };

// // user_sessions
// export const UserSessionsTable = {
//   id: "bigint",
//   userId: "bigint", // Foreign key to users.id
//   sessionToken: "string",
//   refreshToken: "string",
//   deviceInfo: "object",
//   ipAddress: "string",
//   userAgent: "string",
//   location: "object",
//   isActive: "boolean",
//   expiresAt: "Date",
//   lastActivity: "Date",
//   createdAt: "Date"
// };

// // login_attempts
// export const LoginAttemptsTable = {
//   id: "bigint",
//   username: "string",
//   ipAddress: "string",
//   userAgent: "string",
//   attemptTime: "Date",
//   success: "boolean",
//   failureReason: "string",
//   location: "object",
//   deviceFingerprint: "string",
//   blocked: "boolean",
//   createdAt: "Date"
// };

// ----------------------------------- Supporting Tables --------------------------------


// ===============================
// DATABASE TABLES OVERVIEW
// ===============================

// Main Tables Name List (77)

// UsersTable
// UserRolesTable
// NavigationMenusTable
// MenuAccessPermissionsTable
// RestaurantsTable
// GeneralSystemConfigurationsTable
// PaymentGatewayConfigurationsTable
// EmailServiceConfigurationsTable
// BusinessRulesConfigurationsTable
// NotificationConfigurationsTable
// SecurityConfigurationsTable
// CustomersTable
// CustomerAddressesTable
// CustomerPreferencesTable
// LoyaltyProgramsTable
// MenuItemsTable
// MenuCustomizationsTable
// RecipesTable
// RecipeIngredientsTable
// OrdersTable
// OrderItemsTable
// OrderCustomizationsTable
// InventoryItemsTable
// SupplierInformationTable
// StockAdjustmentsTable
// TransactionsTable
// PaymentMethodsTable
// OffersTable
// ShiftSchedulesTable
// ShiftReportsTable
// RestaurantSettingsTable
// NotificationsTable
// BroadcastMessagesTable
// AnalyticsDataTable
// AuditLogsTable
// SubscriptionPlansTable
// PlanFeaturesTable
// RestaurantSubscriptionsTable
// SubscriptionUsageTable
// SubscriptionInvoicesTable
// FeatureAccessControlTable
// UserSessionsTable
// LoginAttemptsTable
// PasswordResetTokensTable
// AccountLockoutsTable
// TwoFactorAuthenticationTable
// ApiKeysTable
// CashDrawerOperationsTable
// CashTransactionsTable
// ReceiptLogsTable
// CashierSessionsTable
// ShoppingCartTable
// CustomerPaymentMethodsTable
// PointsTransactionsTable
// ReferralProgramTable
// KitchenStaffTable
// KitchenDisplaySessionsTable
// RecipeUsageLogsTable
// InventoryAlertsTable
// KitchenPerformanceMetricsTable
// BroadcastMessageRecipientsTable
// SubscriptionHistoryTable
// IntegrationConfigurationsTable
// NotificationTemplatesTable
// SystemMaintenanceLogsTable
// MenuCategoriesTable
// PaymentGatewaysTable
// StaffAttendanceTable
// OfferRedemptionsTable
// LoyaltyTransactionsTable
// RestaurantAnalyticsTable
// MenuItemAnalyticsTable
// RestaurantNotificationsTable
// UserNotificationSettingsTable
// TableStatusHistoryTable
// CustomerTableAssignmentsTable
// EmailServiceConfigurations

// Supporting Table Auto Created by Hypernate (27)

// api_key_ip_whitelist
// api_key_permissions
// customer_favorite_items
// menu_item_allergens
// supplier_categories
// tfa_backup_codes
// user_role_permissions
// offer_applicable_categories
// offer_applicable_customers
// offer_applicable_items
// payment_gateway_currencies
// payment_gateway_methods
// shift_report_incidents
// shopping_cart_items_customizations
// menu_customizations
// navigation_menu
// notification
// broadcast_messages
// broadcast_message_recipients
// integration_configurations
// notification_templates
// system_maintenance_logs
// subscription_history
// table_status_history
// user_notification_settings
// user_sessions
// login_attempts