import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Order } from '../../../services/mock-data.service';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { ValidationService } from '../../../services/validation.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { OrderCardComponent } from '../../common/order-card/order-card.component';
import { ConfirmationDialogComponent } from '../../common/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-owner-orders-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSkeletonLoaderModule, OrderCardComponent, ConfirmationDialogComponent],
  templateUrl: './owner-orders-mobile.component.html',
  styleUrl: './owner-orders-mobile.component.css'
})

export class OwnerOrdersMobileComponent implements OnInit {
  orders: Order[] = [];
  allOrders: Order[] = []; // Store full list for filtering
  selectedOrder: Order | null = null;
  selectedOrderItems: Order | null = null;
  userRole: string = 'waiter';
  errorMessage = '';
  searchTerm = '';

  activeStatus: string = 'all';
  activeStatusLabel: string = 'All Orders';

  // Swipe handling
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  // Order statuses for filtering
  orderStatuses = [
    { key: 'all', label: 'All', icon: 'fas fa-list', color: 'bg-gray-500' },
    { key: 'PENDING', label: 'Pending', icon: 'fas fa-clock', color: 'bg-yellow-500' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: 'fas fa-check-circle', color: 'bg-teal-500' },
    { key: 'PREPARING', label: 'Preparing', icon: 'fas fa-utensils', color: 'bg-orange-500' },
    { key: 'READY', label: 'Ready', icon: 'fas fa-check-double', color: 'bg-green-500' },
    { key: 'ON_THE_WAY', label: 'On the Way', icon: 'fas fa-user-tie', color: 'bg-blue-500' },
    { key: 'SERVED', label: 'Served', icon: 'fas fa-utensils', color: 'bg-purple-500' },
    { key: 'BILLING_REQUESTED', label: 'Billing Requested', icon: 'fas fa-file-invoice-dollar', color: 'bg-indigo-500' },
    { key: 'COMPLETED', label: 'Completed', icon: 'fas fa-check', color: 'bg-gray-500' },
    { key: 'CANCELLED', label: 'Cancelled', icon: 'fas fa-times', color: 'bg-red-500' }
  ];
  isLoading: boolean = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalElements = 0;
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50];

  // Status options for filtering
  statusOptions = [
    { value: 'PENDING', label: 'Pending', icon: 'fas fa-clock' },
    { value: 'PREPARING', label: 'Preparing', icon: 'fas fa-utensils' },
    { value: 'READY', label: 'Ready', icon: 'fas fa-check-circle' },
    { value: 'ON_THE_WAY', label: 'On the Way', icon: 'fas fa-user-tie' },
    { value: 'SERVED', label: 'Served', icon: 'fas fa-utensils' },
    { value: 'COMPLETED', label: 'Completed', icon: 'fas fa-check' },
    { value: 'CONFIRMED', label: 'Confirmed', icon: 'fas fa-check-circle' },
    { value: 'BILLING_REQUESTED', label: 'Billing Requested', icon: 'fas fa-file-invoice-dollar' },
    { value: 'CANCELLED', label: 'Cancelled', icon: 'fas fa-times' }
  ];

  constructor(
    private crudService: CrudService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private validationService: ValidationService,
    private confirmationService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.crudService.getCurrentOrders().subscribe({
      next: (response: any) => {
        this.allOrders = response || [];
        // Apply client-side filtering and pagination
        this.applyFiltersAndPagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.notificationService.error('Error', 'Failed to load orders');
        this.isLoading = false;
        this.orders = [];
        this.allOrders = [];
      }
    });
  }

  private applyFiltersAndPagination(): void {
    let filteredOrders = this.allOrders;

    if (this.searchTerm.trim()) {
      filteredOrders = filteredOrders.filter(order => order.order_id.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    if (this.activeStatus !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === this.activeStatus);
    }

    this.totalElements = filteredOrders.length;
    this.totalPages = Math.ceil(this.totalElements / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.orders = filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }



  filterOrders(): void {
    this.currentPage = 1; // Reset to first page
    this.applyFiltersAndPagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeStatus = 'all';
    this.activeStatusLabel = 'All Orders';
    this.currentPage = 1; // Reset to first page
    this.applyFiltersAndPagination();
  }

  setActiveStatus(status: string): void {
    this.activeStatus = status;
    this.activeStatusLabel = this.orderStatuses.find(s => s.key === status)?.label || 'All Orders';
    this.filterOrders();
  }

  onSearchChange(): void {
    this.applyFiltersAndPagination();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage = newLimit;
    this.currentPage = 1; // Reset to first page
    this.applyFiltersAndPagination();
  }

  onItemsPerPageChange(event: any): void {
    this.itemsPerPage = +event.target.value;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
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

  getOrderStatusBorderClass(order: Order): string {
    // Not used since we have fixed red border, but keeping for consistency
    return 'border-red-500';
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

  getOrderStatusText(order: Order): string {
    switch (order.status) {
      case 'PENDING': return 'Pending';
      case 'PREPARING': return 'Preparing';
      case 'READY': return 'Ready';
      case 'ON_THE_WAY': return 'On the Way';
      case 'SERVED': return 'Served';
      case 'COMPLETED': return 'Completed';
      case 'CONFIRMED': return 'Confirmed';
      case 'BILLING_REQUESTED': return 'Billing Requested';
      case 'CANCELLED': return 'Cancelled';
      default: return order.status;
    }
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
    return order.items.map(item => `${item.quantity}x ${item.menu_item_name}`).join(', ');
  }

  viewOrder(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  reloadComponent(): void {
    // Reset all component state
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

    // Reload data
    this.loadOrders();
  }

  // Helper for template Math operations
  Math = Math;

  // Check if any filters are currently active
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm?.trim() || this.activeStatus !== 'all');
  }

  async markCompleted(order: Order): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to mark this order as Completed?',
      'Confirm Action'
    );
    if (!confirmed) return;

    order.status = 'COMPLETED';
    order.updated_at = new Date();
    this.updateOrder(order);
    this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} marked as Completed`);
  }

  async cancelOrder(order: Order): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.',
      'Cancel Order'
    );
    if (!confirmed) return;

    order.status = 'CANCELLED';
    order.updated_at = new Date();
    this.updateOrder(order);
    this.notificationService.success('Order Cancelled', `Order #ORD-${order.order_id.split('-').pop()} has been cancelled`);
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
        // Update local order
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...order };
        }
        // Update in allOrders
        const allIndex = this.allOrders.findIndex(o => o.id === order.id);
        if (allIndex !== -1) {
          this.allOrders[allIndex] = { ...this.allOrders[allIndex], ...order };
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.notificationService.error('Update Failed', 'Failed to update order status. Please try again.');
        this.loadingService.hide();
      }
    });
  }

  getStatusButtonClass(status: string): string {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-colors flex items-center text-sm border';
    const isActive = this.activeStatus === status;

    if (isActive) {
      const statusConfig = this.orderStatuses.find(s => s.key === status);
      const colorBase = statusConfig?.color.replace('bg-', '');
      return `${baseClass} bg-transparent border-${colorBase} text-${colorBase}`;
    }

    const statusConfig = this.orderStatuses.find(s => s.key === status);
    return `${baseClass} ${statusConfig?.color} bg-opacity-80 hover:bg-opacity-100 text-white border-transparent`;
  }

  getStatusCountClass(status: string): string {
    const count = this.getOrdersByStatus(status).length;
    if (count === 0) return 'bg-gray-600 text-gray-300';
    if (count < 3) return 'bg-green-600 text-green-100';
    if (count < 5) return 'bg-yellow-600 text-yellow-100';
    return 'bg-red-600 text-red-100';
  }

  getOrdersByStatus(status: string): Order[] {
    if (status === 'all') {
      return this.allOrders;
    }
    return this.allOrders.filter(order => order.status === status);
  }

  getOrderCardClass(order: Order): string {
    const baseClass = 'transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1';
    const elapsedMinutes = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60);
    if (order.status === 'ON_THE_WAY' && elapsedMinutes > 10) {
      return `${baseClass} animate-pulse border-2 border-red-500`;
    }
    return baseClass;
  }

  getOrderHeaderClass(order: Order): string {
    const statusColors = {
      'PENDING': 'bg-yellow-500 text-white',
      'CONFIRMED': 'bg-teal-500 text-white',
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

  trackByOrderId(index: number, order: Order): string {
    return order.order_id;
  }

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
    const currentIndex = this.orderStatuses.findIndex(s => s.key === this.activeStatus);
    const nextIndex = (currentIndex + 1) % this.orderStatuses.length;
    this.setActiveStatus(this.orderStatuses[nextIndex].key);
  }

  private swipeToPreviousFilter(): void {
    const currentIndex = this.orderStatuses.findIndex(s => s.key === this.activeStatus);
    const prevIndex = currentIndex === 0 ? this.orderStatuses.length - 1 : currentIndex - 1;
    this.setActiveStatus(this.orderStatuses[prevIndex].key);
  }

  printOrder(order: Order): void {
    console.log('Printing order:', order);
    alert(`Printing order ${order.id}...`);
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'PREPARING': 'px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800',
      'READY': 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      'ON_THE_WAY': 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      'SERVED': 'px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800',
      'COMPLETED': 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
    };
    return classes[status as keyof typeof classes] || classes['PREPARING'];
  }

  viewOrderItems(order: Order): void {
    this.selectedOrderItems = order;
  }

  closeOrderItems(): void {
    this.selectedOrderItems = null;
  }
}