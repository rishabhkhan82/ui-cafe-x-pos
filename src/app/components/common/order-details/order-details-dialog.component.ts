import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../services/mock-data.service';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-details-dialog.component.html',
  styleUrl: './order-details-dialog.component.css'
})
export class OrderDetailsDialogComponent {
  @Input() order!: Order;
  @Input() userRole: string = 'waiter';

  @Output() closeDialog = new EventEmitter<void>();
  @Output() markOnTheWay = new EventEmitter<Order>();
  @Output() markServed = new EventEmitter<Order>();

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

  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  onMarkOnTheWay(): void {
    this.markOnTheWay.emit(this.order);
    this.closeDialog.emit();
  }

  onMarkServed(): void {
    this.markServed.emit(this.order);
    this.closeDialog.emit();
  }

  canMarkAsOnTheWay(): boolean {
    return this.order.status === 'READY';
  }

  canMarkAsServed(): boolean {
    return this.order.status === 'ON_THE_WAY';
  }
}