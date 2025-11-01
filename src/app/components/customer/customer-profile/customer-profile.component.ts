import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: Date;
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  label?: string;
  fullAddress?: string;
}

interface PaymentCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  icon?: string;
  iconClass?: string;
  name?: string;
  description?: string;
}

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css'
})
export class CustomerProfileComponent implements OnInit {
  currentUser: User | null = null;
  addresses: Address[] = [];
  paymentCards: PaymentCard[] = [];
  savedAddresses: Address[] = [];
  paymentMethods: PaymentCard[] = [];
  preferences = {
    notifications: true,
    marketing: false,
    darkMode: false
  };

  pendingOrdersCount = 2;
  cartItemCount = 3;

  editForm = {
    name: '',
    email: '',
    phone: ''
  };

  showEditProfile = false;

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    // Mock user data
    this.currentUser = {
      id: 'user-1',
      name: 'Amit Patil',
      email: 'amit@example.com',
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      memberSince: new Date('2024-01-15')
    };

    this.addresses = [
      {
        id: 'addr-1',
        type: 'Home',
        street: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        isDefault: true
      },
      {
        id: 'addr-2',
        type: 'Work',
        street: '456 Business Park, Tower A',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400002',
        isDefault: false
      }
    ];

    this.savedAddresses = this.addresses; // Assign to savedAddresses

    this.paymentCards = [
      {
        id: 'card-1',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true
      },
      {
        id: 'card-2',
        last4: '8888',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false
      }
    ];

    this.paymentMethods = this.paymentCards.map(card => ({
      ...card,
      icon: card.brand === 'Visa' ? 'fab fa-cc-visa' : 'fab fa-cc-mastercard',
      iconClass: `bg-${card.brand === 'Visa' ? 'blue' : 'red'}-100 dark:bg-${card.brand === 'Visa' ? 'blue' : 'red'}-900/30 text-${card.brand === 'Visa' ? 'blue' : 'red'}-600`,
      name: `${card.brand} **** ${card.last4}`,
      description: `Expires ${card.expiryMonth}/${card.expiryYear}`
    }));

    // Initialize edit form
    if (this.currentUser) {
      this.editForm = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone
      };
    }
  }

  toggleTheme(): void {
    this.preferences.darkMode = !this.preferences.darkMode;
    // Apply theme change
    document.documentElement.classList.toggle('dark', this.preferences.darkMode);
  }

  editProfile(): void {
    this.showEditProfile = true;
  }

  closeEditProfile(): void {
    this.showEditProfile = false;
    // Reset form
    if (this.currentUser) {
      this.editForm = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone
      };
    }
  }

  saveProfile(): void {
    if (this.currentUser) {
      this.currentUser.name = this.editForm.name;
      this.currentUser.email = this.editForm.email;
      this.currentUser.phone = this.editForm.phone;
    }
    this.showEditProfile = false;
    // Show success message
    alert('Profile updated successfully!');
  }

  formatMemberSince(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  addNewAddress(): void {
    alert('Add new address functionality would open a modal/form');
  }

  editAddress(address: Address): void {
    alert(`Edit address: ${address.type}`);
  }

  removeAddress(address: Address): void {
    if (confirm(`Remove ${address.type} address?`)) {
      this.addresses = this.addresses.filter(a => a.id !== address.id);
    }
  }

  addNewCard(): void {
    alert('Add new payment card functionality would open a modal/form');
  }

  manageCard(card: PaymentCard): void {
    alert(`Manage card ending in ${card.last4}`);
  }

  changePassword(): void {
    alert('Change password functionality would open a modal/form');
  }

  contactSupport(): void {
    alert('Contact support functionality would open chat/email');
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      // Logout logic
      alert('Logged out successfully!');
    }
  }

  viewCart(): void {
    alert('Navigate to cart page');
  }
}
