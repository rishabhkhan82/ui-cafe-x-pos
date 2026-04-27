import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription, Observable } from 'rxjs';
import { Order, OrderStatus } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';
import { MockDataService } from '../../../services/mock-data.service';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationDialogComponent } from '../../common/confirmation-dialog/confirmation-dialog.component';
import { ElapsedTimePipe } from './elapsed-time.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent, ElapsedTimePipe],
  templateUrl: './orders-mobile.component.html',
  styleUrls: ['./orders-mobile.component.css']
})
export class OrdersMobileComponent implements OnInit, OnDestroy {
  private realtimeService = inject(RealtimeService);
  private mockDataService = inject(MockDataService);
  private crudService = inject(CrudService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private validationService = inject(ValidationService);
  private confirmationService = inject(ConfirmationDialogService);
  private authService = inject(AuthService);
  private subscriptions: Subscription[] = [];
  public realTimeLoader : boolean = true;

  // Component state
  currentTime: string = '';
  activeStatus: string = 'all';
  activeStatusLabel: string = 'All Orders';
  selectedOrder: Order | null = null;
  selectedOrderItems: Order | null = null;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  allOrders: Order[] = [];
  errorMessage = '';
  searchTerm = '';
  userRole: string = 'owner'; // Default, will be set from sessionStorage
  currentUser: any;

  // Swipe handling
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  // Order statuses for filtering - role-based
  orderStatuses: OrderStatus[] = [];

  isLoading: boolean = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Status options for filtering - role-based
  statusOptions: any[] = [];

  constructor(public router: Router) {
    
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    this.userRole = this.currentUser ? this.currentUser.role : 'owner';
    console.log('User role:', this.userRole);
    this.initializeRoleConfig();
    this.initializeTime();
    this.loadOrders();
    this.setupRealtimeSubscriptions();
    this.loadTheme();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeRoleConfig(): void {
    const allStatuses = [
      { key: 'all', label: 'All', icon: 'fas fa-list', color: 'bg-gray-500' },
      { key: 'PENDING', label: 'Pending', icon: 'fas fa-clock', color: 'bg-yellow-500' },
      { key: 'PREPARING', label: 'Preparing', icon: 'fas fa-utensils', color: 'bg-orange-500' },
      { key: 'READY', label: 'Ready', icon: 'fas fa-check-double', color: 'bg-green-500' },
      { key: 'ON_THE_WAY', label: 'On the Way', icon: 'fas fa-user-tie', color: 'bg-blue-500' },
      { key: 'SERVED', label: 'Served', icon: 'fas fa-utensils', color: 'bg-purple-500' },
      { key: 'BILLING_REQUESTED', label: 'Billing Requested', icon: 'fas fa-file-invoice-dollar', color: 'bg-indigo-500' },
      { key: 'CANCELLED', label: 'Cancelled', icon: 'fas fa-times', color: 'bg-red-500' }
    ];
    const allStatusOptions = [
      { value: 'PENDING', label: 'Pending', icon: 'fas fa-clock' },
      { value: 'PREPARING', label: 'Preparing', icon: 'fas fa-utensils' },
      { value: 'READY', label: 'Ready', icon: 'fas fa-check-circle' },
      { value: 'ON_THE_WAY', label: 'On the Way', icon: 'fas fa-user-tie' },
      { value: 'SERVED', label: 'Served', icon: 'fas fa-utensils' },
      { value: 'BILLING_REQUESTED', label: 'Billing Requested', icon: 'fas fa-file-invoice-dollar' },
      { value: 'CANCELLED', label: 'Cancelled', icon: 'fas fa-times' }
    ];

    switch (this.userRole) {
      case 'restaurant_owner':
        this.orderStatuses = allStatuses;
        this.statusOptions = allStatusOptions;
        break;
      case 'waiter':
        this.orderStatuses = allStatuses;
        this.statusOptions = allStatusOptions;
        break;
      case 'kitchen':
        this.orderStatuses = allStatuses;
        this.statusOptions = allStatusOptions;
        break;
      case 'kitchen_manager':
        this.orderStatuses = allStatuses;
        this.statusOptions = allStatusOptions;
        break;
      default:
        this.orderStatuses = [];
        this.statusOptions = [];
    }
  }

  private initializeTime(): void {
    if (['kitchen', 'kitchen_manager'].includes(this.userRole)) {
      // Update current time every second
      const timeSub = interval(1000).subscribe(() => {
        this.currentTime = new Date().toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      });
      this.subscriptions.push(timeSub);
    }
  }

  private loadOrders(): void {
    this.realTimeLoader = true;
    // Load current orders from API
    this.crudService.getCurrentOrders().subscribe({
      next: (response: any) => {
        this.allOrders = response || [];
        this.filterOrders();
        this.realTimeLoader = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.allOrders = [];
        this.filterOrders();
        this.realTimeLoader = false;
      }
    });
  }

  private setupRealtimeSubscriptions(): void {
    if (['kitchen', 'kitchen_manager'].includes(this.userRole)) {
      // Subscribe to new orders
      const newOrderSub = this.realtimeService.newOrder$.subscribe(order => {
        if (order) {
          this.orders.unshift(order);
          this.filterOrders();
        }
      });
      this.subscriptions.push(newOrderSub);

      // Subscribe to order updates
      const orderUpdateSub = this.realtimeService.orderUpdate$.subscribe(order => {
        if (order) {
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index] = order;
            this.filterOrders();
          }
        }
      });
      this.subscriptions.push(orderUpdateSub);
    }
  }

