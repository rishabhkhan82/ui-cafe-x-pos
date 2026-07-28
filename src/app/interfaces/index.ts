// Guest User interface for customer guest sessions
export interface GuestUser {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  restaurant_id: string;
  member_since: Date;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  created_at: Date;
  updated_at: Date;
  role: 'customer';
  username: string;
  password: string;
  user_type: 'customer';
  is_active: string;
}

// Export all interfaces from this barrel file
// export * from './user.interface';
// export * from './menu.interface';
// export * from './order.interface';
// export * from './inventory.interface';
// export * from './recipe.interface';
// export * from './offer.interface';
// export * from './customer.interface';
// export * from './staff.interface';
// export * from './shift.interface';
// export * from './shift-report.interface';
// export * from './restaurant.interface';
// export * from './navigation.interface';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  item_id: string;
  discount: string;
  original_price?: number;
  preparation_time: number;
  is_active: boolean;
  is_available: boolean;
  is_popular: boolean;
  is_spicy: boolean;
  is_veg: boolean;
  is_vegetarian: boolean;
  is_featured?: boolean;
  is_recommended?: boolean;
  type?: 'RAW' | 'FINISHED';
  restaurant_id: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

export interface InventoryItem {
  id: number;
  item_id: string;
  name: string;
  description: string;
  category: string;
  unit_of_measure: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  selling_price: number;
  supplier_id: string;
  location_in_store: string;
  is_active: boolean;
  expiry_date?: Date;
  last_stock_update?: Date;
  restaurant_id: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  type?: 'RAW' | 'FINISHED';
}

export interface RestaurantSubscription {
  id: number;
  subscription_id: string;
  restaurant_id: number;
  plan_id: number;
  status: string;
  billing_cycle: string;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  discount_amount: number;
  final_amount: number;
  gst_amount: number;
  gst_percentage: string;
  cancelled_at: Date | null;
  created_at: Date;
  created_by: number;
  current_period_end: Date;
  current_period_start: Date;
  end_date: Date | null;
  next_billing_date: Date | null;
  start_date: Date;
  trial_end_date: Date | null;
  updated_at: Date;
  cancellation_reason: string | null;
  discount_code: string | null;
  payment_method_id: string | null;
  plan_price_at_subscription: number;
  offer_name_at_subscription: string;
  offer_discount_percentage_at_subscription: number;
  plan_name_at_subscription: string;
}

export interface SubscriptionHistory {
  id: number;
  history_id: string;
  restaurant_id: number;
  change_type: string;
  effective_date: Date;
  previous_plan_id: string | null;
  new_plan_id: string;
  previous_price: number | null;
  new_price: number;
  price_difference: number;
  prorated_amount: number;
  payment_id: string | null;
  payment_status: string;
  initiated_by: string;
  reason: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  billing_cycle_change: boolean;
  churn_risk_score: number;
  retention_actions: any; // JSON
  created_at: Date;
  plan_price_at_subscription: number;
  offer_name_at_subscription: string;
  offer_discount_percentage_at_subscription: number;
  plan_name_at_subscription: string;
}

export interface ProductionBatch {
  id: number;
  type: string;
  inventory_item_id: number | string;
  inventory_item_name: string;
  menu_item_id?: number;
  menu_item_name?: string;
  quantity_change: number;
  balance_after: number;
  note: string;
  created_at: Date;
  created_by?: number;
  restaurant_id: number;
}

export interface RecipeProduction {
  id: number;
  recipe_id: number;
  menu_item_id: number;
  restaurant_id: number;
  batch_multiplier: number;
  note: string;
  created_by?: number;
  created_at: Date;
}

// Master interfaces starts here
export interface FeatureCategory {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface BillingCycle {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface FeatureType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface NavigationMenuType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface RestaurantStatus {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface SetupFee {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface State {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface TrialDay {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}
export interface UserType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface BillingPeriodMonths {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryItemCategory {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryItemType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryItemUnit {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MenuCategory {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MenuItemsType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  color_classes: string;
  icon: string;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReportType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface WasteReasonType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface WasteType {
  id: number;
  name: string;
  key: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

// Master interfaces starts here