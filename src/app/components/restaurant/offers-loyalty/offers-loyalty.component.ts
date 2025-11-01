import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User, Offer } from '../../../services/mock-data.service';

interface LoyaltyStats {
  activeOffers: number;
  loyalCustomers: number;
  avgRedemption: number;
  revenueBoost: number;
}

interface OfferForm {
  title: string;
  description: string;
  type: string;
  discountValue: number;
  minOrderValue: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  applicableItems: string[];
  isActive: boolean;
}

interface LoyaltyProgram {
  name: string;
  pointsPerRupee: number;
  pointsToRupee: number;
  expiryDays: number;
  welcomeBonus: number;
  isActive: boolean;
  description: string;
}

interface LoyaltyCustomer {
  id: string;
  name: string;
  points: number;
  totalSpent: number;
  rank: number;
}

interface Redemption {
  id: string;
  customerId: string;
  customerName: string;
  pointsUsed: number;
  reward: string;
  date: Date;
  offerTitle: string;
  timestamp: Date;
  amount: number;
}

interface LoyaltyForm {
  name: string;
  pointsPerRupee: number;
  pointsToRupee: number;
  expiryDays: number;
  welcomeBonus: number;
  isActive: boolean;
  description: string;
}

@Component({
  selector: 'app-offers-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './offers-loyalty.component.html',
  styleUrl: './offers-loyalty.component.css'
})
export class OffersLoyaltyComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  loyaltyProgram: LoyaltyProgram = {
    name: 'Cafe-X Loyalty Club',
    pointsPerRupee: 1,
    pointsToRupee: 100,
    expiryDays: 365,
    welcomeBonus: 50,
    isActive: true,
    description: 'Earn points on every purchase and redeem for great rewards!'
  };
  topLoyaltyCustomers: LoyaltyCustomer[] = [];
  recentActivities: any[] = [];

  // Stats
  loyaltyStats: LoyaltyStats = {
    activeOffers: 0,
    loyalCustomers: 0,
    avgRedemption: 0,
    revenueBoost: 0
  };

  // Filters
  searchQuery: string = '';
  typeFilter: string = 'all';
  statusFilter: string = 'all';

  // Modal states
  showOfferModal: boolean = false;
  showLoyaltyModal: boolean = false;
  isEditing: boolean = false;

  // Forms
  offerForm: OfferForm = {
    title: '',
    description: '',
    type: 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    usageLimit: 0,
    startDate: '',
    endDate: '',
    applicableItems: ['all'],
    isActive: true
  };

  loyaltyForm: LoyaltyForm = {
    name: '',
    pointsPerRupee: 1,
    pointsToRupee: 100,
    expiryDays: 365,
    welcomeBonus: 50,
    isActive: true,
    description: ''
  };

  // Current editing offer
  editingOffer: Offer | null = null;

  ngOnInit(): void {
    this.initializeData();
    this.loadOffersData();
    this.loadLoyaltyData();
    this.calculateStats();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  private loadOffersData(): void {
    this.mockDataService.getOffers().subscribe(offers => {
      this.offers = offers;
      this.filterOffers();
      this.calculateStats();
    });
  }

  private loadLoyaltyData(): void {
    // Load loyalty program settings (mock data)
    // In a real app, this would come from the service
    // For now, we'll use the default values set in the component

    // Load top customers (mock data)
    this.topLoyaltyCustomers = [
      {
        id: '6',
        name: 'Amit Patil',
        points: 240,
        totalSpent: 12400,
        rank: 1
      },
      {
        id: '7',
        name: 'Sarah Johnson',
        points: 180,
        totalSpent: 8900,
        rank: 2
      }
    ];

    // Load recent activities (mock data)
    this.recentActivities = [
      {
        id: '1',
        title: 'Offer Created',
        description: '20% off on all beverages created successfully',
        type: 'offer',
        status: 'active',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Points Redeemed',
        description: 'Amit Patil redeemed 100 points for ₹100 cashback',
        type: 'redemption',
        status: 'completed',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Loyalty Member Added',
        description: 'New customer Sarah Johnson joined loyalty program',
        type: 'customer',
        status: 'active',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];
  }

  private calculateStats(): void {
    this.loyaltyStats = {
      activeOffers: this.offers.filter(offer => offer.isActive).length,
      loyalCustomers: this.topLoyaltyCustomers.length,
      avgRedemption: 68, // Mock data
      revenueBoost: 15000 // Mock data
    };
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
  }

  // Quick Actions
  createOffer(): void {
    this.isEditing = false;
    this.offerForm = {
      title: '',
      description: '',
      type: 'percentage',
      discountValue: 0,
      minOrderValue: 0,
      usageLimit: 0,
      startDate: this.getDefaultStartDate(),
      endDate: this.getDefaultEndDate(),
      applicableItems: ['all'],
      isActive: true
    };
    this.showOfferModal = true;
  }

  manageLoyalty(): void {
    this.loyaltyForm = {
      name: this.loyaltyProgram.name,
      pointsPerRupee: this.loyaltyProgram.pointsPerRupee,
      pointsToRupee: this.loyaltyProgram.pointsToRupee,
      expiryDays: this.loyaltyProgram.expiryDays,
      welcomeBonus: this.loyaltyProgram.welcomeBonus,
      isActive: this.loyaltyProgram.isActive,
      description: this.loyaltyProgram.description
    };
    this.showLoyaltyModal = true;
  }

  sendPromotions(): void {
    alert('Send promotional campaigns to customers - would integrate with email/SMS service');
  }

  viewAnalytics(): void {
    this.router.navigate(['/restaurant/analytics']);
  }

  // Offer Management
  editOffer(offer: Offer): void {
    this.isEditing = true;
    this.editingOffer = offer;
    this.offerForm = {
      title: offer.title,
      description: offer.description,
      type: offer.type,
      discountValue: offer.discountValue,
      minOrderValue: offer.minOrderValue || 0,
      usageLimit: offer.usageLimit || 0,
      startDate: this.formatDateTimeForInput(offer.startDate),
      endDate: this.formatDateTimeForInput(offer.endDate),
      applicableItems: offer.applicableItems || ['all'],
      isActive: offer.isActive
    };
    this.showOfferModal = true;
  }

  duplicateOffer(offer: Offer): void {
    const duplicatedOffer: Offer = {
      ...offer,
      id: `offer-${Date.now()}`,
      title: `${offer.title} (Copy)`,
      isActive: false,
      redemptions: 0,
      revenueGenerated: 0
    };

    this.offers.push(duplicatedOffer);
    this.filterOffers();
    alert(`Offer "${duplicatedOffer.title}" created successfully`);
  }

  deleteOffer(offer: Offer): void {
    if (confirm(`Are you sure you want to delete "${offer.title}"?`)) {
      const index = this.offers.findIndex(o => o.id === offer.id);
      if (index !== -1) {
        this.offers.splice(index, 1);
        this.filterOffers();
        this.calculateStats();
        alert(`Offer "${offer.title}" deleted successfully`);
      }
    }
  }

  viewAllOffers(): void {
    alert('View all offers - would navigate to detailed offers management page');
  }

  // Loyalty Management
  editLoyaltyProgram(): void {
    this.manageLoyalty();
  }

  viewAllRedemptions(): void {
    alert('View all redemptions - would navigate to detailed redemptions history');
  }

  // Modal Actions
  closeOfferModal(): void {
    this.showOfferModal = false;
    this.editingOffer = null;
  }

  closeLoyaltyModal(): void {
    this.showLoyaltyModal = false;
  }

  saveOffer(): void {
    if (!this.offerForm.title || !this.offerForm.description || this.offerForm.discountValue <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const offerData: Offer = {
      id: this.isEditing && this.editingOffer ? this.editingOffer.id : `offer-${Date.now()}`,
      name: this.offerForm.title,
      title: this.offerForm.title,
      description: this.offerForm.description,
      type: this.offerForm.type as Offer['type'],
      value: this.offerForm.discountValue,
      discountValue: this.offerForm.discountValue,
      minOrderValue: this.offerForm.minOrderValue,
      usageLimit: this.offerForm.usageLimit,
      startDate: new Date(this.offerForm.startDate),
      endDate: new Date(this.offerForm.endDate),
      applicableItems: this.offerForm.applicableItems,
      isActive: this.offerForm.isActive,
      usageCount: this.isEditing && this.editingOffer ? this.editingOffer.usageCount : 0,
      redemptions: this.isEditing && this.editingOffer ? this.editingOffer.redemptions : 0,
      revenueGenerated: this.isEditing && this.editingOffer ? this.editingOffer.revenueGenerated : 0
    };

    if (this.isEditing && this.editingOffer) {
      // Update existing offer
      const index = this.offers.findIndex(offer => offer.id === this.editingOffer!.id);
      if (index !== -1) {
        this.offers[index] = offerData;
        alert(`Offer "${offerData.title}" updated successfully`);
      }
    } else {
      // Add new offer
      this.offers.push(offerData);
      alert(`Offer "${offerData.title}" created successfully`);
    }

    this.filterOffers();
    this.calculateStats();
    this.closeOfferModal();
  }

  saveLoyaltyProgram(): void {
    if (!this.loyaltyForm.name || this.loyaltyForm.pointsPerRupee <= 0 || this.loyaltyForm.pointsToRupee <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    this.loyaltyProgram = {
      name: this.loyaltyForm.name,
      pointsPerRupee: this.loyaltyForm.pointsPerRupee,
      pointsToRupee: this.loyaltyForm.pointsToRupee,
      expiryDays: this.loyaltyForm.expiryDays,
      welcomeBonus: this.loyaltyForm.welcomeBonus,
      isActive: this.loyaltyForm.isActive,
      description: this.loyaltyForm.description
    };

    alert('Loyalty program updated successfully');
    this.closeLoyaltyModal();
  }

  // Filtering
  filterOffers(): void {
    this.filteredOffers = this.offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           offer.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = this.typeFilter === 'all' || offer.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' ||
                           (this.statusFilter === 'active' && offer.isActive && new Date(offer.endDate) > new Date()) ||
                           (this.statusFilter === 'scheduled' && !offer.isActive && new Date(offer.startDate) > new Date()) ||
                           (this.statusFilter === 'expired' && new Date(offer.endDate) < new Date()) ||
                           (this.statusFilter === 'draft' && !offer.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  // Quick Actions
  exportOffers(): void {
    alert('Export offers functionality - would generate CSV/Excel file');
  }

  viewAllActivity(): void {
    alert('View all activity - would navigate to detailed activity page');
  }

  toggleOfferStatus(offer: Offer): void {
    const index = this.offers.findIndex(o => o.id === offer.id);
    if (index !== -1) {
      this.offers[index].isActive = !this.offers[index].isActive;
      this.filterOffers();
      alert(`Offer ${this.offers[index].isActive ? 'activated' : 'deactivated'} successfully`);
    }
  }

  // Helper methods
  getOfferIcon(type: string): string {
    switch (type) {
      case 'percentage': return 'fas fa-percent';
      case 'fixed': return 'fas fa-indian-rupee-sign';
      case 'buy-one-get-one': return 'fas fa-gift';
      case 'free-item': return 'fas fa-star';
      case 'loyalty': return 'fas fa-crown';
      default: return 'fas fa-tags';
    }
  }

  getOfferValueDisplay(offer: Offer): string {
    if (offer.type === 'percentage') {
      return `${offer.discountValue}% off`;
    } else if (offer.type === 'fixed') {
      return `₹${offer.discountValue} off`;
    } else if (offer.type === 'buy_one_get_one') {
      return 'Buy 1 Get 1 Free';
    } else if (offer.type === 'free_item') {
      return 'Free Item';
    } else if (offer.type === 'loyalty') {
      return `${offer.discountValue} points bonus`;
    }
    return `${offer.discountValue}`;
  }

  getOfferStatusBadgeClass(offer: Offer): string {
    const now = new Date();
    if (!offer.isActive) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    if (new Date(offer.endDate) < now) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (new Date(offer.startDate) > now) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }

  getOfferStatusText(offer: Offer): string {
    const now = new Date();
    if (!offer.isActive) return 'Draft';
    if (new Date(offer.endDate) < now) return 'Expired';
    if (new Date(offer.startDate) > now) return 'Scheduled';
    return 'Active';
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'offer': return 'fas fa-tags';
      case 'redemption': return 'fas fa-gift';
      case 'customer': return 'fas fa-user-plus';
      default: return 'fas fa-bell';
    }
  }

  getActivityStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getOfferStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'expired': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'scheduled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getOfferTypeClass(type: string): string {
    switch (type) {
      case 'percentage': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'fixed': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'buy-one-get-one': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'free-item': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'loyalty': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(dateTime: Date): string {
    return new Date(dateTime).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getDefaultStartDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

  private getDefaultEndDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days from now
    return date.toISOString().slice(0, 16);
  }

  private formatDateTimeForInput(date: Date): string {
    return new Date(date).toISOString().slice(0, 16);
  }
}