  setActiveStatus(status: string): void {
    this.activeStatus = status;
    this.activeStatusLabel = this.orderStatuses.find(s => s.key === status)?.label || 'All Orders';
    this.filterOrders();
  }

  onSearchChange(): void {
    this.filterOrders();
  }

  private applyFiltersAndPagination(): void {
    let filtered = this.allOrders;

    // Role-based status filtering
    if (this.userRole === 'waiter') {
      // Hide for now - can show specifically using this filters
      // filtered = filtered.filter(order =>
      //   ['PREPARING', 'READY', 'ON_THE_WAY', 'SERVED'].includes(order.status)
      // );
    } else if (['kitchen', 'kitchen_manager'].includes(this.userRole)) {
      // Hide for now - can show specifically using this filters
      // filtered = filtered.filter(order =>
      //   ['PENDING', 'PREPARING', 'READY'].includes(order.status)
      // );
    }
    // Owner sees all

    if (this.activeStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.activeStatus);
    }

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(order => order.order_id.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    // Sort by priority and time
    if (['kitchen', 'kitchen_manager'].includes(this.userRole)) {
      filtered.sort((a, b) => {
        const priorityOrder = { 'PENDING': 3, 'PREPARING': 2, 'READY': 1 };
        const priorityDiff = (priorityOrder[b.status as keyof typeof priorityOrder] || 0) -
                              (priorityOrder[a.status as keyof typeof priorityOrder] || 0);

        if (priorityDiff !== 0) return priorityDiff;

        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    } else {
      // For owner and waiter, sort by created time descending or as needed
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    this.totalElements = filtered.length;
    this.totalPages = Math.ceil(this.totalElements / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.orders = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get activeOrdersCount(): number {
    if (['kitchen', 'kitchen_manager'].includes(this.userRole)) {
      return this.orders.filter(order =>
        ['PENDING', 'PREPARING', 'READY'].includes(order.status)
      ).length;
    }
    return this.orders.length;
  }

  getOrdersByStatus(status: string): Order[] {
    let baseOrders = this.allOrders;

    // Apply search filter if present
    if (this.searchTerm.trim()) {
      baseOrders = baseOrders.filter(order => order.order_id.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    if (status === 'all') {
      return baseOrders; // Total count after search, ignoring activeStatus
    }
    return baseOrders.filter(order => order.status === status);
  }

  // UI Helper Methods
  getStatusButtonClass(status: string): string {
    const baseClass = 'px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm border whitespace-nowrap';
    const isActive = this.activeStatus === status;

    if (isActive) {
      return `${baseClass} border-primary-500 text-primary-500 bg-white dark:bg-gray-800`;
    }

    return `${baseClass} border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500 bg-white dark:bg-gray-800`;
  }

  getStatusCountClass(status: string): string {
    const count = this.getOrdersByStatus(status).length;
    if (count === 0) return 'bg-gray-600 text-gray-300';
    if (count < 3) return 'bg-green-600 text-green-100';
    if (count < 5) return 'bg-yellow-600 text-yellow-100';
    return 'bg-red-600 text-red-100';
  }

  getOrderCardClass(order: Order): string {
    const baseClass = 'transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ring-1 ring-gray-200 dark:ring-transparent';

    const elapsedMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);

    // Role-based highlights
    if (this.userRole === 'restaurant_owner' && order.status === 'BILLING_REQUESTED') {
      return `${baseClass} animate-pulse border-2 border-indigo-500`;
    }
    if (this.userRole === 'waiter' && order.status === 'ON_THE_WAY' && elapsedMinutes > 10) {
      return `${baseClass} animate-pulse border-2 border-blue-500`;
    }
    if (['kitchen', 'kitchen_manager'].includes(this.userRole) && order.status === 'PREPARING' && elapsedMinutes > 10) {
      return `${baseClass} animate-pulse border-2 border-orange-500`;
    }

    return baseClass;
  }

  getOrderHeaderClass(order: Order): string {
    const statusColors = {
      'PENDING': 'bg-yellow-500 text-white',
      'CONFIRMED': 'bg-blue-500 text-white',
      'PREPARING': 'bg-orange-500 text-white',
      'READY': 'bg-green-500 text-white',
      'ON_THE_WAY': 'bg-blue-500 text-white',
      'SERVED': 'bg-purple-500 text-white',
      'COMPLETED': 'bg-gray-500 text-white',
      'BILLING_REQUESTED': 'bg-indigo-500 text-white',
      'CANCELLED': 'bg-red-500 text-white'
    };

    return statusColors[order.status as keyof typeof statusColors] || 'bg-gray-500 text-white';
  }

  getPriorityBadgeClass(order: Order): string {
    if (!['kitchen', 'kitchen_manager'].includes(this.userRole)) return '';
    const elapsedMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);

    if (elapsedMinutes > 15) return 'bg-red-600 text-white';
    if (elapsedMinutes > 10) return 'bg-orange-600 text-white';
    return 'bg-gray-600 text-white';
  }

  getOrderPriority(order: Order): string {
    if (!['kitchen', 'kitchen_manager'].includes(this.userRole)) return '';
    const elapsedMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);

    if (elapsedMinutes > 15) return 'URGENT';
    if (elapsedMinutes > 10) return 'HIGH';
    if (elapsedMinutes > 5) return 'MEDIUM';
    return 'NORMAL';
  }

  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }



  canMoveToNextStatus(order: Order): boolean {
    if (!['kitchen', 'kitchen_manager'].includes(this.userRole)) return false;
    const statusFlow = ['PENDING', 'PREPARING', 'READY'];
    const currentIndex = statusFlow.indexOf(order.status);

    return currentIndex !== -1 && currentIndex < statusFlow.length - 1;
  }

  getNextStatus(currentStatus: string): string {
    if (!['kitchen', 'kitchen_manager'].includes(this.userRole)) return currentStatus;
    const statusFlow = ['PENDING', 'PREPARING', 'READY'];
    const currentIndex = statusFlow.indexOf(currentStatus);

    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }

    return currentStatus;
  }

  getNextStatusLabel(currentStatus: string): string {
    if (!['kitchen', 'kitchen_manager'].includes(this.userRole)) return 'Update';
    const labels = {
      'PENDING': 'Start Prep',
      'PREPARING': 'Ready'
    };

    return labels[currentStatus as keyof typeof labels] || 'Update';
  }

  async updateOrderStatus(order: Order, newStatus: string): Promise<void> {
    const action = newStatus === 'CANCELLED' ? 'cancel' : 'update';
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to ${action} this order to ${newStatus}?`,
      `Confirm Action (#${order.order_id.split('-').pop()})`
    );
    if (!confirmed) return;

    this.loadingService.show();

    // Update order status for API call
    const updatedOrder = { ...order };
    updatedOrder.status = newStatus as any;
    updatedOrder.updated_at = new Date();

    if (['kitchen', 'kitchen_manager'].includes(this.userRole)) {
      // Update all order items status
      updatedOrder.items.forEach(item => {
        item.status = newStatus as any;
      });
    }

    this.updateOrder(updatedOrder).subscribe({
      next: (response) => {
        console.log('Order status updated successfully:', response);
        this.loadingService.hide();
        this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} status updated to ${newStatus}`);
        this.loadOrders();

        if (['kitchen', 'kitchen_manager'].includes(this.userRole) && newStatus === 'READY') {
          this.deductInventoryForOrder(order);
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.loadingService.hide();
        this.notificationService.error('Error', 'Failed to update order status. Please try again.');
      }
    });
  }

  private deductInventoryForOrder(order: Order): void {
    order.items.forEach(orderItem => {
      const recipe = this.mockDataService.getRecipeByMenuItemId(orderItem.menu_item_id);
      if (recipe) {
        recipe.ingredients.forEach(recipeIngredient => {
          const quantityUsed = recipeIngredient.quantity * orderItem.quantity;
          this.mockDataService.updateInventoryStock(recipeIngredient.ingredientId, quantityUsed);
        });
      }
    });
  }

  private updateOrder(order: Order): Observable<any> {
    const orderRequest = {
      order_id: order.order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      status: order.status,
      total_amount: order.total_amount,
      special_instructions: order.special_instructions,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      order_type: order.order_type,
      priority: order.priority,
      tax_amount: order.tax_amount,
      order_items: order.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category,
        special_instructions: item.special_instructions,
        status: item.status,
        id: item.id
      }))
    };

    return this.crudService.updateOrder(order.id, orderRequest);
  }

  async markOnTheWay(order: Order): Promise<void> {
    if (this.userRole !== 'waiter') return;
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to mark this order as On the Way?',
      `Mark On the Way (#${order.order_id.split('-').pop()})`
    );
    if (!confirmed) return;

    this.loadingService.show();

    const orderRequest = {
      order_id: order.order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      status: 'ON_THE_WAY',
      total_amount: order.total_amount,
      special_instructions: order.special_instructions,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      order_type: order.order_type,
      priority: order.priority,
      tax_amount: order.tax_amount,
      order_items: order.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category,
        special_instructions: item.special_instructions,
        status: item.status,
        id: item.id
      }))
    };

    this.crudService.updateOrder(order.id, orderRequest).subscribe({
      next: (response) => {
        console.log('Order marked as On the Way successfully:', response);
        this.loadingService.hide();
        this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} marked as On the Way`);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error marking order as On the Way:', error);
        this.loadingService.hide();
        this.notificationService.error('Error', 'Failed to mark order as On the Way. Please try again.');
      }
    });
  }

  async markServed(order: Order): Promise<void> {
    if (this.userRole !== 'waiter') return;
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to mark this order as Served?',
      `Mark Served (#${order.order_id.split('-').pop()})`
    );
    if (!confirmed) return;

    this.loadingService.show();

    const orderRequest = {
      order_id: order.order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      status: 'SERVED',
      total_amount: order.total_amount,
      special_instructions: order.special_instructions,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      order_type: order.order_type,
      priority: order.priority,
      tax_amount: order.tax_amount,
      order_items: order.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category,
        special_instructions: item.special_instructions,
        status: item.status,
        id: item.id
      }))
    };

    this.crudService.updateOrder(order.id, orderRequest).subscribe({
      next: (response) => {
        console.log('Order marked as Served successfully:', response);
        this.loadingService.hide();
        this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} marked as Served`);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error marking order as Served:', error);
        this.loadingService.hide();
        this.notificationService.error('Error', 'Failed to mark order as Served. Please try again.');
      }
    });
  }

  async markCompleted(order: Order): Promise<void> {
    if (this.userRole !== 'restaurant_owner') return;
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to mark this order as Completed?',
      `Mark Completed (#${order.order_id.split('-').pop()})`
    );
    if (!confirmed) return;

    this.loadingService.show();

    const orderRequest = {
      order_id: order.order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      status: 'COMPLETED',
      total_amount: order.total_amount,
      special_instructions: order.special_instructions,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      order_type: order.order_type,
      priority: order.priority,
      tax_amount: order.tax_amount,
      order_items: order.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category,
        special_instructions: item.special_instructions,
        status: item.status,
        id: item.id
      }))
    };

