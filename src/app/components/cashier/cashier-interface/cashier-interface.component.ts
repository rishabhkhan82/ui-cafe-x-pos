import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Order, OrderItem, MenuItem } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface OrderTypeTab {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

interface DineInSubTab {
  id: string;
  name: string;
  active: boolean;
}

interface OnlineOrderEntry {
  platform: string;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
}

@Component({
  selector: 'app-cashier-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cashier-interface.component.html',
  styleUrls: ['./cashier-interface.component.css']
})
export class CashierInterfaceComponent implements OnInit, OnDestroy {
  private realtimeService = inject(RealtimeService);
  private subscriptions: Subscription[] = [];

  // Order Type Tabs
  orderTypeTabs: OrderTypeTab[] = [
    { id: 'dine_in', name: 'Dine In', icon: 'fas fa-utensils', active: true },
    { id: 'dine_direct', name: 'Dine Direct', icon: 'fas fa-concierge-bell', active: false },
    { id: 'takeaway', name: 'Takeaway', icon: 'fas fa-shopping-bag', active: false },
    { id: 'online', name: 'Online', icon: 'fas fa-globe', active: false }
  ];

  // Dine In Sub-tabs
  dineInSubTabs: DineInSubTab[] = [
    { id: 'with_app', name: 'With App', active: true },
    { id: 'without_app', name: 'Without App', active: false }
  ];

  // Current active states
  activeOrderType: 'dine_in' | 'dine_direct' | 'takeaway' | 'online' = 'dine_in';
  activeDineInType: string = 'with_app';

  // Menu Categories
  menuCategories: MenuCategory[] = [
    { id: 'appetizers', name: 'Appetizers', icon: 'fas fa-leaf', color: 'bg-green-500' },
    { id: 'mains', name: 'Main Course', icon: 'fas fa-utensils', color: 'bg-blue-500' },
    { id: 'beverages', name: 'Beverages', icon: 'fas fa-coffee', color: 'bg-orange-500' },
    { id: 'desserts', name: 'Desserts', icon: 'fas fa-ice-cream', color: 'bg-pink-500' }
  ];

  // Component state
  orders: Order[] = [];
  readyOrders: Order[] = [];
  selectedOrder: Order | null = null;
  currentOrder: Order | null = null; // For creating new orders
  selectedCategory: string = 'mains';
  showPaymentSuccess = false;

  // Online Order Entry
  onlineOrderEntry: OnlineOrderEntry = {
    platform: 'zomato',
    orderId: '',
    customerName: '',
    phone: '',
    address: '',
    items: [],
    total: 0
  };

  // Payment state
  selectedPaymentMethod: PaymentMethod | null = null;
  amountReceived: number = 0;
  changeAmount: number = 0;
  discountAmount: number = 0;

  // Configuration
  taxRate: number = 18;
  todaysSales: number = 0;
  pendingBillsCount: number = 0;

  // Payment methods
  paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash', icon: 'fas fa-money-bill-wave' },
    { id: 'card', name: 'Card', icon: 'fas fa-credit-card' },
    { id: 'upi', name: 'UPI', icon: 'fas fa-mobile-alt' },
    { id: 'wallet', name: 'Wallet', icon: 'fas fa-wallet' }
  ];

  // Quick amount buttons
  quickAmounts: number[] = [100, 200, 500, 1000, 2000];

  // Sample menu items for demonstration
  menuItems: MenuItem[] = [
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

  ngOnInit(): void {
    this.loadOrders();
    this.setupRealtimeSubscriptions();
    this.calculateTodaysSales();
    this.initializeNewOrder();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadOrders(): void {
    // Load orders from mock data service
    // For now, we'll simulate with some sample orders
    this.orders = this.getSampleOrders();
    this.filterReadyOrders();
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to new orders
    const newOrderSub = this.realtimeService.newOrder$.subscribe(order => {
      if (order) {
        this.orders.unshift(order);
        this.filterReadyOrders();
      }
    });
    this.subscriptions.push(newOrderSub);

    // Subscribe to order updates
    const orderUpdateSub = this.realtimeService.orderUpdate$.subscribe(order => {
      if (order) {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = order;
          this.filterReadyOrders();
        }
      }
    });
    this.subscriptions.push(orderUpdateSub);
  }

  // Tab Management
  switchOrderType(tabId: string): void {
    this.orderTypeTabs.forEach(tab => tab.active = tab.id === tabId);
    this.activeOrderType = tabId as 'dine_in' | 'dine_direct' | 'takeaway' | 'online';
    this.resetCurrentOrder();
  }

  switchDineInType(subTabId: string): void {
    this.dineInSubTabs.forEach(tab => tab.active = tab.id === subTabId);
    this.activeDineInType = subTabId;
    this.resetCurrentOrder();
  }

  private resetCurrentOrder(): void {
    this.currentOrder = null;
    this.selectedOrder = null;
    this.initializeNewOrder();
  }

  private initializeNewOrder(): void {
    this.currentOrder = {
      id: '',
      customerId: '',
      customerName: '',
      tableNumber: '',
      items: [],
      status: 'pending',
      totalAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderType: this.activeOrderType as any,
      paymentStatus: 'pending'
    };
  }

  // Menu Management
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  getMenuItemsByCategory(): MenuItem[] {
    return this.menuItems.filter(item => {
      const categoryMap: { [key: string]: string } = {
        'appetizers': 'Appetizers',
        'mains': 'Main Course',
        'beverages': 'Beverages',
        'desserts': 'Desserts'
      };
      return item.category === categoryMap[this.selectedCategory];
    });
  }

  addItemToOrder(item: MenuItem): void {
    if (!this.currentOrder) return;

    const existingItem = this.currentOrder.items.find(i => i.menuItemId === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
    } else {
      const orderItem: OrderItem = {
        id: `item-${Date.now()}`,
        menuItemId: item.id,
        menuItemName: item.name,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price,
        status: 'pending'
      };
      this.currentOrder.items.push(orderItem);
    }
    this.updateOrderTotal();
  }

  removeItemFromOrder(itemId: string): void {
    if (!this.currentOrder) return;
    this.currentOrder.items = this.currentOrder.items.filter(item => item.id !== itemId);
    this.updateOrderTotal();
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    if (!this.currentOrder || quantity < 1) return;
    const item = this.currentOrder.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.unitPrice;
      this.updateOrderTotal();
    }
  }

  private updateOrderTotal(): void {
    if (!this.currentOrder) return;
    this.currentOrder.totalAmount = this.currentOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  // Online Order Entry
  addOnlineOrderItem(): void {
    const item: OrderItem = {
      id: `online-item-${Date.now()}`,
      menuItemId: '',
      menuItemName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      status: 'pending'
    };
    this.onlineOrderEntry.items.push(item);
  }

  removeOnlineOrderItem(index: number): void {
    this.onlineOrderEntry.items.splice(index, 1);
    this.calculateOnlineOrderTotal();
  }

  calculateOnlineOrderTotal(): void {
    this.onlineOrderEntry.total = this.onlineOrderEntry.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  saveOnlineOrder(): void {
    if (!this.onlineOrderEntry.orderId || !this.onlineOrderEntry.customerName) return;

    // Create order from online entry
    const order: Order = {
      id: this.onlineOrderEntry.orderId,
      customerId: `online-${Date.now()}`,
      customerName: this.onlineOrderEntry.customerName,
      tableNumber: 'N/A',
      items: this.onlineOrderEntry.items,
      status: 'confirmed',
      totalAmount: this.onlineOrderEntry.total,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderType: 'delivery',
      paymentStatus: 'pending',
      specialInstructions: `Platform: ${this.onlineOrderEntry.platform} | Phone: ${this.onlineOrderEntry.phone} | Address: ${this.onlineOrderEntry.address}`
    };

    this.orders.unshift(order);
    this.filterReadyOrders();

    // Reset form
    this.onlineOrderEntry = {
      platform: 'zomato',
      orderId: '',
      customerName: '',
      phone: '',
      address: '',
      items: [],
      total: 0
    };
  }

  private getSampleOrders(): Order[] {
    const now = new Date();
    return [
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
  }

  private filterReadyOrders(): void {
    this.readyOrders = this.orders.filter(order => order.status === 'ready');
    this.pendingBillsCount = this.readyOrders.length;
  }

  private calculateTodaysSales(): void {
    // Calculate today's sales from completed orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = this.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && order.paymentStatus === 'paid';
    });

    this.todaysSales = todaysOrders.reduce((total, order) => total + order.totalAmount, 0);
  }

  // Action methods
  newBill(): void {
    // Create a new bill/order
    console.log('Creating new bill...');
    // Implementation would open a new order creation modal
  }

  searchOrder(): void {
    // Open search modal
    console.log('Opening order search...');
  }

  recentTransactions(): void {
    // Show recent transactions
    console.log('Showing recent transactions...');
  }

  shiftReport(): void {
    // Generate shift report
    console.log('Generating shift report...');
  }

  searchOrderById(searchTerm: string): void {
    if (!searchTerm.trim()) return;

    // Search by order ID or table number
    const foundOrder = this.orders.find(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundOrder) {
      this.selectOrder(foundOrder);
    } else {
      alert(`Order "${searchTerm}" not found`);
    }
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.amountReceived = 0;
    this.changeAmount = 0;
    this.selectedPaymentMethod = null;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  setQuickAmount(amount: number): void {
    if (this.selectedOrder) {
      this.amountReceived = amount;
      this.calculateChange();
    }
  }

  calculateChange(): void {
    if (this.selectedOrder && this.amountReceived > 0) {
      this.changeAmount = this.amountReceived - this.selectedOrder.totalAmount;
    } else {
      this.changeAmount = 0;
    }
  }

  canProcessPayment(): boolean {
    return !!(this.selectedOrder &&
              this.selectedPaymentMethod &&
              this.amountReceived >= this.selectedOrder.totalAmount);
  }

  processPayment(): void {
    if (!this.canProcessPayment()) return;

    // Update order payment status
    if (this.selectedOrder) {
      this.selectedOrder.paymentStatus = 'paid';
      this.selectedOrder.status = 'completed';

      // Update local orders array
      const index = this.orders.findIndex(o => o.id === this.selectedOrder!.id);
      if (index !== -1) {
        this.orders[index] = { ...this.selectedOrder };
      }

      // Recalculate today's sales
      this.calculateTodaysSales();
      this.filterReadyOrders();

      // Show success modal
      this.showPaymentSuccess = true;

      // Trigger notification
      this.realtimeService.triggerTestNotification();
    }
  }

  printReceipt(): void {
    if (!this.selectedOrder) return;

    // Simulate printing
    console.log('Printing receipt for order:', this.selectedOrder);
    alert(`Printing receipt for Order #${this.selectedOrder.id.split('-').pop()}...`);
  }

  holdBill(): void {
    if (!this.selectedOrder) return;

    // Hold the bill for later
    this.selectedOrder.status = 'pending';
    alert(`Bill for Order #${this.selectedOrder.id.split('-').pop()} has been put on hold.`);
  }

  closePaymentSuccess(): void {
    this.showPaymentSuccess = false;
    this.selectedOrder = null;
    this.amountReceived = 0;
    this.changeAmount = 0;
    this.selectedPaymentMethod = null;
  }

  // UI Helper Methods
  getOrderCardClass(order: Order, selectedOrder: Order | null): string {
    const baseClass = 'rounded-lg border transition-all cursor-pointer';

    if (selectedOrder && order.id === selectedOrder.id) {
      return `${baseClass} border-primary-500 bg-primary-50 dark:bg-primary-900/20`;
    }

    return `${baseClass} border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700`;
  }

  getOrderStatusBadgeClass(order: Order): string {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'served': 'bg-purple-100 text-purple-800',
      'completed': 'bg-gray-100 text-gray-800'
    };

    return classes[order.status as keyof typeof classes] || classes['pending'];
  }

  getPaymentMethodClass(method: PaymentMethod): string {
    const baseClass = 'p-3 rounded-lg border transition-all text-sm font-medium';

    if (this.selectedPaymentMethod && method.id === this.selectedPaymentMethod.id) {
      return `${baseClass} border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300`;
    }

    return `${baseClass} border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700`;
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
