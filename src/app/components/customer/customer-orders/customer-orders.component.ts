import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { CrudService } from '../../../services/crud.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';
import { Order, OrderItem, OfferRedemptionRecord } from '../../../services/mock-data.service';
import { MenuItem } from '../../../interfaces';
import { PendingordersService } from '../../../services/pendingorders.service';
import { PendingBillsService } from '../../../services/pending-bills.service';
import { environment } from '../../../environments/environment';

interface EligibleOffer {
  id: string;
  title: string;
  description: string;
  type: string;
  typeLabel: string;
  code: string;
  validUntil: string;
  expiresSoon: boolean;
  offerId: string;
  minOrderValue?: number;
  discountValue?: number;
}

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimateOnScrollDirective],
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.css'
})
export class CustomerOrdersComponent implements OnInit {
  private crudService = inject(CrudService);
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationDialogService);
  private pendingOrdersService = inject(PendingordersService);
  private pendingBillsService = inject(PendingBillsService);

  currentUser: any = null;
  userRole: string = 'customer';

  activeOrders: Order[] = [];
  orderHistory: Order[] = [];
  allOrderHistory: Order[] = [];
  private menuItems: MenuItem[] = [];
  selectedOrder: Order | null = null;
  showOrderDetails = false;
  showAllOrderHistory = false;
  eligibleOffers: EligibleOffer[] = [];
  cartItemCount = 0;
  isLoading = false;
  isOrderHistoryLoading = false;
  isAllOrderHistoryLoading = false;
  isRequestingBilling = false;
  private lastWaiterCallTime: number | null = null;
  private readonly waiterCooldownMs = 10 * 60 * 1000;
  blinkState = true;
  private blinkTimerId: any = null;
  generatedInvoiceId: string | null = null;

  invoiceSubtotal = 0;
  invoiceGst = 0;
  invoiceDiscount = 0;
  invoiceLoyaltyDiscount = 0;
  invoiceTotal = 0;
  appliedOffer: EligibleOffer | null = null;
  loyaltyPointsBalance = 0;
  maxLoyaltyPoints = 0;
  loyaltyPointsToRedeem = 0;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);
    this.userRole = this.currentUser ? this.currentUser.role : 'owner';
    console.log('User role:', this.userRole);
    this.loadActiveOrders();
    this.loadOrderHistory();
    this.loadAllMenuItems();
    this.loadLoyaltyProgram();
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.cartItemCount;
    });
    this.loadEligibleOffers();
  }

  private loadAllMenuItems(): void {
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id') || '1';
    this.crudService.getMenuItems({
      page: 1,
      size: 999,
      restaurant_id: restaurantId
    }).subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          this.menuItems = response.data;
        } else if (Array.isArray(response)) {
          this.menuItems = response;
        } else {
          this.menuItems = [];
        }
      },
      error: () => {
        this.menuItems = [];
      }
    });
  }

  private getMenuItemById(id: number): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  private loadActiveOrders(): void {
    this.isLoading = true;
    this.crudService.getActiveOrders().subscribe({
      next: (response: any) => {
        const allOrders = response || [];
        this.activeOrders = allOrders
          .filter((o: Order) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
          .sort((a: Order, b: Order) => {
            const aServed = a.status === 'SERVED' ? 1 : -1;
            const bServed = b.status === 'SERVED' ? 1 : -1;
            if (aServed !== bServed) return aServed - bServed;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
        this.isLoading = false;
        if (!this.isBillingRequested) {
          this.pendingBillsService.setPendingBilling(false);
        }
        if (this.isBillingRequested && !this.generatedInvoiceId && this.activeOrders.length > 0) {
          this.generatedInvoiceId = this.activeOrders[0].invoice_id || null;
          this.pendingBillsService.setPendingBilling(true);
        }
        this.pendingOrdersService.updateCount(this.activeOrders.length);
        this.calculateInvoice();
      },
      error: () => {
        this.activeOrders = [];
        this.isLoading = false;
        this.pendingBillsService.setPendingBilling(false);
        this.pendingOrdersService.updateCount(0);
        this.calculateInvoice();
      }
    });
  }

  private loadEligibleOffers(): void {
    const currentUser = this.authService.getCurrentUser();
    const customerId = currentUser?.id;
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');

    const params: any = { is_active: 'true', page: 1, size: 50 };
    if (restaurantId) params.restaurant_id = restaurantId;

    this.crudService.getCustomerOffers(params).subscribe({
      next: (response: any) => {
        const offers = response?.data || [];
        const clientNow = new Date();
        const activeOffers = offers
          .filter((o: any) => {
            const start = o.start_date ? new Date(o.start_date) : null;
            const end = o.end_date ? new Date(o.end_date) : null;
            return (!start || start <= clientNow) && (!end || end >= clientNow);
          })
          .map((o: any) => this.mapApiOfferToEligibleOffer(o));

        if (!customerId) {
          this.eligibleOffers = activeOffers;
          return;
        }

        this.crudService.getOfferRedemptionsByCustomer(customerId).subscribe({
          next: (redemptions) => {
            const redemptionList = Array.isArray(redemptions) ? redemptions : (redemptions?.data || []);
            const redeemedOfferIds = new Set(
              redemptionList.map((r: any) => String(r.offer_id ?? r.offer?.id ?? 0))
            );
            this.eligibleOffers = activeOffers.filter(
              (o: EligibleOffer) => !redeemedOfferIds.has(String(o.offerId))
            );
          },
          error: () => {
            this.eligibleOffers = activeOffers;
          }
        });
      },
      error: () => {
        this.eligibleOffers = [];
      }
    });
  }

  private mapApiOfferToEligibleOffer(o: any): EligibleOffer {
    const typeMap: Record<string, string> = {
      percentage: 'Discount',
      fixed: 'Flat Off',
      buy_one_get_one: 'BOGO',
      free_item: 'Free Item',
    };
    const end = o.end_date ? new Date(o.end_date) : null;
    const now = new Date();
    const expiresSoon = end ? (end.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000) : false;

    return {
      id: String(o.id),
      title: o.title,
      description: o.description,
      type: o.type,
      typeLabel: typeMap[o.type] || o.type,
      code: o.code || o.offer_id,
      validUntil: end ? end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing',
      expiresSoon,
      offerId: String(o.id),
      minOrderValue: o.min_order_value,
      discountValue: o.discount_value,
    };
  }

  private loadOrderHistory(): void {
    this.isOrderHistoryLoading = true;
    this.crudService.getOrders({ status: 'COMPLETED', page: 1, size: 10 }).subscribe({
      next: (response: any) => {
        this.orderHistory = response?.data || [];
        this.isOrderHistoryLoading = false;
      },
      error: () => {
        this.orderHistory = [];
        this.isOrderHistoryLoading = false;
      }
    });
  }

  private loadLoyaltyProgram(): void {
    const currentUser = this.authService.getCurrentUser();
    const customerId = currentUser?.id;
    if (!customerId) {
      this.loyaltyPointsBalance = 0;
      this.maxLoyaltyPoints = 0;
      this.loyaltyPointsToRedeem = 0;
      return;
    }
    this.crudService.getLoyaltyProgramByCustomer(customerId).subscribe({
      next: (response: any) => {
        if (response && !Array.isArray(response)) {
          this.loyaltyPointsBalance = response.points_balance || 0;
          this.maxLoyaltyPoints = this.loyaltyPointsBalance;
        } else {
          this.loyaltyPointsBalance = 0;
          this.maxLoyaltyPoints = 0;
        }
      },
      error: () => {
        this.loyaltyPointsBalance = 0;
        this.maxLoyaltyPoints = 0;
      }
    });
  }

  private calculateInvoice(): void {
    const preTaxSubtotal = this.activeOrders.reduce((sum, o) => {
      return sum + (o.total_amount || 0) - (o.tax_amount || 0) + (o.discount_amount || 0) + (o.loyalty_discount_amount || 0);
    }, 0);

    const totalTax = this.activeOrders.reduce((sum, o) => sum + (o.tax_amount || 0), 0);

    this.invoiceSubtotal = preTaxSubtotal;
    this.invoiceGst = Math.round(totalTax);
    if (!this.isBillingRequested) {
      this.invoiceDiscount = 0;
    } else if (!this.appliedOffer) {
      this.invoiceDiscount = Math.round(this.activeOrders.reduce((sum, o) => sum + (o.discount_amount || 0), 0) * 100) / 100;
    }
    if (this.appliedOffer) {
      if (this.appliedOffer.type === 'percentage') {
        this.invoiceDiscount = Math.round(preTaxSubtotal * (this.appliedOffer.discountValue || 0) / 100);
      } else if (this.appliedOffer.type === 'fixed') {
        this.invoiceDiscount = Math.min(this.appliedOffer.discountValue || 0, preTaxSubtotal);
      }
    }
    const fromOrders = Math.round(this.activeOrders.reduce((sum, o) => sum + (o.loyalty_discount_amount || 0), 0) * 100) / 100;
    if (fromOrders > 0) {
      this.invoiceLoyaltyDiscount = fromOrders;
    }
    this.invoiceTotal = Math.round((preTaxSubtotal + totalTax - this.invoiceDiscount - this.invoiceLoyaltyDiscount) * 100) / 100;
  }

  applyOffer(offer: EligibleOffer): void {
    this.appliedOffer = offer;
    this.calculateInvoice();
    this.notificationService.success('Offer Applied', `${offer.title} has been applied to your bill`);
  }

  applyLoyalty(): void {
    if (this.activeOrders.length === 0) return;
    const redeemableValue = Math.floor(this.loyaltyPointsToRedeem / 100);
    if (redeemableValue <= 0) {
      this.invoiceLoyaltyDiscount = 0;
      this.invoiceTotal = Math.round((this.invoiceSubtotal + this.invoiceGst - this.invoiceDiscount) * 100) / 100;
      return;
    }
    this.invoiceLoyaltyDiscount = Math.round(redeemableValue * 100) / 100;
    this.invoiceTotal = Math.round((this.invoiceSubtotal + this.invoiceGst - this.invoiceDiscount - this.invoiceLoyaltyDiscount) * 100) / 100;
  }

  removeAppliedOffer(): void {
    this.appliedOffer = null;
    this.calculateInvoice();
    this.notificationService.info('Offer Removed', 'Offer has been removed from your bill');
  }

  canRequestBilling(): boolean {
    if (this.activeOrders.length === 0 || this.isRequestingBilling) return false;
    return this.activeOrders.every(o => o.status === 'SERVED');
  }

  get isBillingRequested(): boolean {
    return this.activeOrders.length > 0 && this.activeOrders.every(o => o.status === 'BILLING_REQUESTED');
  }

  requestBilling(): void {
    if (!this.canRequestBilling()) return;

    this.generatedInvoiceId = this.generateInvoiceId();

    const totalPreTax = this.invoiceSubtotal;
    const totalDiscount = this.invoiceDiscount || 0;
    const discountAllocations = new Map<number, number>();
    if (totalPreTax > 0 && totalDiscount > 0 && this.activeOrders.length > 0) {
      const ordersCount = this.activeOrders.length;
      const isFixed = this.appliedOffer?.type === 'fixed';

      if (isFixed) {
        let allocated = 0;
        this.activeOrders.forEach((order, index) => {
          const isLast = index === ordersCount - 1;
          const raw = totalDiscount / ordersCount;
          const rounded = Math.round(raw * 100) / 100;
          const adjust = isLast ? Math.round((totalDiscount - allocated) * 100) / 100 : rounded;
          discountAllocations.set(order.id, Math.max(0, adjust));
          allocated += Math.max(0, adjust);
        });
      } else {
        let allocated = 0;
        this.activeOrders.forEach((order, index) => {
          const orderPreTax = (order.total_amount || 0) - (order.tax_amount || 0);
          const isLast = index === ordersCount - 1;
          const raw = totalDiscount * (orderPreTax / totalPreTax);
          const rounded = Math.round(raw * 100) / 100;
          const adjust = isLast ? Math.round((totalDiscount - allocated) * 100) / 100 : rounded;
          discountAllocations.set(order.id, Math.max(0, adjust));
          allocated += Math.max(0, adjust);
        });
      }
    }

    const totalLoyaltyDiscount = this.invoiceLoyaltyDiscount || 0;
    const loyaltyAllocations = new Map<number, number>();
    if (totalLoyaltyDiscount > 0 && this.activeOrders.length > 0) {
      let allocated = 0;
      const ordersCount = this.activeOrders.length;
      this.activeOrders.forEach((order, index) => {
        const isLast = index === ordersCount - 1;
        const raw = totalLoyaltyDiscount / ordersCount;
        const rounded = Math.round(raw * 100) / 100;
        const adjust = isLast ? Math.round((totalLoyaltyDiscount - allocated) * 100) / 100 : rounded;
        loyaltyAllocations.set(order.id, Math.max(0, adjust));
        allocated += Math.max(0, adjust);
      });
    }

    this.confirmationService.confirm(
      `Request billing for ₹${this.invoiceTotal}?\nInvoice ID: ${this.generatedInvoiceId}`,
      'Confirm Billing'
    ).then(confirmed => {
      if (!confirmed) { this.generatedInvoiceId = null; return; }
      this.isRequestingBilling = true;

      let completed = 0;
      const total = this.activeOrders.length;

      this.activeOrders.forEach(order => {
        const orderDiscount = discountAllocations.get(order.id) || 0;
        const orderLoyaltyDiscount = loyaltyAllocations.get(order.id) || 0;
        const orderPreTax = (order.total_amount || 0) - (order.tax_amount || 0) + (order.discount_amount || 0);
        const orderNewTotal = Math.round((orderPreTax - orderDiscount - orderLoyaltyDiscount + (order.tax_amount || 0)) * 100) / 100;

        const orderRequest: any = {
          order_id: order.order_id,
          customer_name: order.customer_name,
          table_number: order.table_number,
          status: 'BILLING_REQUESTED',
          total_amount: orderNewTotal,
          special_instructions: order.special_instructions,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          order_type: order.order_type,
          priority: order.priority,
          tax_amount: order.tax_amount,
          discount_amount: orderDiscount,
          loyalty_discount_amount: orderLoyaltyDiscount,
          invoice_id: this.generatedInvoiceId,
          order_items: order.items.map(item => ({
            id: item.id,
            order_id: item.order_id,
            menu_item_id: item.menu_item_id,
            menu_item_name: item.menu_item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            category: item.category,
            special_instructions: item.special_instructions,
            status: 'BILLING_REQUESTED'
          }))
        };

        this.crudService.updateOrder(order.id, orderRequest).subscribe({
                  next: () => {
                    completed++;
                    if (completed === total) {
                      this.notificationService.success(
                        'Billing Generated',
                        `Your bill of ₹${this.invoiceTotal} has been generated, please show this at counter and pay`
                      );
                      this.pendingBillsService.setPendingBilling(true);
                      this.loadActiveOrders();

                      if (this.invoiceLoyaltyDiscount > 0 && this.activeOrders.length > 0) {
                        const firstOrder = this.activeOrders[0];
                        const pointsToRedeem = Math.round(this.invoiceLoyaltyDiscount * 100);

                        this.crudService.getLoyaltyProgramByCustomer(firstOrder.customer_id).subscribe({
                          next: (program: any) => {
                            const balanceBefore = program?.points_balance || 0;
                            const balanceAfter = Math.max(0, balanceBefore - pointsToRedeem);

                            const redeemPayload: any = {
                              transaction_id: '',
                              customer_id: firstOrder.customer_id,
                              restaurant_id: firstOrder.restaurant_id,
                              transaction_type: 'REDEEMED',
                              points: pointsToRedeem,
                              balance_before: balanceBefore,
                              balance_after: balanceAfter,
                              order_id: String(firstOrder.id),
                              invoice_id: this.generatedInvoiceId,
                              description: `Redeemed ${pointsToRedeem} points for ₹${this.invoiceLoyaltyDiscount} discount`,
                              processed_by: firstOrder.customer_id,
                              processed_at: new Date().toISOString(),
                              created_at: new Date().toISOString(),
                              created_by: firstOrder.customer_id,
                              approval_required: false,
                              is_reversal: false
                            };
                            this.crudService.createLoyaltyTransaction(redeemPayload).subscribe({
                              next: () => this.loadActiveOrders(),
                              error: (err) => {
                                console.error('Loyalty redeem transaction failed:', err);
                                this.loadActiveOrders();
                              }
                            });
                          },
                          error: (err) => {
                            console.error('Failed to fetch loyalty program for redeem:', err);
                            this.loadActiveOrders();
                          }
                        });
                       } else {
                         this.loadActiveOrders();
                       }

                       if (this.appliedOffer && this.activeOrders.length > 0) {
                         const firstOrder = this.activeOrders[0];
                         const redemptionPayload: OfferRedemptionRecord = {
                           id: '',
                           redemption_id: '',
                           offer_id: +this.appliedOffer.id,
                           invoice_id: this.generatedInvoiceId,
                           order_id: firstOrder.id,
                           customer_id: firstOrder.customer_id,
                           restaurant_id: firstOrder.restaurant_id,
                           redemption_code: this.appliedOffer.code,
                           discount_amount: this.invoiceDiscount || 0,
                           original_amount: this.invoiceSubtotal + (this.invoiceGst || 0),
                           final_amount: this.invoiceTotal,
                           redemption_method: 'BILLING_REQUESTED',
                           applied_by: firstOrder.customer_id,
                           applied_at: new Date(),
                           created_at: new Date(),
                           device_type: 'MOBILE',
                           platform: 'WEB',
                           is_first_time: true,
                           usage_count: 1,
                           customer_lifetime_value: this.invoiceTotal
                         };
                         this.crudService.createOfferRedemption(redemptionPayload).subscribe({
                           next: () => this.loadActiveOrders(),
                           error: (err) => {
                             console.error('Offer redemption failed:', err);
                             this.loadActiveOrders();
                           }
                         });
                       }
                     }
                  },
          error: () => {
            completed++;
            this.isRequestingBilling = false;
            if (completed === total) {
              this.notificationService.error('Error', 'Some orders could not be updated. Please try again.');
            }
          }
        });
      });
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  closeOrderDetails(): void {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  openAllOrderHistory(): void {
    this.showAllOrderHistory = true;
    this.isAllOrderHistoryLoading = true;
    this.allOrderHistory = [];
    this.crudService.getOrders({ status: 'COMPLETED', page: 1, size: 9999 }).subscribe({
      next: (response: any) => {
        this.allOrderHistory = response?.data || [];
        this.isAllOrderHistoryLoading = false;
      },
      error: () => {
        this.allOrderHistory = [];
        this.isAllOrderHistoryLoading = false;
      }
    });
  }

  closeAllOrderHistory(): void {
    this.showAllOrderHistory = false;
    this.allOrderHistory = [];
  }

  generateInvoiceId(): string {
    const currentUser = this.authService.getCurrentUser();
    const customerId = currentUser?.id ?? '0';
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INV-${datePart}-CUST${customerId}-${randomSuffix}`;
  }

  helpWithOrder(): void {
    alert('Help with order - would open support chat');
  }

  callWaiter(order: Order): void {
    if (!this.canCallWaiterForOrder(order)) return;
    this.lastWaiterCallTime = Date.now();
    localStorage.setItem('lastWaiterCallTime', String(this.lastWaiterCallTime));
    alert('Waiter has been called. Please wait.');
  }

  canCallWaiterForOrder(order: Order): boolean {
    if (order.status === 'SERVED') return false;
    const stored = localStorage.getItem('lastWaiterCallTime');
    const lastCall = stored ? Number(stored) : null;
    if (!lastCall) return true;
    return (Date.now() - lastCall) >= this.waiterCooldownMs;
  }

  getWaiterCooldownRemaining(): string {
    const stored = localStorage.getItem('lastWaiterCallTime');
    const lastCall = stored ? Number(stored) : null;
    if (!lastCall) return '0 min';
    const remaining = Math.max(0, Math.ceil((this.waiterCooldownMs - (Date.now() - lastCall)) / 60000));
    return `${remaining} min`;
  }

  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      alert('Order cancellation request sent');
    }
  }

  contactSupport(): void {
    alert('Contact support - would open chat interface');
  }

  viewFavorites(): void {
    alert('View favorites - would navigate to favorites page');
  }

  getEstimatedMins(order: Order): number {
    if (order.estimated_ready_time) {
      const ready = new Date(order.estimated_ready_time).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((ready - now) / 60000));
      return diff;
    }
    return 15;
  }

  reorder(order: Order): void {
    if (!order.items || order.items.length === 0) {
      this.notificationService.info('Reorder', 'No items to reorder.');
      return;
    }

    if (this.menuItems.length === 0) {
      this.notificationService.info('Reorder', 'Menu is still loading. Please try again in a moment.');
      return;
    }

    this.cartService.clearCart();

    let addedCount = 0;
    order.items.forEach((item) => {
      const menuItem = this.getMenuItemById(item.menu_item_id);
      if (menuItem) {
        this.cartService.addToCart(menuItem, item.quantity);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.notificationService.success('Reorder', `${addedCount} item(s) added to cart. Tap the cart to checkout.`);
    }
  }

  getOrderStatusText(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PREPARING: 'Preparing',
      READY: 'Ready',
      ON_THE_WAY: 'On the Way',
      SERVED: 'Served',
      COMPLETED: 'Completed',
      BILLING_REQUESTED: 'Billing Requested',
      CANCELLED: 'Cancelled'
    };
    return map[status] || status;
  }

  getOrderStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'CONFIRMED': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600';
      case 'PREPARING': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'READY': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'ON_THE_WAY': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'SERVED': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'BILLING_REQUESTED': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600';
      case 'COMPLETED': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
      case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getPendingDotClass(status: string): string {
    const base = 'step-dot w-8 h-8 rounded-full flex items-center justify-center text-xs';
    if (status === 'PENDING') return base + ' bg-primary-500 text-white';
    if (['CONFIRMED','PREPARING','READY','ON_THE_WAY','SERVED'].includes(status)) return base + ' bg-primary-500 text-white';
    return base + ' bg-gray-200 dark:bg-gray-700 text-gray-400';
  }
  getPendingLineClass(status: string): string {
    if (status === 'PENDING') return 'flex-1 h-1 mx-2 bg-primary-200 dark:bg-primary-900/20';
    if (['CONFIRMED','PREPARING','READY','ON_THE_WAY','SERVED'].includes(status)) return 'flex-1 h-1 mx-2 bg-primary-500 dark:bg-primary-900/40';
    return 'flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700';
  }
  getPrepDotClass(status: string): string {
    const base = 'step-dot w-8 h-8 rounded-full flex items-center justify-center text-xs';
    if (status === 'PREPARING') return base + ' bg-primary-500 text-white';
    if (['READY','ON_THE_WAY','SERVED'].includes(status)) return base + ' bg-primary-500 text-white';
    return base + ' bg-gray-200 dark:bg-gray-700 text-gray-400';
  }
  getPrepLineClass(status: string): string {
    if (['CONFIRMED','PREPARING'].includes(status)) return 'flex-1 h-1 mx-2 bg-primary-500 dark:bg-primary-900/40';
    if (['READY','ON_THE_WAY','SERVED'].includes(status)) return 'flex-1 h-1 mx-2 bg-primary-500 dark:bg-primary-900/40';
    return 'flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700';
  }
  getReadyDotClass(status: string): string {
    const base = 'step-dot w-8 h-8 rounded-full flex items-center justify-center text-xs';
    if (['READY','ON_THE_WAY','SERVED'].includes(status)) return base + ' bg-primary-500 text-white';
    return base + ' bg-gray-200 dark:bg-gray-700 text-gray-400';
  }
  getReadyLineClass(status: string): string {
    if (['ON_THE_WAY','SERVED'].includes(status)) return 'flex-1 h-1 mx-2 bg-primary-500 dark:bg-primary-900/40';
    return 'flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700';
  }
  getOnTheWayDotClass(status: string): string {
    const base = 'step-dot w-8 h-8 rounded-full flex items-center justify-center text-xs';
    if (['ON_THE_WAY','SERVED'].includes(status)) return base + ' bg-primary-500 text-white';
    return base + ' bg-gray-200 dark:bg-gray-700 text-gray-400';
  }
  getOnTheWayLineClass(status: string): string {
    if (status === 'SERVED') return 'flex-1 h-1 mx-2 bg-purple-500 dark:bg-purple-900/40';
    return 'flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700';
  }
  getServedDotClass(status: string): string {
    const base = 'step-dot w-8 h-8 rounded-full flex items-center justify-center text-xs';
    if (status === 'SERVED') return base + ' bg-purple-500 text-white';
    return base + ' bg-gray-200 dark:bg-gray-700 text-gray-400';
  }

  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) return imagePath;
    return environment.api.baseUrl + imagePath;
  }

  formatOrderDate(date: Date | string): string {
    const orderDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - orderDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return orderDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: orderDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  viewCart(): void {
    this.router.navigate(['/customer/cart']);
  }

  browseMenu(): void {
    this.router.navigate(['/customer/menu']);
  }
}
