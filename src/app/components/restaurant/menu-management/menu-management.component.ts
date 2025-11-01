import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User, MenuItem } from '../../../services/mock-data.service';

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

interface MenuCategory {
  key: string;
  name: string;
  icon: string;
  isActive: boolean;
  items: MenuItem[];
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
export class MenuManagementComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;
  menuCategories: MenuCategory[] = [];
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

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  private loadMenuData(): void {
    // Enhanced mock data for comprehensive menu management
    this.menuCategories = [
      {
        key: 'appetizers',
        name: 'Appetizers',
        icon: 'fas fa-cookie-bite',
        isActive: true,
        items: [
          {
            id: '1',
            name: 'Chicken 65',
            description: 'Spicy, deep-fried chicken bites marinated in red chili, garlic, and ginger',
            price: 220,
            category: 'appetizers',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: false,
            isVeg: false,
            isSpicy: true,
            isPopular: true,
            preparationTime: 15,
            isActive: true
          },
          {
            id: '2',
            name: 'Paneer Tikka',
            description: 'Marinated cottage cheese cubes grilled to perfection with spices',
            price: 240,
            category: 'appetizers',
            image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: true,
            isPopular: true,
            preparationTime: 20,
            isActive: true
          }
        ]
      },
      {
        key: 'main_course',
        name: 'Main Course',
        icon: 'fas fa-utensils',
        isActive: true,
        items: [
          {
            id: '3',
            name: 'Hyderabadi Biryani',
            description: 'Aromatic basmati rice cooked with tender meat, saffron, and traditional spices',
            price: 280,
            category: 'main_course',
            image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: false,
            isVeg: false,
            isSpicy: true,
            isPopular: true,
            preparationTime: 25,
            isActive: true
          },
          {
            id: '4',
            name: 'Paneer Butter Masala',
            description: 'Creamy tomato-based curry with soft paneer cubes and aromatic spices',
            price: 260,
            category: 'main_course',
            image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: true,
            preparationTime: 20,
            isActive: true
          },
          {
            id: '5',
            name: 'Margherita Pizza',
            description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
            price: 250,
            category: 'main_course',
            image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: false,
            preparationTime: 15,
            isActive: true
          }
        ]
      },
      {
        key: 'salads',
        name: 'Salads',
        icon: 'fas fa-leaf',
        isActive: true,
        items: [
          {
            id: '6',
            name: 'Caesar Salad',
            description: 'Crisp romaine lettuce with parmesan cheese and croutons',
            price: 180,
            category: 'salads',
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: false,
            preparationTime: 10,
            isActive: true
          },
          {
            id: '7',
            name: 'Greek Salad',
            description: 'Fresh cucumbers, tomatoes, olives, and feta cheese with olive oil dressing',
            price: 200,
            category: 'salads',
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: false,
            preparationTime: 8,
            isActive: true
          }
        ]
      },
      {
        key: 'beverages',
        name: 'Beverages',
        icon: 'fas fa-coffee',
        isActive: true,
        items: [
          {
            id: '8',
            name: 'Fresh Orange Juice',
            description: 'Freshly squeezed orange juice made from premium oranges',
            price: 120,
            category: 'beverages',
            image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: true,
            preparationTime: 5,
            isActive: true
          },
          {
            id: '9',
            name: 'Masala Chai',
            description: 'Traditional Indian spiced tea with aromatic herbs and spices',
            price: 80,
            category: 'beverages',
            image: 'https://images.unsplash.com/photo-1571934811353-2d716770f8c3?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: true,
            preparationTime: 10,
            isActive: true
          }
        ]
      },
      {
        key: 'desserts',
        name: 'Desserts',
        icon: 'fas fa-ice-cream',
        isActive: true,
        items: [
          {
            id: '10',
            name: 'Ras Malai',
            description: 'Soft cheese dumplings soaked in sweetened cardamom-flavored milk',
            price: 150,
            category: 'desserts',
            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: true,
            preparationTime: 5,
            isActive: true
          },
          {
            id: '11',
            name: 'Chocolate Brownie',
            description: 'Rich, fudgy chocolate brownie served with vanilla ice cream',
            price: 180,
            category: 'desserts',
            image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop',
            isAvailable: true,
            isVegetarian: true,
            isVeg: true,
            isSpicy: false,
            isPopular: false,
            preparationTime: 5,
            isActive: true
          }
        ]
      }
    ];
    this.calculateStats();
    this.initializeFilters();
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
  editCategory(category: MenuCategory): void {
    alert(`Edit category: ${category.name}`);
  }

  toggleCategory(category: MenuCategory): void {
    category.isActive = !category.isActive;
    // In real app, this would update the backend
    alert(`${category.name} is now ${category.isActive ? 'visible' : 'hidden'} to customers`);
  }

  addItemToCategory(category: MenuCategory): void {
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

    const newCategory: MenuCategory = {
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
