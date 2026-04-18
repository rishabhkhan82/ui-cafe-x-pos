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
  original_price: number;
  preparation_time: number;
  is_active: boolean;
  is_available: boolean;
  is_popular: boolean;
  is_spicy: boolean;
  is_veg: boolean;
  is_vegetarian: boolean;
  restaurant_id: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}