import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService, User, Offer } from '../../../services/mock-data.service';

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
}

interface RedeemableReward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface PointsTransaction {
  id: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed';
  date: Date;
  icon: string;
}

@Component({
  selector: 'app-customer-offers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-offers.component.html',
  styleUrl: './customer-offers.component.css'
})
export class CustomerOffersComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  selectedOffer: CustomerOffer | null = null;

  // Mock data
  loyaltyPoints = 240;
  pendingOrdersCount = 2;
  cartItemCount = 3;
  referralCount = 5;
  referralPoints = 150;

  activeOffers: CustomerOffer[] = [
    {
      id: '1',
      title: '20% Off on Biryani',
      description: 'Get 20% discount on all biryani items',
      type: 'percentage',
      typeLabel: 'Discount',
      icon: 'fas fa-percentage',
      code: 'BIRYANI20',
      validUntil: 'Dec 31, 2024',
      expiresSoon: false
    },
    {
      id: '2',
      title: 'Buy 1 Get 1 Free Pizza',
      description: 'Buy one pizza and get another free',
      type: 'buy_one_get_one',
      typeLabel: 'BOGO',
      icon: 'fas fa-gift',
      code: 'PIZZABOGO',
      validUntil: 'Dec 25, 2024',
      expiresSoon: true
    },
    {
      id: '3',
      title: 'Free Dessert',
      description: 'Get a free dessert with orders above ₹500',
      type: 'free_item',
      typeLabel: 'Free Item',
      icon: 'fas fa-birthday-cake',
      code: 'FREEDESSERT',
      validUntil: 'Jan 15, 2025',
      expiresSoon: false
    }
  ];

  redeemableRewards: RedeemableReward[] = [
    {
      id: '1',
      title: 'Free Coffee',
      description: 'Redeem for a free coffee',
      pointsRequired: 100,
      icon: 'fas fa-coffee',
      iconBg: 'bg-brown-100 dark:bg-brown-900/30',
      iconColor: 'text-brown-600'
    },
    {
      id: '2',
      title: '₹50 Off',
      description: 'Get ₹50 off on your next order',
      pointsRequired: 200,
      icon: 'fas fa-indian-rupee-sign',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600'
    },
    {
      id: '3',
      title: 'Free Dessert',
      description: 'Redeem for a free dessert',
      pointsRequired: 150,
      icon: 'fas fa-birthday-cake',
      iconBg: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600'
    },
    {
      id: '4',
      title: 'VIP Access',
      description: 'Get priority seating',
      pointsRequired: 300,
      icon: 'fas fa-crown',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600'
    }
  ];

  pointsHistory: PointsTransaction[] = [
    {
      id: '1',
      description: 'Order #ORD-2025-1045',
      points: 24,
      type: 'earned',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: 'fas fa-receipt'
    },
    {
      id: '2',
      description: 'Referral bonus',
      points: 50,
      type: 'earned',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: 'fas fa-users'
    },
    {
      id: '3',
      description: 'Free coffee redeemed',
      points: 100,
      type: 'redeemed',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: 'fas fa-coffee'
    }
  ];

  ngOnInit(): void {
    this.initializeData();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('customer') || null;
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
  }

  applyOffer(offer: CustomerOffer): void {
    this.selectedOffer = offer;
  }

  closeOfferDetails(): void {
    this.selectedOffer = null;
  }

  applySelectedOffer(): void {
    if (this.selectedOffer) {
      alert(`Offer "${this.selectedOffer.title}" applied! Code: ${this.selectedOffer.code}`);
      this.selectedOffer = null;
    }
  }

  redeemReward(reward: RedeemableReward): void {
    if (this.loyaltyPoints >= reward.pointsRequired) {
      alert(`"${reward.title}" redeemed successfully!`);
      this.loyaltyPoints -= reward.pointsRequired;
    } else {
      alert('Not enough points to redeem this reward.');
    }
  }

  shareReferralCode(): void {
    alert('Referral code shared! Your unique code: CAFEX2024');
  }

  viewCart(): void {
    alert('Navigate to cart page');
  }

  // Helper methods
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