    this.crudService.updateOrder(order.id, orderRequest).subscribe({
      next: (response) => {
        console.log('Order marked as Completed successfully:', response);
        this.loadingService.hide();
        this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} marked as Completed`);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error marking order as Completed:', error);
        this.loadingService.hide();
        this.notificationService.error('Error', 'Failed to mark order as Completed. Please try again.');
      }
    });
  }

  async cancelOrder(order: Order): Promise<void> {
    if (!['restaurant_owner', 'kitchen', 'kitchen_manager'].includes(this.userRole)) return;
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.',
      `Cancel Order (#${order.order_id.split('-').pop()})`
    );
    if (!confirmed) return;

    this.loadingService.show();

    const orderRequest = {
      order_id: order.order_id,
      customer_name: order.customer_name,
      table_number: order.table_number,
      status: 'CANCELLED',
      total_amount: order.total_amount,
      special_instructions: order.special_instructions,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      order_type: order.order_type,
      priority: order.priority,
      tax_amount: order.tax_amount,
      order_items: order.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        category: item.category,
        special_instructions: item.special_instructions,
        status: item.status,
        id: item.id
      }))
    };

    this.crudService.updateOrder(order.id, orderRequest).subscribe({
      next: (response) => {
        console.log('Order cancelled successfully:', response);
        this.loadingService.hide();
        this.notificationService.success('Order Cancelled', `Order #ORD-${order.order_id.split('-').pop()} has been cancelled`);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error cancelling order:', error);
        this.loadingService.hide();
        this.notificationService.error('Error', 'Failed to cancel order. Please try again.');
      }
    });
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  viewOrderItems(order: Order): void {
    this.selectedOrderItems = order;
  }

  closeOrderItems(): void {
    this.selectedOrderItems = null;
  }

  printOrder(order: Order): void {
    console.log('Printing order:', order);
    alert(`Printing order ${order.id}...`);
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'PENDING': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'PREPARING': 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      'READY': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      'ON_THE_WAY': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'SERVED': 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      'COMPLETED': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
      'BILLING_REQUESTED': 'px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800',
      'CANCELLED': 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'
    };

    return classes[status as keyof typeof classes] || classes['PENDING'];
  }

  getOrderStatusBadgeClass(order: Order): string {
    switch (order.status) {
      case 'PENDING': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'PREPARING': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'READY': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'ON_THE_WAY': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'SERVED': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'COMPLETED': return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
      case 'CONFIRMED': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600';
      case 'BILLING_REQUESTED': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600';
      case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  trackByOrderId(index: number, order: Order): string {
    return order.order_id;
  }

  // Swipe handling methods
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent): void {
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd(): void {
    const deltaX = this.touchStartX - this.touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        this.swipeToNextFilter();
      } else {
        this.swipeToPreviousFilter();
      }
    }
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  private swipeToNextFilter(): void {
    if (this.orderStatuses.length === 0) return;
    const currentIndex = this.orderStatuses.findIndex(s => s.key === this.activeStatus);
    const nextIndex = (currentIndex + 1) % this.orderStatuses.length;
    this.setActiveStatus(this.orderStatuses[nextIndex].key);
  }

  private swipeToPreviousFilter(): void {
    if (this.orderStatuses.length === 0) return;
    const currentIndex = this.orderStatuses.findIndex(s => s.key === this.activeStatus);
    const prevIndex = currentIndex === 0 ? this.orderStatuses.length - 1 : currentIndex - 1;
    this.setActiveStatus(this.orderStatuses[prevIndex].key);
  }

  // Pagination methods
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterOrders();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1;
    this.filterOrders();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.filterOrders();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStatusCount(status: string): number {
    return this.allOrders.filter(order => order.status === status).length;
  }

  formatOrderTime(createdAt: Date | string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  }

  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getItemsSummary(order: Order): string {
    const groupedItems = this.groupItemsByName(order.items);
    return groupedItems.map(item => `${item.totalQuantity}x ${item.menu_item_name}`).join(', ');
  }

  private groupItemsByName(items: any[]): any[] {
    const grouped = items.reduce((acc, item) => {
      const key = item.menu_item_name;
      if (!acc[key]) {
        acc[key] = { ...item, totalQuantity: 0 };
      }
      acc[key].totalQuantity += item.quantity;
      return acc;
    }, {});
    return Object.values(grouped);
  }

  reloadComponent(): void {
    this.orders = [];
    this.selectedOrder = null;
    this.selectedOrderItems = null;
    this.errorMessage = '';
    this.searchTerm = '';
    this.activeStatus = 'all';
    this.activeStatusLabel = 'All Orders';
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 1;
    this.totalElements = 0;
    this.loadOrders();
  }

  Math = Math;

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.activeStatus !== 'all');
  }

  filterOrders(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeStatus = 'all';
    this.activeStatusLabel = 'All Orders';
    this.currentPage = 1;
    this.filterOrders();
  }

  toggleTheme(): void {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark');
    }
  }
}