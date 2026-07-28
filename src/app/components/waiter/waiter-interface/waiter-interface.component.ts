import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { MockDataService, Order, User, MenuItem, CartItem, Customer, Table } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

@Component({
  selector: 'app-waiter-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './waiter-interface.component.html',
  styleUrl: './waiter-interface.component.css'
})
export class WaiterInterfaceComponent implements OnInit, OnDestroy {
  private mockDataService = inject(MockDataService);
  private realtimeService = inject(RealtimeService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
  tables: Table[] = [];
  menuItems: MenuItem[] = [];
  readyOrders: Order[] = [];
  onTheWayOrders: Order[] = [];
  servedOrders: Order[] = [];

  // Order creation state
  selectedTable: Table | null = null;
  selectedOrder: Order | null = null;
  currentCustomer: Customer = { isGuest: true };
  cart: CartItem[] = [];
  selectedCategory: string = 'all';
  discountApplied: number = 0;
  discountType: 'percentage' | 'fixed' = 'percentage';

  // UI state
  currentView: 'tables' | 'menu' | 'cart' | 'orders' = 'tables';
  tableView: 'grid' | 'list' = 'grid';
  showCustomerForm: boolean = false;
  showDiscountForm: boolean = false;

  // Stats
  activeTablesCount: number = 0;
  readyOrdersCount: number = 0;
  onTheWayCount: number = 0;
  deliveredToday: number = 0;

  ngOnInit(): void {
    this.initializeData();
    this.setupRealtimeSubscriptions();
    this.updateStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('waiter') || null;
    this.initializeTables();
    this.loadOrders();
    this.loadMenuItems();
  }

  private initializeTables(): void {
    // Create 10 tables with different capacities and predetermined statuses
    this.tables = Array.from({ length: 10 }, (_, i) => {
      let status: Table['status'];
      // Deliberate status distribution for better demo experience
      if (i === 0 || i === 1) status = 'available'; // Tables 1-2: Available (green)
      else if (i === 2 || i === 3) status = 'occupied'; // Tables 3-4: Occupied (blue)
      else if (i === 4 || i === 5) status = 'reserved'; // Tables 5-6: Reserved (purple)
      else if (i === 6 || i === 7) status = 'needs_cleaning'; // Tables 7-8: Needs cleaning (red)
      else status = 'available'; // Tables 9-10: Available (green)

      return {
        id: `table-${i + 1}`,
        number: i + 1,
        capacity: i < 5 ? 2 : i < 10 ? 4 : 6, // Mix of 2, 4, and 6-seater tables
        status: status,
        lastActivity: new Date()
      };
    });

      // Assign some orders to occupied tables
      this.mockDataService.getOrders().subscribe(orders => {
        const activeOrders = orders.filter(order =>
          ['CONFIRMED', 'PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'].includes(order.status)
        );

      // Only assign orders to tables that are already marked as occupied
      const occupiedTables = this.tables.filter(table => table.status === 'occupied');
      activeOrders.forEach((order, index) => {
        if (index < occupiedTables.length) {
          occupiedTables[index].currentOrder = order;
        }
      });
    });
  }

  private getRandomTableStatus(): Table['status'] {
    const statuses: Table['status'][] = ['available', 'occupied', 'reserved', 'needs_cleaning'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private loadMenuItems(): void {
    this.mockDataService.getMenuItems().subscribe(items => {
      this.menuItems = items;
    });
  }

  private loadOrders(): void {
    this.mockDataService.getOrders().subscribe(orders => {
      this.readyOrders = orders.filter(order => order.status === 'READY');
      this.onTheWayOrders = orders.filter(order => order.status === 'ON_THE_WAY');
      this.updateStats();
    });
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to order updates
    const orderUpdateSub = this.realtimeService.orderUpdate$.subscribe(order => {
      if (order) {
        this.updateOrderInLists(order);
        this.updateTableStatus(order);
        this.updateStats();
      }
    });
    this.subscriptions.push(orderUpdateSub);

    // Update stats every minute
    const statsSub = interval(60000).subscribe(() => {
      this.updateStats();
    });
    this.subscriptions.push(statsSub);
  }

  private updateOrderInLists(order: Order): void {
    // Update ready orders
    const readyIndex = this.readyOrders.findIndex(o => o.id === order.id);
    if (order.status === 'READY' && readyIndex === -1) {
      this.readyOrders.push(order);
    } else if (order.status !== 'READY' && readyIndex !== -1) {
      this.readyOrders.splice(readyIndex, 1);
    }

    // Update on the way orders
    const onTheWayIndex = this.onTheWayOrders.findIndex(o => o.id === order.id);
    if (order.status === 'ON_THE_WAY' && onTheWayIndex === -1) {
      this.onTheWayOrders.push(order);
    } else if (order.status !== 'ON_THE_WAY' && onTheWayIndex !== -1) {
      this.onTheWayOrders.splice(onTheWayIndex, 1);
    }
  }

  private updateTableStatus(order: Order): void {
    const table = this.tables.find(t => t.currentOrder?.id === order.id);
    if (table) {
      if (order.status === 'COMPLETED') {
        table.status = 'needs_cleaning';
        table.currentOrder = undefined;
      }
    }
  }

  private updateStats(): void {
    this.activeTablesCount = this.tables.filter(t => t.status === 'occupied').length;
    this.readyOrdersCount = this.readyOrders.length;
    this.onTheWayCount = this.onTheWayOrders.length;
    this.deliveredToday = this.onTheWayOrders.filter(order =>
      order.status === 'SERVED' &&
      new Date(order.created_at).toDateString() === new Date().toDateString()
    ).length;
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  // Navigation methods
  setView(view: 'tables' | 'menu' | 'cart' | 'orders'): void {
    this.currentView = view;
  }

  toggleTableView(): void {
    this.tableView = this.tableView === 'grid' ? 'list' : 'grid';
  }

  selectTable(table: Table): void {
    if (table.status === 'available') {
      this.selectedTable = table;
      this.currentCustomer = { isGuest: true };
      this.cart = [];
      this.discountApplied = 0;
      this.setView('menu');
    } else {
      this.selectedTable = table;
    }
  }

  goBack(): void {
    if (this.currentView === 'menu' && this.selectedTable) {
      this.setView('tables');
    } else if (this.currentView === 'cart') {
      this.setView('menu');
    } else {
      this.setView('tables');
    }
  }

  closeTableDetails(): void {
    this.selectedTable = null;
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  markAsOnTheWay(order: Order): void {
    order.status = 'ON_THE_WAY';
    order.delivered_at = new Date();
    this.realtimeService.updateOrder(order);
    this.closeOrderDetails();
  }

  markAsDelivered(order: Order): void {
    order.status = 'SERVED';
    this.realtimeService.updateOrder(order);
    this.closeOrderDetails();
  }

  callForHelp(order: Order): void {
    // In a real app, this would send a notification to managers
    alert(`Help requested for Order #${order.order_id.split('-').pop()} at Table ${order.table_number}`);
  }

  requestBill(table: Table): void {
    if (table.currentOrder) {
      table.currentOrder.status = 'BILLING_REQUESTED';
      this.realtimeService.updateOrder(table.currentOrder);
      alert(`Bill requested for Table ${table.number}`);
    }
  }

  // Menu and cart methods
  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  addToCart(menuItem: MenuItem): void {
    const existingItem = this.cart.find(item => item.menu_item.id === menuItem.id);
    if (existingItem) {
      existingItem.quantity++;
      existingItem.total_price = existingItem.quantity * menuItem.price;
    } else {
      // this.cart.push({
      //   menuItem,
      //   quantity: 1,
      //   total_price: menuItem.price
      // });
    }
  }

  updateCartItemQuantity(cartItem: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(cartItem);
    } else {
      cartItem.quantity = quantity;
      cartItem.total_price = cartItem.quantity * cartItem.menu_item.price;
    }
  }

  removeFromCart(cartItem: CartItem): void {
    const index = this.cart.indexOf(cartItem);
    if (index > -1) {
      this.cart.splice(index, 1);
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + item.total_price, 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Customer methods
  toggleCustomerForm(): void {
    this.showCustomerForm = !this.showCustomerForm;
  }

  saveCustomer(): void {
    // Validate customer data if provided
    if (!this.currentCustomer.isGuest && (!this.currentCustomer.name || !this.currentCustomer.phone)) {
      alert('Please provide customer name and phone number');
      return;
    }
    this.showCustomerForm = false;
  }

  // Discount methods
  toggleDiscountForm(): void {
    this.showDiscountForm = !this.showDiscountForm;
  }

  applyDiscount(): void {
    // In a real app, this would validate loyalty codes or customer discounts
    if (this.discountApplied > 0) {
      alert('Discount already applied');
      return;
    }
    // Mock discount application
    this.discountApplied = 10; // 10% discount
    this.discountType = 'percentage';
    this.showDiscountForm = false;
  }

  removeDiscount(): void {
    this.discountApplied = 0;
  }

  getDiscountAmount(): number {
    const subtotal = this.getCartTotal();
    if (this.discountType === 'percentage') {
      return (subtotal * this.discountApplied) / 100;
    }
    return Math.min(this.discountApplied, subtotal);
  }

  getFinalTotal(): number {
    return this.getCartTotal() - this.getDiscountAmount();
  }

  // Order submission
  submitOrder(): void {
    if (!this.selectedTable || this.cart.length === 0) {
      alert('Please select a table and add items to cart');
      return;
    }

    const orderItems = this.cart.map(cartItem => ({
      menuItemId: cartItem.menu_item.id,
      menuItemName: cartItem.menu_item.name,
      quantity: cartItem.quantity,
      unitPrice: cartItem.menu_item.price,
      totalPrice: cartItem.total_price,
      specialInstructions: cartItem.special_instructions
    }));

    const order: Order = {
      id: Date.now(),
      order_id: `ORD-${Date.now()}`,
      table_number: this.selectedTable.number.toString(),
      customer_name: this.currentCustomer.isGuest ? 'Guest' : (this.currentCustomer.name || 'Customer'),
      customer_id: this.currentCustomer.id ? parseInt(this.currentCustomer.id) : 0,
      restaurant_id: 1,
      items: orderItems.map(item => ({
        id: item.menuItemId,
        order_id: order.id,
        menu_item_id: item.menuItemId,
        menu_item_name: item.menuItemName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        special_instructions: item.specialInstructions,
        category: 'Main Course',
        status: 'active'
      })),
      total_amount: this.getFinalTotal(),
      status: 'CONFIRMED',
      created_at: new Date(),
      updated_at: new Date(),
      payment_status: 'PENDING',
      special_instructions: '',
      tax_amount: 0,
      order_type: 'DINE_IN',
      priority: 'MEDIUM'
    };

    // Update table status
    this.selectedTable.status = 'occupied';
    this.selectedTable.currentOrder = order;

    // Send order to kitchen (using existing updateOrder method)
    this.realtimeService.updateOrder(order);

    // Reset state
    this.cart = [];
    this.discountApplied = 0;
    this.currentCustomer = { isGuest: true };
    this.selectedTable = null;
    this.setView('tables');

    alert(`Order #${order.order_id.split('-').pop()} created successfully for Table ${order.table_number}`);
  }

  canRequestBill(order: Order): boolean {
    return ['READY', 'SERVED'].includes(order.status);
  }

  canMarkAsOnTheWay(order: Order): boolean {
    return order.status === 'READY';
  }

  canMarkAsDelivered(order: Order): boolean {
    return order.status === 'ON_THE_WAY';
  }

  // Helper methods
  getFilteredMenuItems(): MenuItem[] {
    if (this.selectedCategory === 'all') {
      return this.menuItems;
    }
    return this.menuItems.filter(item => item.category === this.selectedCategory);
  }

  getMenuCategories(): string[] {
    const categories = ['all', ...new Set(this.menuItems.map(item => item.category))];
    return categories;
  }

  getTableBorderClass(table: Table): string {
    switch (table.status) {
      case 'occupied': return 'border-blue-500';
      case 'reserved': return 'border-purple-500';
      case 'needs_cleaning': return 'border-red-500';
      default: return 'border-gray-200 dark:border-gray-700';
    }
  }

  getTableStatusClass(table: Table): string {
    switch (table.status) {
      case 'occupied': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'needs_cleaning': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getTableIcon(table: Table): string {
    switch (table.status) {
      case 'occupied': return 'fas fa-users';
      case 'needs_cleaning': return 'fas fa-broom';
      default: return 'fas fa-utensils';
    }
  }

  getTableStatusText(table: Table): string {
    switch (table.status) {
      case 'occupied': return 'Occupied';
      case 'needs_cleaning': return 'Needs Cleaning';
      default: return 'Available';
    }
  }

  getTableStatusBadgeClass(table: Table): string {
    switch (table.status) {
      case 'occupied': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'needs_cleaning': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getOrderStatusBadgeClass(order: Order): string {
    switch (order.status) {
      case 'READY': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'ON_THE_WAY': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'SERVED': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getOrderStatusText(order: Order): string {
    switch (order.status) {
      case 'READY': return 'Ready';
      case 'ON_THE_WAY': return 'On the Way';
      case 'SERVED': return 'Served';
      case 'COMPLETED': return 'Completed';
      default: return order.status;
    }
  }

  formatOrderTime(created_at: Date | string): string {
    const now = new Date();
    const created = new Date(created_at);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  }

  formatTimeAgo(delivered_at?: Date): string {
    if (!delivered_at) return '';
    const now = new Date();
    const delivered = new Date(delivered_at);
    const diffMinutes = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  }
}
