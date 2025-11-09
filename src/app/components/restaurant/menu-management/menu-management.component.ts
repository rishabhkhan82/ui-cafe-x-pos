import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MockDataService, User, MenuItem, FoodMenuCategory } from '../../../services/mock-data.service';

interface MenuStats {
  totalItems: number;
  categories: number;
  activeItems: number;
  avgPrice: number;
}

interface ItemForm {
  name: string;
  description: string;
  category: string;
  price: number;
  preparationTime?: number;
  discount?: number;
  isVeg: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  isAvailable?: boolean;
  image?: string;
}

interface CategoryForm {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.css'
})
export class MenuManagementComponent implements OnInit, OnDestroy {
  private mockDataService: MockDataService;
  private router: Router;
  private subscriptions: Subscription = new Subscription();

  constructor(mockDataService: MockDataService, router: Router) {
    this.mockDataService = mockDataService;
    this.router = router;
  }

  // Component state
  currentUser: User | null = null;
  menuCategories: FoodMenuCategory[] = [];
  filteredItems: MenuItem[] = [];
  menuStats: MenuStats = {
    totalItems: 0,
    categories: 0,
    activeItems: 0,
    avgPrice: 0
  };

  // Filters
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';

  // Modal states
  showItemModal: boolean = false;
  showCategoryModal: boolean = false;
  isEditing: boolean = false;

  // Forms
  itemForm: ItemForm = {
    name: '',
    description: '',
    category: '',
    price: 0,
    preparationTime: 15,
    discount: 0,
    isVeg: true,
    isSpicy: false,
    isPopular: false,
    isAvailable: true
  };

  categoryForm: CategoryForm = {
    name: '',
    icon: 'fas fa-utensils'
  };

  // Current editing item
  editingItem: MenuItem | null = null;

  ngOnInit(): void {
    this.initializeData();
    this.loadMenuData();
    this.calculateStats();
    this.initializeFilters();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  private loadMenuData(): void {
    // Subscribe to food menu categories from service
    const subscription = this.mockDataService.getFoodMenuCategories().subscribe(categories => {
      this.menuCategories = categories;
      this.calculateStats();
      this.initializeFilters();
    });
    this.subscriptions.add(subscription);
  }

  private calculateStats(): void {
    const allItems = this.menuCategories.flatMap(cat => cat.items);
    this.menuStats = {
      totalItems: allItems.length,
      categories: this.menuCategories.length,
      activeItems: allItems.filter(item => item.isActive).length,
      avgPrice: allItems.length > 0 ? Math.round(allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length) : 0
    };
  }

  private initializeFilters(): void {
    this.filteredItems = this.menuCategories.flatMap(cat => cat.items);
  }

  filterMenuItems(): void {
    let items = this.menuCategories.flatMap(cat => cat.items);

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      items = items.filter(item => item.category === this.selectedCategory);
    }

    // Apply status filter
    if (this.selectedStatus) {
      if (this.selectedStatus === 'active') {
        items = items.filter(item => item.isActive);
      } else if (this.selectedStatus === 'inactive') {
        items = items.filter(item => !item.isActive);
      }
    }

    this.filteredItems = items;
  }

  getCategoryName(categoryKey: string): string {
    const category = this.menuCategories.find(cat => cat.key === categoryKey);
    return category ? category.name : categoryKey;
  }

  getItemStatusBadge(item: MenuItem): string {
    return item.isActive
      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
      : 'bg-red-100 dark:bg-red-900/30 text-red-600';
  }

  // Theme toggle removed as per user request - no animations

  // Menu Actions
  addNewItem(): void {
    this.isEditing = false;
    this.itemForm = {
      name: '',
      description: '',
      category: this.menuCategories[0]?.key || '',
      price: 0,
      preparationTime: 15,
      discount: 0,
      isVeg: true,
      isSpicy: false,
      isPopular: false,
      isAvailable: true
    };
    this.showItemModal = true;
  }

  addNewCategory(): void {
    this.categoryForm = {
      name: '',
      icon: 'fas fa-utensils'
    };
    this.showCategoryModal = true;
  }

  bulkEdit(): void {
    // In a real POS system, this would allow bulk operations like price updates, status changes, etc.
    alert('Bulk edit functionality - would allow selecting multiple items for batch operations like price updates, category changes, or status modifications');
  }

