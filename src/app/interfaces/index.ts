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
}