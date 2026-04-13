import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { Order, OrderStatus } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';
import { MockDataService } from '../../../services/mock-data.service';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { ConfirmationDialogComponent } from '../../common/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-kitchen-display-mobile',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './kitchen-display-mobile.component.html',
  styleUrls: ['./kitchen-display-mobile.component.css']
})
export class KitchenDisplayMobileComponent implements OnInit, OnDestroy {
  private realtimeService = inject(RealtimeService);
  private mockDataService = inject(MockDataService);
  private crudService = inject(CrudService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationDialogService);
  private subscriptions: Subscription[] = [];

  // Component state
  currentTime: string = '';
  activeStatus: string = 'all';
  activeStatusLabel: string = 'All Orders';
  selectedOrder: Order | null = null;
  selectedOrderItems: Order | null = null;
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Swipe handling
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  // Order statuses for filtering
  orderStatuses: OrderStatus[] = [
    { key: 'all', label: 'All', icon: 'fas fa-list', color: 'bg-gray-500' },
    { key: 'PENDING', label: 'Pending', icon: 'fas fa-clock', color: 'bg-yellow-500' },
    { key: 'PREPARING', label: 'Preparing', icon: 'fas fa-utensils', color: 'bg-orange-500' },
    { key: 'READY', label: 'Ready', icon: 'fas fa-check-double', color: 'bg-green-500' }
  ];

