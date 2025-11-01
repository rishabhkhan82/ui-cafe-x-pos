import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// Interfaces
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: 'platform_owner' | 'restaurant_owner' | 'restaurant_manager' | 'cashier' | 'kitchen_manager' | 'waiter' | 'customer';
  avatar?: string;
  restaurantId?: string;
  memberSince?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  lastLogin?: Date;
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
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: Date;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteItems: string[];
  addresses: CustomerAddress[];
  preferences: CustomerPreferences;
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

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // BehaviorSubjects for reactive data
  private usersSubject = new BehaviorSubject<User[]>([]);
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

  // Observable streams
  users$ = this.usersSubject.asObservable();
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

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
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
        restaurantId: undefined,
        memberSince: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
        lastLogin: new Date('2024-12-29')
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
        restaurantId: 'restaurant-1',
        memberSince: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
        lastLogin: undefined
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
        restaurantId: 'restaurant-1',
        memberSince: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
        lastLogin: undefined
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
        restaurantId: 'restaurant-1',
        memberSince: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
        lastLogin: undefined
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
        restaurantId: 'restaurant-1',
        memberSince: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
        lastLogin: undefined
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
        restaurantId: 'restaurant-1',
        memberSince: undefined,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
        lastLogin: undefined
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
        restaurantId: undefined,
        memberSince: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isActive: true,
        lastLogin: undefined
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
        restaurantId: undefined,
        memberSince: new Date('2024-03-20'),
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20'),
        isActive: true,
        lastLogin: undefined
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

    // Emit initial data
    this.usersSubject.next(users);
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

  // Utility methods
  generateOrderId(): string {
    const timestamp = new Date().getFullYear().toString().slice(-2) +
                     ('0' + (new Date().getMonth() + 1)).slice(-2) +
                     ('0' + new Date().getDate()).slice(-2);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}