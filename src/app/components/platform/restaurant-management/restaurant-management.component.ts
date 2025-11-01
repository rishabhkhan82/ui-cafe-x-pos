import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User } from '../../../services/mock-data.service';

interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionPlan: string;
  totalOrders: number;
  totalRevenue: number;
  createdAt: Date;
  lastActive: Date;
}

@Component({
  selector: 'app-restaurant-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-management.component.html',
  styleUrl: './restaurant-management.component.css'
})
export class RestaurantManagementComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  searchTerm = '';
  statusFilter = 'all';
  showAddForm = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  showDetailsModal = false;
  showEditForm = false;

  newRestaurant: Partial<Restaurant> = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    status: 'active',
    subscriptionPlan: 'Starter'
  };

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    // In a real app, this would fetch from API
    // For now, we'll create mock restaurant data based on users
    this.mockDataService.getUsers().subscribe(users => {
      const restaurantOwners = users.filter(user => user.role === 'restaurant_owner');
      this.restaurants = restaurantOwners.map(owner => ({
        id: owner.restaurantId || `rest-${owner.id}`,
        name: owner.name === 'Rishabh Khandekar' ? "RK's Cafe" : `${owner.name}'s Restaurant`,
        ownerId: owner.id,
        ownerName: owner.name,
        email: owner.email,
        phone: owner.phone,
        address: '123 Main Street',
        city: 'Mumbai',
        status: 'active' as const,
        subscriptionPlan: 'Pro Plan',
        totalOrders: Math.floor(Math.random() * 1000) + 100,
        totalRevenue: Math.floor(Math.random() * 50000) + 10000,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }));
      this.filteredRestaurants = [...this.restaurants];
    });
  }

  filterRestaurants(): void {
    this.filteredRestaurants = this.restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            restaurant.ownerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            restaurant.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || restaurant.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
    this.totalPages = Math.ceil(this.filteredRestaurants.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedRestaurant = null;
  }

  showEditRestaurantForm(): void {
    this.showEditForm = true;
    this.newRestaurant = { ...this.selectedRestaurant };
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.newRestaurant = {};
  }

  showAddRestaurantForm(): void {
    this.showAddForm = true;
    this.newRestaurant = {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      status: 'active',
      subscriptionPlan: 'Starter'
    };
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.newRestaurant = {};
  }

  addRestaurant(): void {
    if (this.newRestaurant.name && this.newRestaurant.email) {
      // In a real app, this would call an API to create the restaurant
      console.log('Adding new restaurant:', this.newRestaurant);
      this.showAddForm = false;
      this.newRestaurant = {};
      // Reload restaurants
      this.loadRestaurants();
    }
  }

  updateRestaurant(): void {
    if (this.newRestaurant.name && this.newRestaurant.email && this.selectedRestaurant) {
      // In a real app, this would call an API to update the restaurant
      console.log('Updating restaurant:', this.newRestaurant);
      // Update the restaurant in the list
      const index = this.restaurants.findIndex(r => r.id === this.selectedRestaurant!.id);
      if (index !== -1) {
        this.restaurants[index] = { ...this.restaurants[index], ...this.newRestaurant };
        this.filterRestaurants();
      }
      this.closeEditForm();
      this.closeDetailsModal();
    }
  }

  updateRestaurantStatus(restaurant: Restaurant, status: Restaurant['status']): void {
    restaurant.status = status;
    // In a real app, this would call an API to update the restaurant status
    console.log('Updated restaurant status:', restaurant.id, status);
  }

  deleteRestaurant(restaurant: Restaurant): void {
    if (confirm(`Are you sure you want to delete ${restaurant.name}?`)) {
      // In a real app, this would call an API to delete the restaurant
      console.log('Deleting restaurant:', restaurant.id);
      this.restaurants = this.restaurants.filter(r => r.id !== restaurant.id);
      this.filterRestaurants();
      if (this.selectedRestaurant?.id === restaurant.id) {
        this.selectedRestaurant = null;
      }
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getTotalOrders(): number {
    return this.filteredRestaurants.reduce((sum, r) => sum + r.totalOrders, 0);
  }

  getTotalRevenue(): number {
    return this.filteredRestaurants.reduce((sum, r) => sum + r.totalRevenue, 0);
  }

  get paginatedRestaurants(): Restaurant[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRestaurants.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
