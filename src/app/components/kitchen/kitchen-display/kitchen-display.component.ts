import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { Order } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';
import { MockDataService } from '../../../services/mock-data.service';

interface OrderStatus {
  key: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-kitchen-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-display.component.html',
  styleUrls: ['./kitchen-display.component.css']
})
export class KitchenDisplayComponent implements OnInit, OnDestroy {
  private realtimeService = inject(RealtimeService);
  private mockDataService = inject(MockDataService);
  private subscriptions: Subscription[] = [];

  // Component state
  currentTime: string = '';
  activeStatus: string = 'all';
  activeStatusLabel: string = 'All Orders';
  selectedOrder: Order | null = null;
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Order statuses for filtering
  orderStatuses: OrderStatus[] = [
    { key: 'all', label: 'All Orders', icon: 'fas fa-list', color: 'bg-gray-500' },
    { key: 'pending', label: 'Pending', icon: 'fas fa-clock', color: 'bg-yellow-500' },
    { key: 'confirmed', label: 'Confirmed', icon: 'fas fa-check-circle', color: 'bg-blue-500' },
    { key: 'preparing', label: 'Preparing', icon: 'fas fa-utensils', color: 'bg-orange-500' },
    { key: 'ready', label: 'Ready', icon: 'fas fa-check-double', color: 'bg-green-500' }
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
    // Load orders from mock data service
    // For now, we'll simulate with some sample orders
    this.orders = this.getSampleOrders();
    this.filterOrders();
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

  private getSampleOrders(): Order[] {
    const now = new Date();
    return [
      {
        id: 'ORD-2025-1045',
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
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
        estimatedReadyTime: new Date(now.getTime() + 15 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1044',
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
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 45 * 60 * 1000),
        estimatedReadyTime: new Date(now.getTime() - 10 * 60 * 1000)
      },
      {
        id: 'ORD-2025-1043',
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
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000)
      }
    ];
  }

  setActiveStatus(status: string): void {
    this.activeStatus = status;
    this.activeStatusLabel = this.orderStatuses.find(s => s.key === status)?.label || 'All Orders';
    this.filterOrders();
  }

  private filterOrders(): void {
    if (this.activeStatus === 'all') {
      this.filteredOrders = this.orders.filter(order =>
        ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
      );
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.activeStatus);
    }

    // Sort by priority and time
    this.filteredOrders.sort((a, b) => {
      // Priority: pending > confirmed > preparing > ready
      const priorityOrder = { 'pending': 4, 'confirmed': 3, 'preparing': 2, 'ready': 1 };
      const priorityDiff = (priorityOrder[b.status as keyof typeof priorityOrder] || 0) -
                          (priorityOrder[a.status as keyof typeof priorityOrder] || 0);

      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation time (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  get activeOrdersCount(): number {
    return this.orders.filter(order =>
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    ).length;
  }

  getOrdersByStatus(status: string): Order[] {
    if (status === 'all') {
      return this.orders.filter(order =>
        ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
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

    // Add animation for urgent orders (confirmed > 10 minutes)
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
    if (order.status === 'confirmed' && elapsedMinutes > 10) {
      return `${baseClass} animate-pulse border-2 border-red-500`;
    }

    return baseClass;
  }

  getOrderHeaderClass(order: Order): string {
    const statusColors = {
      'pending': 'bg-yellow-500 text-white',
      'confirmed': 'bg-blue-500 text-white',
      'preparing': 'bg-orange-500 text-white',
      'ready': 'bg-green-500 text-white',
      'served': 'bg-purple-500 text-white',
      'completed': 'bg-gray-500 text-white'
    };

    return statusColors[order.status as keyof typeof statusColors] || 'bg-gray-500 text-white';
  }

  getPriorityBadgeClass(order: Order): string {
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);

    if (elapsedMinutes > 15) return 'bg-red-600 text-white';
    if (elapsedMinutes > 10) return 'bg-orange-600 text-white';
    return 'bg-gray-600 text-white';
  }

  getOrderPriority(order: Order): string {
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);

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
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready'];
    const currentIndex = statusFlow.indexOf(order.status);

    return currentIndex !== -1 && currentIndex < statusFlow.length - 1;
  }

  getNextStatus(currentStatus: string): string {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready'];
    const currentIndex = statusFlow.indexOf(currentStatus);

    if (currentIndex !== -1 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }

    return currentStatus;
  }

  getNextStatusLabel(currentStatus: string): string {
    const labels = {
      'pending': 'Confirm',
      'confirmed': 'Start Prep',
      'preparing': 'Mark Ready'
    };

    return labels[currentStatus as keyof typeof labels] || 'Update';
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    // Update local state
    const orderIndex = this.orders.findIndex(o => o.id === order.id);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = newStatus as any;
      this.orders[orderIndex].updatedAt = new Date();

      // Update all order items status
      this.orders[orderIndex].items.forEach(item => {
        item.status = newStatus as any;
      });

      this.filterOrders();

      // Deduct inventory when order is marked as ready
      if (newStatus === 'ready') {
        this.deductInventoryForOrder(order);
      }

      // Show browser notification
      this.realtimeService.triggerTestNotification();
    }
  }

  private deductInventoryForOrder(order: Order): void {
    order.items.forEach(orderItem => {
      // Get recipe for this menu item
      const recipe = this.mockDataService.getRecipeByMenuItemId(orderItem.menuItemId);
      if (recipe) {
        // Calculate ingredient usage based on quantity ordered
        recipe.ingredients.forEach(recipeIngredient => {
          const quantityUsed = recipeIngredient.quantity * orderItem.quantity;
          this.mockDataService.updateInventoryStock(recipeIngredient.ingredientId, quantityUsed);
        });
      }
    });
  }

  markOrderServed(order: Order): void {
    this.updateOrderStatus(order, 'served');
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  printOrder(order: Order): void {
    // Simulate printing
    console.log('Printing order:', order);
    alert(`Printing order ${order.id}...`);
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'pending': 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      'confirmed': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'preparing': 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      'ready': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      'served': 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      'completed': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
    };

    return classes[status as keyof typeof classes] || classes['pending'];
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }
}
