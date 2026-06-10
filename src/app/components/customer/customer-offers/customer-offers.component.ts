import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/mock-data.service';
import { CartService, CartItem } from '../../../services/cart.service';
import { environment } from '../../../environments/environment';
import { AnimateOnScrollDirective } from '../../../directives/animate-on-scroll.directive';

interface CustomerOffer {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_one_get_one' | 'free_item';
  typeLabel: string;
  icon: string;
  code: string;
  validUntil: string;
  expiresSoon: boolean;
  offerId: string;
  minOrderValue?: number;
  discountValue?: number;
}

interface PointsTransaction {
  id: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed';
  date: Date;
  icon: string;
  transactionType?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  orderId?: string;
  offerId?: string;
  reference?: string;
  earnedFrom?: string;
  redeemedFor?: string;
}

interface OfferRedemptionRecord {
  id: string;
  redemptionId: string;
  offerId: number;
  orderId: number;
  customerId: number;
  restaurantId: number;
  redemptionCode?: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  redemptionMethod: string;
  appliedBy?: string;
  appliedAt: Date;
  createdAt?: Date;
}

interface LoyaltyProgramData {
  id: string;
  programId: string;
  customerId: string;
  customerName?: string;
  programName?: string;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  tier?: string;
  tierExpiryDate?: Date;
  lastActivityDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-customer-offers',
  standalone: true,
  imports: [CommonModule, AnimateOnScrollDirective],
  templateUrl: './customer-offers.component.html',
  styleUrl: './customer-offers.component.css'
})
export class CustomerOffersComponent implements OnInit {
  private crudService = inject(CrudService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  currentUser: User | null = null;
  loyaltyProgram: LoyaltyProgramData | null = null;
  activeOffers: CustomerOffer[] = [];
  offerRedemptions: OfferRedemptionRecord[] = [];
  allPointsHistory: PointsTransaction[] = [];
  earnedPoints: PointsTransaction[] = [];
  redeemedPoints: PointsTransaction[] = [];
  cartItemCount = 0;
  isLoading = false;
  loyaltyPoints = 0;
  pointsTab: 'all' | 'earned' | 'redeemed' = 'all';

  private loadCount = 0;
  private totalLoads = 4;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.cartItemCount;
    });
    this.loadAllData();
  }

  private loadAllData(): void {
    this.isLoading = true;
    this.loadCount = 0;
    const customerId = this.currentUser?.id;
    const restaurantId = sessionStorage.getItem('current_customer_restaurant_id');

    this.loadLoyaltyProgram(customerId);
    this.loadActiveOffers(restaurantId);
    this.loadOfferRedemptions(customerId);
    this.loadPointsHistory(customerId);
  }

  private loadLoyaltyProgram(customerId: string | undefined): void {
    if (!customerId) {
      this.loyaltyPoints = 0;
      this.checkLoaded();
      return;
    }
    this.crudService.getLoyaltyProgramByCustomer(customerId).subscribe({
      next: (response: any) => {
        if (response && !Array.isArray(response)) {
          this.loyaltyProgram = {
            id: String(response.id),
            programId: response.program_id,
            customerId: String(response.customer_id),
            customerName: response.customer_name,
            programName: response.program_name,
            pointsBalance: response.points_balance || 0,
            totalPointsEarned: response.total_points_earned || 0,
            totalPointsRedeemed: response.total_points_redeemed || 0,
            tier: response.tier,
            tierExpiryDate: response.tier_expiry_date ? new Date(response.tier_expiry_date) : undefined,
            lastActivityDate: response.last_activity_date ? new Date(response.last_activity_date) : undefined,
            isActive: response.is_active ?? true,
            createdAt: response.created_at ? new Date(response.created_at) : undefined,
            updatedAt: response.updated_at ? new Date(response.updated_at) : undefined,
          };
          this.loyaltyPoints = this.loyaltyProgram.pointsBalance;
        } else {
          this.loyaltyPoints = 0;
        }
        this.checkLoaded();
      },
      error: (err) => {
        console.error('Error loading loyalty program:', err);
        this.loyaltyPoints = 0;
        this.checkLoaded();
      }
    });
  }

  private loadActiveOffers(restaurantId: string | null): void {
    const params: any = {
      is_active: 'true',
      page: 1,
      size: 50
    };
    if (restaurantId) {
      params.restaurant_id = restaurantId;
    }

    this.crudService.getCustomerOffers(params).subscribe({
      next: (response: any) => {
        const offers = response?.data || [];
        const clientNow = new Date();
        this.activeOffers = offers
          .filter((o: any) => {
            const start = o.start_date ? new Date(o.start_date) : null;
            const end = o.end_date ? new Date(o.end_date) : null;
            return (!start || start <= clientNow) && (!end || end >= clientNow);
          })
          .map((o: any) => this.mapApiOfferToCustomerOffer(o));
        this.checkLoaded();
      },
      error: (err) => {
        console.error('Error loading offers:', err);
        this.activeOffers = [];
        this.checkLoaded();
      }
    });
  }

  private loadOfferRedemptions(customerId: string | undefined): void {
    if (!customerId) {
      this.offerRedemptions = [];
      this.checkLoaded();
      return;
    }
    this.crudService.getOfferRedemptionsByCustomer(customerId).subscribe({
      next: (response: any) => {
        const redemptions = Array.isArray(response) ? response : (response?.data || []);
        this.offerRedemptions = redemptions.map((r: any) => ({
          id: String(r.id),
          redemptionId: r.redemption_id,
          offerId: r.offer_id ?? r.offer?.id ?? 0,
          orderId: r.order_id ?? r.order?.id ?? 0,
          customerId: r.customer_id ?? r.customer?.id ?? 0,
          restaurantId: r.restaurant_id ?? r.restaurant?.id ?? 0,
          redemptionCode: r.redemption_code,
          discountAmount: r.discount_amount,
          originalAmount: r.original_amount,
          finalAmount: r.final_amount,
          redemptionMethod: r.redemption_method,
          appliedBy: r.applied_by,
          appliedAt: r.applied_at ? new Date(r.applied_at) : new Date(),
          createdAt: r.created_at ? new Date(r.created_at) : undefined,
        }));
        this.checkLoaded();
      },
      error: (err) => {
        console.error('Error loading offer redemptions:', err);
        this.offerRedemptions = [];
        this.checkLoaded();
      }
    });
  }

  private loadPointsHistory(customerId: string | undefined): void {
    if (!customerId) {
      this.allPointsHistory = [];
      this.earnedPoints = [];
      this.redeemedPoints = [];
      this.checkLoaded();
      return;
    }
    this.crudService.getLoyaltyTransactionsByCustomer(customerId).subscribe({
      next: (response: any) => {
        const transactions = response?.data || [];
        this.allPointsHistory = transactions.map((t: any) => ({
          id: String(t.id),
          description: t.description || t.transaction_type || 'Points transaction',
          points: t.points,
          type: this.mapTransactionType(t.transaction_type),
          date: t.created_at ? new Date(t.created_at) : new Date(),
          icon: this.getTransactionIcon(t.transaction_type, t.earned_from, t.redeemed_for),
          transactionType: t.transaction_type,
          balanceBefore: t.balance_before,
          balanceAfter: t.balance_after,
          orderId: t.order_id,
          offerId: t.offer_id,
          reference: t.reference,
          earnedFrom: t.earned_from,
          redeemedFor: t.redeemed_for,
        }));
        this.earnedPoints = this.allPointsHistory.filter(t => t.type === 'earned');
        this.redeemedPoints = this.allPointsHistory.filter(t => t.type === 'redeemed');
        this.checkLoaded();
      },
      error: (err) => {
        console.error('Error loading points history:', err);
        this.allPointsHistory = [];
        this.earnedPoints = [];
        this.redeemedPoints = [];
        this.checkLoaded();
      }
    });
  }

  private checkLoaded(): void {
    this.loadCount++;
    if (this.loadCount >= this.totalLoads) {
      this.isLoading = false;
      this.loadCount = 0;
    }
  }

  private mapApiOfferToCustomerOffer(o: any): CustomerOffer {
    const typeMap: Record<string, string> = {
      'percentage': 'Discount',
      'fixed': 'Flat Off',
      'buy_one_get_one': 'BOGO',
      'free_item': 'Free Item',
    };
    const iconMap: Record<string, string> = {
      'percentage': 'fas fa-percentage',
      'fixed': 'fas fa-tag',
      'buy_one_get_one': 'fas fa-gift',
      'free_item': 'fas fa-birthday-cake',
    };
    const now = new Date();
    const end = o.end_date ? new Date(o.end_date) : null;
    const expiresSoon = end ? (end.getTime() - now.getTime()) < (3 * 24 * 60 * 60 * 1000) : false;

    return {
      id: String(o.id),
      title: o.title,
      description: o.description,
      type: o.type,
      typeLabel: typeMap[o.type] || o.type,
      icon: iconMap[o.type] || 'fas fa-tag',
      code: o.code || o.offer_id,
      validUntil: end ? end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing',
      expiresSoon,
      offerId: String(o.id),
      minOrderValue: o.min_order_value,
      discountValue: o.discount_value,
    };
  }

  private mapTransactionType(type: string | undefined): 'earned' | 'redeemed' {
    if (!type) return 'earned';
    const t = type.toLowerCase();
    if (t.includes('earn') || t.includes('bonus') || t.includes('referral')) return 'earned';
    if (t.includes('redeem') || t.includes('burn') || t.includes('discount')) return 'redeemed';
    return 'earned';
  }

  private getTransactionIcon(type: string | undefined, earnedFrom?: string, redeemedFor?: string): string {
    if (!type) return 'fas fa-star';
    const t = type.toLowerCase();
    if (t.includes('earn') || t.includes('bonus')) return 'fas fa-arrow-up';
    if (t.includes('redeem') || t.includes('burn')) return 'fas fa-arrow-down';
    if (t.includes('order')) return 'fas fa-receipt';
    if (t.includes('referral')) return 'fas fa-users';
    if (earnedFrom === 'offer' || redeemedFor === 'offer') return 'fas fa-tag';
    return 'fas fa-star';
  }

  get availableOffers(): CustomerOffer[] {
    const redeemedOfferIds = new Set(this.offerRedemptions.map(r => String(r.offerId)));
    return this.activeOffers.filter(o => !redeemedOfferIds.has(String(o.offerId)));
  }

  get pointsValueInRupees(): number {
    return Math.floor(this.loyaltyPoints / 100);
  }

  getFilteredPointsHistory(): PointsTransaction[] {
    if (this.pointsTab === 'earned') return this.earnedPoints;
    if (this.pointsTab === 'redeemed') return this.redeemedPoints;
    return this.allPointsHistory;
  }

  applyOffer(offer: CustomerOffer): void {
    alert(`Offer "${offer.title}" applied! Code: ${offer.code}`);
  }

  viewCart(): void {
    this.router.navigate(['/customer/cart']);
  }

  getOfferCardClasses(type: string): string {
    const base = 'bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 border-dashed';
    const border = this.getOfferBorderClass(type);
    return `${base} ${border}`;
  }

  getOfferBorderClass(type: string): string {
    switch (type) {
      case 'percentage': return 'border-blue-300 dark:border-blue-700';
      case 'fixed': return 'border-green-300 dark:border-green-700';
      case 'buy_one_get_one': return 'border-purple-300 dark:border-purple-700';
      case 'free_item': return 'border-orange-300 dark:border-orange-700';
      default: return 'border-gray-300 dark:border-gray-700';
    }
  }

  getOfferBadgeClass(type: string): string {
    switch (type) {
      case 'percentage': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'fixed': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'buy_one_get_one': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'free_item': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getOfferIconBg(type: string): string {
    switch (type) {
      case 'percentage': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'fixed': return 'bg-green-100 dark:bg-green-900/30';
      case 'buy_one_get_one': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'free_item': return 'bg-orange-100 dark:bg-orange-900/30';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  }

  getOfferIconColor(type: string): string {
    switch (type) {
      case 'percentage': return 'text-blue-600';
      case 'fixed': return 'text-green-600';
      case 'buy_one_get_one': return 'text-purple-600';
      case 'free_item': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
