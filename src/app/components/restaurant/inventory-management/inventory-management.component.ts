import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventoryItem, InventoryStats, ItemForm, LowStockAlert, MockDataService, StockAdjustment, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-management.component.html',
  styleUrl: './inventory-management.component.css'
})
export class InventoryManagementComponent implements OnInit, OnDestroy {

  private inventorySubscription?: Subscription;

  constructor(public mockDataService: MockDataService, public router: Router) {
  }

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

  ngOnDestroy(): void {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
  }

  private initializeData(): void {
    // Initialize with mock data for restaurant owner
    this.currentUser = this.mockDataService.getUserByRole('restaurant_owner') || null;
  }

  private loadInventoryData(): void {
    // Subscribe to inventory data from service
    this.inventorySubscription = this.mockDataService.getInventory().subscribe(inventory => {
      this.inventory = inventory;
      this.filteredInventory = [...this.inventory];
      this.calculateStats();
      this.generateLowStockAlerts();
    });
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
      icon: this.mockDataService.getItemIcon(this.itemForm.category),
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

}
