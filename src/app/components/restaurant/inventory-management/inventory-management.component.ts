import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService, User } from '../../../services/mock-data.service';

interface InventoryStats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  unitCost: number;
  supplier?: string;
  description?: string;
  icon: string;
  lastUpdated: Date;
}

interface LowStockAlert {
  id: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
}

interface ItemForm {
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitCost: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  supplier?: string;
  description?: string;
}

interface StockAdjustment {
  type: string;
  quantity: number;
  reason: string;
  notes?: string;
}

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.css'
})
export class InventoryManagementComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  // Component state
  currentUser: User | null = null;

  // Inventory data
  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  lowStockAlerts: LowStockAlert[] = [];

  // Stats
  inventoryStats: InventoryStats = {
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  };

  // Filters
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';

  // Modal states
  showItemModal: boolean = false;
  showStockModal: boolean = false;
  isEditing: boolean = false;

  // Forms
  itemForm: ItemForm = {
    name: '',
    sku: '',
    category: 'vegetables',
    unit: 'kg',
    unitCost: 0,
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    supplier: '',
    description: ''
  };

  stockAdjustment: StockAdjustment = {
    type: 'add',
    quantity: 0,
    reason: 'purchase',
    notes: ''
  };

  // Current editing item
  editingItem: InventoryItem | null = null;
  selectedItem: InventoryItem | null = null;

  ngOnInit(): void {
    this.initializeData();
    this.loadInventoryData();
    this.calculateStats();
    this.generateLowStockAlerts();
  }

  private initializeData(): void {
    // Initialize with mock data for restaurant owner
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
    this.initializeInventory();
  }

  private initializeInventory(): void {
    this.inventory = [
      {
        id: '1',
        name: 'Tomatoes',
        sku: 'VEG-001',
        category: 'vegetables',
        unit: 'kg',
        currentStock: 25,
        minStockLevel: 10,
        maxStockLevel: 50,
        unitCost: 40,
        supplier: 'supplier1',
        description: 'Fresh red tomatoes',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '2',
        name: 'Onions',
        sku: 'VEG-002',
        category: 'vegetables',
        unit: 'kg',
        currentStock: 5,
        minStockLevel: 15,
        maxStockLevel: 40,
        unitCost: 30,
        supplier: 'supplier1',
        description: 'Red onions',
        icon: 'fas fa-circle',
        lastUpdated: new Date()
      },
      {
        id: '3',
        name: 'Milk',
        sku: 'DAI-001',
        category: 'dairy',
        unit: 'l',
        currentStock: 20,
        minStockLevel: 8,
        maxStockLevel: 30,
        unitCost: 60,
        supplier: 'supplier2',
        description: 'Fresh cow milk',
        icon: 'fas fa-glass-whiskey',
        lastUpdated: new Date()
      },
      {
        id: '4',
        name: 'Chicken Breast',
        sku: 'MEA-001',
        category: 'meat',
        unit: 'kg',
        currentStock: 0,
        minStockLevel: 5,
        maxStockLevel: 15,
        unitCost: 250,
        supplier: 'supplier4',
        description: 'Fresh chicken breast',
        icon: 'fas fa-drumstick-bite',
        lastUpdated: new Date()
      },
      {
        id: '5',
        name: 'Margherita Pizza Base',
        sku: 'BAK-001',
        category: 'bakery',
        unit: 'pcs',
        currentStock: 8,
        minStockLevel: 12,
        maxStockLevel: 25,
        unitCost: 25,
        supplier: 'supplier1',
        description: 'Ready-made pizza bases',
        icon: 'fas fa-pizza-slice',
        lastUpdated: new Date()
      },
      {
        id: '6',
        name: 'Cumin Powder',
        sku: 'SPI-001',
        category: 'spices',
        unit: 'g',
        currentStock: 200,
        minStockLevel: 100,
        maxStockLevel: 500,
        unitCost: 5,
        supplier: 'supplier3',
        description: 'Ground cumin powder',
        icon: 'fas fa-pepper-hot',
        lastUpdated: new Date()
      }
    ];
    this.filteredInventory = [...this.inventory];
  }

  private loadInventoryData(): void {
    // In a real app, this would load from the backend
    // For now, we use the initialized data
  }

  private calculateStats(): void {
    this.inventoryStats = {
      totalItems: this.inventory.length,
      lowStock: this.inventory.filter(item => item.currentStock <= item.minStockLevel && item.currentStock > 0).length,
      outOfStock: this.inventory.filter(item => item.currentStock === 0).length,
      totalValue: this.inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
    };
  }

  private generateLowStockAlerts(): void {
    this.lowStockAlerts = this.inventory
      .filter(item => item.currentStock <= item.minStockLevel)
      .map(item => ({
        id: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        minStock: item.minStockLevel,
        unit: item.unit,
        category: item.category
      }));
  }

  // Theme toggle removed as per user request - no animations

  // Quick Actions
  addNewItem(): void {
    this.isEditing = false;
    this.itemForm = {
      name: '',
      sku: '',
      category: 'vegetables',
      unit: 'kg',
      unitCost: 0,
      currentStock: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      supplier: '',
      description: ''
    };
    this.showItemModal = true;
  }

  bulkImport(): void {
    // In a real app, this would open a file upload dialog
    alert('Bulk import functionality - would allow CSV upload and processing');
  }

  generateReport(): void {
    // In a real app, this would generate and download reports
    alert('Generate inventory reports - would create PDF/Excel reports');
  }

  manageSuppliers(): void {
    // In a real app, this would navigate to supplier management
    alert('Supplier management - would navigate to supplier management interface');
  }

  exportData(): void {
    // In a real app, this would export inventory data to CSV/Excel
    alert('Export inventory data - would download CSV/Excel file');
  }

  // Filtering
  filterInventory(): void {
    this.filteredInventory = this.inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus ||
                           (this.selectedStatus === 'in-stock' && item.currentStock > item.minStockLevel) ||
                           (this.selectedStatus === 'low-stock' && item.currentStock <= item.minStockLevel && item.currentStock > 0) ||
                           (this.selectedStatus === 'out-of-stock' && item.currentStock === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  // Item Management
  editItem(item: InventoryItem): void {
    this.isEditing = true;
    this.editingItem = item;
    this.itemForm = {
      name: item.name,
      sku: item.sku,
      category: item.category,
      unit: item.unit,
      unitCost: item.unitCost,
      currentStock: item.currentStock,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel || 0,
      supplier: item.supplier || '',
      description: item.description || ''
    };
    this.showItemModal = true;
  }

  openStockAdjustment(item: InventoryItem): void {
    this.selectedItem = item;
    this.stockAdjustment = {
      type: 'add',
      quantity: 0,
      reason: 'purchase',
      notes: ''
    };
    this.showStockModal = true;
  }

  viewHistory(item: InventoryItem): void {
    alert(`View stock history for ${item.name} - would show adjustment history`);
  }

  deleteItem(item: InventoryItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const index = this.inventory.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.inventory.splice(index, 1);
        this.filterInventory();
        this.calculateStats();
        this.generateLowStockAlerts();
        alert(`Item "${item.name}" deleted successfully`);
      }
    }
  }

  // Low Stock Alerts
  viewAllAlerts(): void {
    alert('View all low stock alerts - would navigate to detailed alerts page');
  }

  reorderItem(alert: LowStockAlert): void {
    window.alert(`Reorder ${alert.itemName} - would open reorder form`);
  }

  dismissAlert(alert: LowStockAlert): void {
    const index = this.lowStockAlerts.findIndex(a => a.id === alert.id);
    if (index !== -1) {
      this.lowStockAlerts.splice(index, 1);
      window.alert(`Alert for ${alert.itemName} dismissed`);
    }
  }

  // Modal Actions
  closeItemModal(): void {
    this.showItemModal = false;
    this.editingItem = null;
  }

  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedItem = null;
  }

  saveItem(): void {
    if (!this.itemForm.name || !this.itemForm.sku || this.itemForm.unitCost <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const itemData: InventoryItem = {
      id: this.isEditing && this.editingItem ? this.editingItem.id : `item-${Date.now()}`,
      name: this.itemForm.name,
      sku: this.itemForm.sku,
      category: this.itemForm.category,
      unit: this.itemForm.unit,
      currentStock: this.itemForm.currentStock,
      minStockLevel: this.itemForm.minStockLevel,
      maxStockLevel: this.itemForm.maxStockLevel,
      unitCost: this.itemForm.unitCost,
      supplier: this.itemForm.supplier,
      description: this.itemForm.description,
      icon: this.getItemIcon(this.itemForm.category),
      lastUpdated: new Date()
    };

    if (this.isEditing && this.editingItem) {
      // Update existing item
      const index = this.inventory.findIndex(item => item.id === this.editingItem!.id);
      if (index !== -1) {
        this.inventory[index] = itemData;
        alert(`Item "${itemData.name}" updated successfully`);
      }
    } else {
      // Add new item
      this.inventory.push(itemData);
      alert(`Item "${itemData.name}" added successfully`);
    }

    this.filterInventory();
    this.calculateStats();
    this.generateLowStockAlerts();
    this.closeItemModal();
  }

  adjustStock(): void {
    if (!this.selectedItem || this.stockAdjustment.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    let newStock = this.selectedItem.currentStock;

    switch (this.stockAdjustment.type) {
      case 'add':
        newStock += this.stockAdjustment.quantity;
        break;
      case 'remove':
        newStock -= this.stockAdjustment.quantity;
        if (newStock < 0) newStock = 0;
        break;
      case 'set':
        newStock = this.stockAdjustment.quantity;
        break;
    }

    // Update the item
    const index = this.inventory.findIndex(item => item.id === this.selectedItem!.id);
    if (index !== -1) {
      this.inventory[index].currentStock = newStock;
      this.inventory[index].lastUpdated = new Date();

      this.filterInventory();
      this.calculateStats();
      this.generateLowStockAlerts();

      alert(`Stock adjusted successfully. New stock: ${newStock} ${this.selectedItem.unit}`);
    }

    this.closeStockModal();
  }

  // Helper methods
  getStockStatusBorder(item: InventoryItem): string {
    if (item.currentStock === 0) return 'border-l-red-500';
    if (item.currentStock <= item.minStockLevel) return 'border-l-orange-500';
    return 'border-l-green-500';
  }

  getStockStatusBadge(item: InventoryItem): string {
    if (item.currentStock === 0) return 'bg-red-100 dark:bg-red-900/30 text-red-600';
    if (item.currentStock <= item.minStockLevel) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
    return 'bg-green-100 dark:bg-green-900/30 text-green-600';
  }

  getStockStatusText(item: InventoryItem): string {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock <= item.minStockLevel) return 'Low Stock';
    return 'In Stock';
  }

  getStockPercentage(item: InventoryItem): number {
    const maxLevel = item.maxStockLevel || item.minStockLevel * 2;
    return Math.min((item.currentStock / maxLevel) * 100, 100);
  }

  getStockProgressClass(item: InventoryItem): string {
    if (item.currentStock === 0) return 'bg-red-500';
    if (item.currentStock <= item.minStockLevel) return 'bg-orange-500';
    return 'bg-green-500';
  }

  private getItemIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'vegetables': 'fas fa-carrot',
      'fruits': 'fas fa-apple-alt',
      'dairy': 'fas fa-glass-whiskey',
      'meat': 'fas fa-drumstick-bite',
      'spices': 'fas fa-pepper-hot',
      'beverages': 'fas fa-coffee',
      'bakery': 'fas fa-bread-slice'
    };
    return icons[category] || 'fas fa-box';
  }
}
