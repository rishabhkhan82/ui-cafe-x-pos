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
import { OrderDetailsDialogComponent } from '../../common/order-details/order-details-dialog.component';
import { ConfirmationDialogComponent } from '../../common/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-waiter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSkeletonLoaderModule, OrderCardComponent, OrderDetailsDialogComponent, ConfirmationDialogComponent],
  templateUrl: './waiter-dashboard.component.html',
  styleUrl: './waiter-dashboard.component.css'
})
export class WaiterDashboardComponent implements OnInit {
  orders: Order[] = [];
  allOrders: Order[] = []; // Store full list for filtering
  selectedOrder: Order | null = null;
  showOrderDetailsModal: boolean = false;
  userRole: string = 'waiter';
  errorMessage = '';
  searchTerm = '';
  statusFilter = 'READY';
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

    if (this.searchTerm && this.searchTerm.trim()) {
      filteredOrders = filteredOrders.filter(order =>
        order.customer_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === this.statusFilter);
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
    this.statusFilter = 'READY';
    this.currentPage = 1; // Reset to first page
    this.applyFiltersAndPagination();
  }

  selectStatus(status: string): void {
    this.statusFilter = status;
    this.filterOrders();
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
    this.showOrderDetailsModal = true;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.showOrderDetailsModal = false;
  }

  reloadComponent(): void {
    // Reset all component state
    this.orders = [];
    this.selectedOrder = null;
    this.showOrderDetailsModal = false;
    this.errorMessage = '';
    this.searchTerm = '';
    this.statusFilter = 'READY';
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
    return !!(this.searchTerm?.trim() || this.statusFilter !== 'READY');
  }

  async markOnTheWay(order: Order): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to mark this order as On the Way?',
      'Confirm Action'
    );
    if (!confirmed) return;

    order.status = 'ON_THE_WAY';
    order.updated_at = new Date();
    this.updateOrder(order);
    this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} marked as On the Way`);
  }

  async markServed(order: Order): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      'Are you sure you want to mark this order as Served?',
      'Confirm Action'
    );
    if (!confirmed) return;

    order.status = 'SERVED';
    order.updated_at = new Date();
    this.updateOrder(order);
    this.notificationService.success('Order Updated', `Order #ORD-${order.order_id.split('-').pop()} marked as Served`);
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
}