  exportMenu(): void {
    // In a real POS system, this would export to CSV/Excel format
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `menu_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Menu exported successfully!');
  }

  importMenu(): void {
    // In a real POS system, this would open file dialog and process CSV/Excel
    alert('Menu import functionality - would allow CSV upload and processing');
  }

  private generateCSV(): string {
    const headers = ['ID', 'Name', 'Description', 'Category', 'Price', 'Is Veg', 'Is Spicy', 'Is Popular', 'Prep Time', 'Status'];
    const rows = this.menuCategories.flatMap(cat =>
      cat.items.map(item => [
        item.id,
        item.name,
        item.description,
        cat.name,
        item.price.toString(),
        item.isVeg ? 'Yes' : 'No',
        item.isSpicy ? 'Yes' : 'No',
        item.isPopular ? 'Yes' : 'No',
        item.preparationTime.toString(),
        item.isActive ? 'Active' : 'Inactive'
      ])
    );

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  // Category Actions
  editCategory(category: FoodMenuCategory): void {
    alert(`Edit category: ${category.name}`);
  }

  toggleCategory(category: FoodMenuCategory): void {
    category.isActive = !category.isActive;
    // In real app, this would update the backend
    alert(`${category.name} is now ${category.isActive ? 'visible' : 'hidden'} to customers`);
  }

  addItemToCategory(category: FoodMenuCategory): void {
    this.isEditing = false;
    this.itemForm.category = category.key;
    this.showItemModal = true;
  }

  // Item Actions
  editItem(item: MenuItem): void {
    this.isEditing = true;
    this.editingItem = item;
    this.itemForm = {
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      preparationTime: item.preparationTime || 15,
      discount: item.discount || 0,
      isVeg: item.isVeg || false,
      isSpicy: item.isSpicy || false,
      isPopular: item.isPopular || false,
      isAvailable: item.isActive !== false, // Map isActive to isAvailable
      image: item.image
    };
    this.showItemModal = true;
  }

  duplicateItem(item: MenuItem): void {
    const duplicatedItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      name: `${item.name} (Copy)`,
      isActive: false
    };

    // Find the category and add the item
    const category = this.menuCategories.find(cat => cat.key === item.category);
    if (category) {
      category.items.push(duplicatedItem);
      this.calculateStats();
      this.filterMenuItems(); // Update filtered items
      alert(`Item "${duplicatedItem.name}" created successfully`);
    }
  }

  toggleItemStatus(item: MenuItem): void {
    item.isActive = !item.isActive;
    // In real POS system, this would update the backend and sync with ordering system
    alert(`${item.name} is now ${item.isActive ? 'active' : 'inactive'} in the menu`);
    this.calculateStats();
    this.filterMenuItems(); // Update filtered items
  }

  deleteItem(item: MenuItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      // Find and remove the item
      const category = this.menuCategories.find(cat => cat.key === item.category);
      if (category) {
        const index = category.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
          category.items.splice(index, 1);
          this.calculateStats();
          this.filterMenuItems(); // Update filtered items
          alert(`Item "${item.name}" deleted successfully`);
        }
      }
    }
  }

  // Modal Actions
  closeItemModal(): void {
    this.showItemModal = false;
    this.editingItem = null;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  saveItem(): void {
    if (!this.itemForm.name || !this.itemForm.category || this.itemForm.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const category = this.menuCategories.find(cat => cat.key === this.itemForm.category);
    if (!category) {
      alert('Invalid category selected');
      return;
    }

    const itemData: MenuItem = {
      id: this.isEditing && this.editingItem ? this.editingItem.id : `item-${Date.now()}`,
      name: this.itemForm.name,
      description: this.itemForm.description,
      category: this.itemForm.category,
      price: this.itemForm.price,
      originalPrice: this.itemForm.price,
      image: this.itemForm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
      isAvailable: this.itemForm.isAvailable !== false,
      isVegetarian: this.itemForm.isVeg,
      isVeg: this.itemForm.isVeg,
      isSpicy: this.itemForm.isSpicy,
      isPopular: this.itemForm.isPopular,
      preparationTime: this.itemForm.preparationTime || 15,
      isActive: this.itemForm.isAvailable !== false,
      discount: this.itemForm.discount || null
    };

    if (this.isEditing && this.editingItem) {
      // Update existing item
      const index = category.items.findIndex(item => item.id === this.editingItem!.id);
      if (index !== -1) {
        category.items[index] = itemData;
        alert(`Item "${itemData.name}" updated successfully`);
      }
    } else {
      // Add new item
      category.items.push(itemData);
      alert(`Item "${itemData.name}" added successfully`);
    }

    this.calculateStats();
    this.filterMenuItems(); // Update filtered items
    this.closeItemModal();
  }

  saveCategory(): void {
    if (!this.categoryForm.name) {
      alert('Please enter a category name');
      return;
    }

    const newCategory: FoodMenuCategory = {
      key: this.categoryForm.name.toLowerCase().replace(/\s+/g, '_'),
      name: this.categoryForm.name,
      icon: this.categoryForm.icon,
      isActive: true,
      items: []
    };

    this.menuCategories.push(newCategory);
    this.calculateStats();
    alert(`Category "${newCategory.name}" added successfully`);
    this.closeCategoryModal();
  }
}
