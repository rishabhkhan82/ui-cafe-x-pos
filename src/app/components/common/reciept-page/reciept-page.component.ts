import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { NotificationService } from '../../../services/notification.service';
import { RestaurantDataService } from '../../../services/restaurant-data.service';
import { environment } from '../../../environments/environment';
import { Order } from '../../../services/mock-data.service';

@Component({
  selector: 'app-reciept-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reciept-page.component.html',
  styleUrl: './reciept-page.component.css'
})
export class RecieptPageComponent implements OnInit {
  invoiceId: string = '';
  restaurantId: string = '';
  orders: Order[] = [];
  loading: boolean = true;
  restaurant: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private restaurantDataService: RestaurantDataService
  ) {}

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') || '';
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') || '';
    if (this.invoiceId) {
      this.loadRestaurant();
      this.loadOrders();
    } else {
      this.loading = false;
    }
  }

  loadRestaurant(): void {
    if (!this.restaurantId) return;
    this.crudService.getRestaurantById(this.restaurantId).subscribe({
      next: (data: any) => {
        this.restaurant = data?.restaurant || data || null;
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
      }
    });
  }

  getRestaurantName(): string {
    if (this.restaurant?.name) return this.restaurant.name;
    const restaurant = this.restaurantDataService.getCurrentRestaurant();
    if (restaurant?.name) return restaurant.name;
    return sessionStorage.getItem('current_customer_restaurant_name') || 'Cafe-X POS';
  }

  getRestaurantLogo(): string {
    const logo = this.restaurant?.logo_image || this.restaurant?.logo;
    if (logo) {
      if (logo.startsWith('http://') || logo.startsWith('https://')) {
        return logo;
      }
      return environment.api.baseUrl + logo;
    }
    const restaurant = this.restaurantDataService.getCurrentRestaurant();
    const fallbackLogo = restaurant?.logo_image;
    if (fallbackLogo) {
      if (fallbackLogo.startsWith('http://') || fallbackLogo.startsWith('https://')) {
        return fallbackLogo;
      }
      return environment.api.baseUrl + fallbackLogo;
    }
    return '';
  }

  loadOrders(): void {
    this.loading = true;
    this.crudService.getOrders({ invoice_id: this.invoiceId, page: 1, size: 100 }).subscribe({
      next: (response: any) => {
        const data = (response?.data || response || []) as Order[];
        this.orders = data.filter(o => o.invoice_id === this.invoiceId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading receipt:', error);
        this.orders = [];
        this.loading = false;
        this.notificationService.error('Error', 'Failed to load receipt.');
      }
    });
  }

  getOrderSubtotal(order: Order): number {
    return (order.items || []).reduce((sum, item) => sum + (item.total_price || 0), 0);
  }

  getOrderTaxPercentage(order: Order): number | null {
    if (!order) return null;
    const subtotal = this.getOrderSubtotal(order);
    const taxAmount = order.tax_amount || 0;
    if (order.tax_percentage != null && Number(order.tax_percentage) > 0) {
      return Number(order.tax_percentage);
    }
    if (subtotal > 0 && taxAmount > 0) {
      return Math.round((taxAmount / subtotal) * 100);
    }
    return null;
  }

  getInvoiceSubtotal(): number {
    return this.orders.reduce((sum, o) => sum + (this.getOrderSubtotal(o) || 0), 0);
  }

  getInvoiceTax(): number {
    return this.orders.reduce((sum, o) => sum + (o.tax_amount || 0), 0);
  }

  getInvoiceDiscount(): number {
    return this.orders.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
  }

  getInvoiceLoyaltyDiscount(): number {
    return this.orders.reduce((sum, o) => sum + (o.loyalty_discount_amount || 0), 0);
  }

  getInvoiceTotal(): number {
    return this.orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  }

  getTablesSummary(): string {
    const tables = this.orders.map(o => o.table_number || 'Takeaway');
    return [...new Set(tables)].join(', ');
  }

  getFlatItems(): { name: string; quantity: number; total_price: number }[] {
    return this.orders.flatMap((ord) => {
      const orderShortId = ord.order_id.split('-').pop();
      return (ord.items || []).map((item) => ({
        name: `${item.menu_item_name} (#${orderShortId})`,
        quantity: item.quantity,
        total_price: item.total_price
      }));
    });
  }

  downloadReceipt(): void {
    const restaurantName = this.getRestaurantName();
    const restaurantLogo = this.getRestaurantLogo();

    const createdAt = new Date().toLocaleString('en-IN');
    const invoiceTotal = this.getInvoiceTotal();
    const invoiceSubtotal = this.getInvoiceSubtotal();
    const invoiceTax = this.getInvoiceTax();
    const invoiceDiscount = this.getInvoiceDiscount();
    const invoiceLoyaltyDiscount = this.getInvoiceLoyaltyDiscount();

    const flatItems = this.getFlatItems();

    const flatItemsHtml = flatItems.map(item => `
      <tr>
        <td>${item.name}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">₹${item.total_price}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=480,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${this.invoiceId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; padding: 10px; }
          .receipt { max-width: 320px; margin: 0 auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 4px 2px; }
          th { border-bottom: 1px solid #000; }
          .text-right { text-align: right; }
          .mt-2 { margin-top: 8px; }
          .mt-1 { margin-top: 4px; }
          .fs-sm { font-size: 11px; }
          .logo { max-height: 60px; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${restaurantLogo ? `<div class="center"><img src="${restaurantLogo}" class="logo" /></div>` : ''}
          <div class="center bold" style="font-size: 14px;">${restaurantName}</div>
          <div class="center fs-sm">Invoice Receipt</div>
          <div class="center fs-sm">${createdAt}</div>
          <div class="line"></div>
          <div><span class="bold">Invoice ID:</span> ${this.invoiceId}</div>
          <div><span class="bold">Orders:</span> ${this.orders.length}</div>
          <div class="line"></div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${flatItemsHtml}
            </tbody>
          </table>
          <div class="line"></div>
          <div class="mt-1" style="display:flex;justify-content:space-between;">
            <span>Total Subtotal</span><span>₹${invoiceSubtotal.toFixed(2)}</span>
          </div>
          <div class="mt-1" style="display:flex;justify-content:space-between;">
            <span>Total Tax</span><span>₹${invoiceTax.toFixed(2)}</span>
          </div>
          ${invoiceDiscount > 0 ? `<div class="mt-1" style="display:flex;justify-content:space-between;"><span>Total Discount</span><span>-₹${invoiceDiscount.toFixed(2)}</span></div>` : ''}
          ${invoiceLoyaltyDiscount > 0 ? `<div class="mt-1" style="display:flex;justify-content:space-between;"><span>Total Loyalty Discount</span><span>-₹${invoiceLoyaltyDiscount.toFixed(2)}</span></div>` : ''}
          <div class="line"></div>
          <div class="mt-1 bold" style="display:flex;justify-content:space-between;font-size:14px;">
            <span>Grand Total</span><span>₹${invoiceTotal.toFixed(2)}</span>
          </div>
          <div class="line"></div>
          <div class="center fs-sm mt-1">Thank you for your order!</div>
          <div class="center fs-sm mt-1">powered by cafexpos.in</div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  }
}