  ngOnInit(): void {
    this.initializeTime();
    this.loadOrders();
    this.setupRealtimeSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeTime(): void {
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

  private loadOrders(): void {
    // Load current orders from API
    this.crudService.getCurrentOrders().subscribe({
      next: (response: any) => {
        this.orders = response || [];
        this.filterOrders();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
        this.filterOrders();
      }
    });
  }

  private setupRealtimeSubscriptions(): void {
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


  setActiveStatus(status: string): void {
    this.activeStatus = status;
    this.activeStatusLabel = this.orderStatuses.find(s => s.key === status)?.label || 'All Orders';
    this.filterOrders();
  }

  private filterOrders(): void {
    if (this.activeStatus === 'all') {
      this.filteredOrders = this.orders.filter(order =>
        ['PENDING', 'PREPARING', 'READY'].includes(order.status)
      );
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.activeStatus);
    }

    // Sort by priority and time
    this.filteredOrders.sort((a, b) => {
      // Priority: PENDING > PREPARING > READY
      const priorityOrder = { 'PENDING': 3, 'PREPARING': 2, 'READY': 1 };
      const priorityDiff = (priorityOrder[b.status as keyof typeof priorityOrder] || 0) -
                           (priorityOrder[a.status as keyof typeof priorityOrder] || 0);

      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation time (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  get activeOrdersCount(): number {
    return this.orders.filter(order =>
      ['PENDING', 'PREPARING', 'READY'].includes(order.status)
    ).length;
  }

  getOrdersByStatus(status: string): Order[] {
    if (status === 'all') {
      return this.orders.filter(order =>
        ['PENDING', 'PREPARING', 'READY'].includes(order.status)
      );
    }
    return this.orders.filter(order => order.status === status);
  }

  // UI Helper Methods
  getStatusButtonClass(status: string): string {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-white text-sm';
    const isActive = this.activeStatus === status;

    if (isActive) {
      return `${baseClass} bg-opacity-100 shadow-lg transform scale-105`;
    }

    const statusConfig = this.orderStatuses.find(s => s.key === status);
    return `${baseClass} ${statusConfig?.color} bg-opacity-80 hover:bg-opacity-100`;
  }

  getStatusCountClass(status: string): string {
    const count = this.getOrdersByStatus(status).length;
    if (count === 0) return 'bg-gray-600 text-gray-300';
    if (count < 3) return 'bg-green-600 text-green-100';
    if (count < 5) return 'bg-yellow-600 text-yellow-100';
    return 'bg-red-600 text-red-100';
  }

  getOrderCardClass(order: Order): string {
    const baseClass = 'transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1';

    // Add animation for urgent orders (preparing > 10 minutes)
    const elapsedMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);
    if (order.status === 'PREPARING' && elapsedMinutes > 10) {
      return `${baseClass} animate-pulse border-2 border-red-500`;
    }

    return baseClass;
  }

  getOrderHeaderClass(order: Order): string {
    const statusColors = {
      'PENDING': 'bg-yellow-500 text-white',
      'CONFIRMED': 'bg-blue-500 text-white',
      'PREPARING': 'bg-orange-500 text-white',
      'READY': 'bg-green-500 text-white',
      'SERVED': 'bg-purple-500 text-white',
      'COMPLETED': 'bg-gray-500 text-white'
    };

    return statusColors[order.status as keyof typeof statusColors] || 'bg-gray-500 text-white';
  }

  getPriorityBadgeClass(order: Order): string {
    const elapsedMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);

    if (elapsedMinutes > 15) return 'bg-red-600 text-white';
    if (elapsedMinutes > 10) return 'bg-orange-600 text-white';
    return 'bg-gray-600 text-white';
  }

  getOrderPriority(order: Order): string {
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

  getElapsedTime(createdAt: Date | string): string {
    const now = Date.now();
    const created = new Date(createdAt).getTime();
    const elapsed = now - created;

    const minutes = Math.floor(elapsed / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  canMoveToNextStatus(order: Order): boolean {
    const statusFlow = ['PENDING', 'PREPARING', 'READY'];
    const currentIndex = statusFlow.indexOf(order.status);

    return currentIndex !== -1 && currentIndex < statusFlow.length - 1;
  }

  getNextStatus(currentStatus: string): string {
    const statusFlow = ['PENDING', 'PREPARING', 'READY'];
    const currentIndex = statusFlow.indexOf(currentStatus);

    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }

    return currentStatus;
  }

  getNextStatusLabel(currentStatus: string): string {
    const labels = {
      'PENDING': 'Start Prep',
      'PREPARING': 'Mark Ready'
    };

    return labels[currentStatus as keyof typeof labels] || 'Update';
  }

  async updateOrderStatus(order: Order, newStatus: string): Promise<void> {
    const action = newStatus === 'CANCELLED' ? 'cancel' : 'update';
    const confirmed = await this.confirmationService.confirm(
      `Are you sure you want to ${action} this order to ${newStatus}?`,
      'Confirm Action'
    );
    if (!confirmed) return;

    // Update local state
    const orderIndex = this.orders.findIndex(o => o.id === order.id);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus as any;
      this.orders[orderIndex].updated_at = new Date();

      // Update all order items status
      this.orders[orderIndex].items.forEach(item => {
        item.status = newStatus as any;
      });

      this.filterOrders();

      // Update order via API
      this.updateOrder(this.orders[orderIndex]);

      // Deduct inventory when order is marked as ready
      if (newStatus === 'READY') {
        this.deductInventoryForOrder(order);
      }

      // Show notification
      this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} status updated to ${newStatus}`);

      // Show browser notification
      this.realtimeService.triggerTestNotification();
    }
  }

  private deductInventoryForOrder(order: Order): void {
    order.items.forEach(orderItem => {
      // Get recipe for this menu item
      const recipe = this.mockDataService.getRecipeByMenuItemId(orderItem.menu_item_id);
      if (recipe) {
        // Calculate ingredient usage based on quantity ordered
        recipe.ingredients.forEach(recipeIngredient => {
          const quantityUsed = recipeIngredient.quantity * orderItem.quantity;
          this.mockDataService.updateInventoryStock(recipeIngredient.ingredientId, quantityUsed);
        });
      }
    });
  }

  private updateOrder(order: Order): void {
    this.loadingService.show();

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

    this.crudService.updateOrder(order.id, orderRequest).subscribe({
      next: (response) => {
        console.log('Order updated successfully:', response);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.loadingService.hide();
      }
    });
  }

  markOrderServed(order: Order): void {
    this.updateOrderStatus(order, 'SERVED');
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  viewOrderItems(order: Order): void {
    this.selectedOrderItems = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  closeOrderItems(): void {
    this.selectedOrderItems = null;
  }

  printOrder(order: Order): void {
    // Simulate printing
    console.log('Printing order:', order);
    alert(`Printing order ${order.id}...`);
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'PENDING': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'PREPARING': 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      'READY': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      'SERVED': 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      'COMPLETED': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
    };

    return classes[status as keyof typeof classes] || classes['PENDING'];
  }

  getOrderStatusBadgeClass(order: Order): string {
    switch (order.status) {
      case 'PENDING': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'PREPARING': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'READY': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'SERVED': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'COMPLETED': return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
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
    const minSwipeDistance = 50; // Minimum distance for swipe

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left - next filter
        this.swipeToNextFilter();
      } else {
        // Swipe right - previous filter
        this.swipeToPreviousFilter();
      }
    }

    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  private swipeToNextFilter(): void {
    const currentIndex = this.orderStatuses.findIndex(s => s.key === this.activeStatus);
    const nextIndex = (currentIndex + 1) % this.orderStatuses.length;
    this.setActiveStatus(this.orderStatuses[nextIndex].key);
  }

  private swipeToPreviousFilter(): void {
    const currentIndex = this.orderStatuses.findIndex(s => s.key === this.activeStatus);
    const prevIndex = currentIndex === 0 ? this.orderStatuses.length - 1 : currentIndex - 1;
    this.setActiveStatus(this.orderStatuses[prevIndex].key);
  }
}
