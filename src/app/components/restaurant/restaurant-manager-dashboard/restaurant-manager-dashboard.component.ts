import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { KitchenStats, MockDataService, Order, StaffMember, Table, TableOverview, User, Performance } from '../../../services/mock-data.service';
import { RealtimeService } from '../../../services/realtime.service';

@Component({
  selector: 'app-restaurant-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-manager-dashboard.component.html',
  styleUrl: './restaurant-manager-dashboard.component.css'
})
export class RestaurantManagerDashboardComponent implements OnInit, OnDestroy {
  private mockDataService = inject(MockDataService);
  private realtimeService = inject(RealtimeService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  // Component state
  currentUser: User | null = null;
  activeOrders: Order[] = [];
  filteredOrders: Order[] = [];
  activeOrdersCount: number = 0;
  todaysRevenue: number = 0;
  avgOrderTime: number = 0;
  staffOnDuty: number = 0;

  // Filters
  searchQuery: string = '';
  statusFilter: string = 'all';
  timeFilter: string = 'all';

  // Kitchen stats
  kitchenStats: KitchenStats = {
    preparing: 0,
    ready: 0,
    avgPrepTime: 14
  };

  // Staff data
  todaysStaff: StaffMember[] = [
    {
      id: 'staff-1',
      name: 'Chef Kumar',
      email: 'chef.kumar@restaurant.com',
      phone: '+91 98765 43210',
      role: 'kitchen_manager',
      avatar: 'fas fa-user-chef',
      restaurantId: 'restaurant-1',
      hireDate: new Date('2024-01-15'),
      salary: 35000,
      status: 'active',
      shift: 'morning',
      skills: ['Food Preparation', 'Kitchen Management', 'Quality Control'],
      performanceRating: 4.8,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      emergencyContact: {
        name: 'Priya Kumar',
        phone: '+91 98765 43211',
        relationship: 'Wife'
      },
      address: {
        street: '123 MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      }
    },
    {
      id: 'staff-2',
      name: 'Rahul Singh',
      email: 'rahul.singh@restaurant.com',
      phone: '+91 98765 43212',
      role: 'cashier',
      avatar: 'fas fa-cash-register',
      restaurantId: 'restaurant-1',
      hireDate: new Date('2024-02-01'),
      salary: 25000,
      status: 'active',
      shift: 'morning',
      skills: ['POS System', 'Customer Service', 'Cash Handling'],
      performanceRating: 4.5,
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
      emergencyContact: {
        name: 'Sunita Singh',
        phone: '+91 98765 43213',
        relationship: 'Mother'
      },
      address: {
        street: '456 FC Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411005'
      }
    },
    {
      id: 'staff-3',
      name: 'Arjun Patel',
      email: 'arjun.patel@restaurant.com',
      phone: '+91 98765 43214',
      role: 'waiter',
      avatar: 'fas fa-user-tie',
      restaurantId: 'restaurant-1',
      hireDate: new Date('2024-03-10'),
      salary: 20000,
      status: 'active',
      shift: 'morning',
      skills: ['Customer Service', 'Order Taking', 'Table Management'],
      performanceRating: 4.2,
      lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000),
      emergencyContact: {
        name: 'Raj Patel',
        phone: '+91 98765 43215',
        relationship: 'Father'
      },
      address: {
        street: '789 JM Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411004'
      }
    },
    {
      id: 'staff-4',
      name: 'Priya Sharma',
      email: 'priya.sharma@restaurant.com',
      phone: '+91 98765 43216',
      role: 'restaurant_manager',
      avatar: 'fas fa-user-gear',
      restaurantId: 'restaurant-1',
      hireDate: new Date('2024-01-01'),
      salary: 45000,
      status: 'active',
      shift: 'morning',
      skills: ['Management', 'Operations', 'Staff Supervision', 'Customer Relations'],
      performanceRating: 4.9,
      lastLogin: new Date(Date.now() - 30 * 60 * 1000),
      emergencyContact: {
        name: 'Amit Sharma',
        phone: '+91 98765 43217',
        relationship: 'Husband'
      },
      address: {
        street: '321 Station Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411002'
      }
    }
  ];

  // Performance metrics
  performance: Performance = {
    orderCompletion: 96,
    customerSatisfaction: 94,
    staffEfficiency: 92
  };

  // Table overview
  tables: Table[] = [
    {
      id: 'table-1',
      number: 1,
      status: 'occupied',
      capacity: 4,
      currentOrder: undefined, // Would need to be populated from orders service
      lastActivity: new Date(Date.now() - 25 * 60 * 1000),
      estimatedFreeTime: 25,
      server: 'Arjun'
    },
    {
      id: 'table-2',
      number: 2,
      status: 'available',
      capacity: 2,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      estimatedFreeTime: undefined
    },
    {
      id: 'table-3',
      number: 3,
      status: 'occupied',
      capacity: 6,
      currentOrder: undefined, // Would need to be populated from orders service
      lastActivity: new Date(Date.now() - 45 * 60 * 1000),
      estimatedFreeTime: 45,
      server: 'Priya'
    },
    {
      id: 'table-4',
      number: 4,
      status: 'reserved',
      capacity: 4,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      estimatedFreeTime: undefined
    },
    {
      id: 'table-5',
      number: 5,
      status: 'available',
      capacity: 4,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      estimatedFreeTime: undefined
    },
    {
      id: 'table-6',
      number: 6,
      status: 'needs_cleaning',
      capacity: 2,
      lastActivity: new Date(Date.now() - 15 * 60 * 1000),
      estimatedFreeTime: undefined
    },
    {
      id: 'table-7',
      number: 7,
      status: 'occupied',
      capacity: 2,
      currentOrder: undefined, // Would need to be populated from orders service
      lastActivity: new Date(Date.now() - 12 * 60 * 1000),
      estimatedFreeTime: 12,
      server: 'Arjun'
    },
    {
      id: 'table-8',
      number: 8,
      status: 'available',
      capacity: 6,
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
      estimatedFreeTime: undefined
    },
    {
      id: 'table-9',
      number: 9,
      status: 'occupied',
      capacity: 4,
      currentOrder: undefined, // Would need to be populated from orders service
      lastActivity: new Date(Date.now() - 35 * 60 * 1000),
      estimatedFreeTime: 35,
      server: 'Priya'
    },
    {
      id: 'table-10',
      number: 10,
      status: 'available',
      capacity: 2,
      lastActivity: new Date(Date.now() - 45 * 60 * 1000),
      estimatedFreeTime: undefined
    }
  ];

  tableOverview: TableOverview = {
    totalTables: 0,
    availableTables: 0,
    occupiedTables: 0,
    reservedTables: 0,
    cleaningTables: 0,
    tablesFreeSoon: []
  };

  ngOnInit(): void {
    this.initializeData();
    this.setupRealtimeSubscriptions();
    this.updateStats();
    this.initializeFilters();
    this.updateTableOverview();
  }

  private initializeFilters(): void {
    this.filteredOrders = [...this.activeOrders];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeData(): void {
    this.currentUser = this.mockDataService.getUserByRole('restaurant_manager') || null;
    this.loadActiveOrders();
  }

  private setupRealtimeSubscriptions(): void {
    // Subscribe to new orders
    const newOrderSub = this.realtimeService.newOrder$.subscribe(order => {
      if (order) {
        this.activeOrders.unshift(order);
        this.updateStats();
      }
    });
    this.subscriptions.push(newOrderSub);

    // Subscribe to order updates
    const orderUpdateSub = this.realtimeService.orderUpdate$.subscribe(order => {
      if (order) {
        const index = this.activeOrders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.activeOrders[index] = order;
          this.updateStats();
        }
      }
    });
    this.subscriptions.push(orderUpdateSub);

    // Update stats every minute
    const statsSub = interval(60000).subscribe(() => {
      this.updateStats();
    });
    this.subscriptions.push(statsSub);
  }

  private loadActiveOrders(): void {
    // Get active orders from mock data
    this.mockDataService.getOrders().subscribe(orders => {
      this.activeOrders = orders.filter(order =>
        ['confirmed', 'preparing', 'ready'].includes(order.status)
      ).slice(0, 5); // Show only first 5
      this.updateStats();
    });
  }

  private updateStats(): void {
    this.activeOrdersCount = this.activeOrders.length;

    // Calculate today's revenue
    this.todaysRevenue = this.activeOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate average order time (mock)
    this.avgOrderTime = 12;

    // Count staff on duty
    this.staffOnDuty = this.todaysStaff.filter(staff => staff.status === 'active').length;

    // Update kitchen stats
    this.kitchenStats.preparing = this.activeOrders.filter(order => order.status === 'preparing').length;
    this.kitchenStats.ready = this.activeOrders.filter(order => order.status === 'ready').length;
  }

  private updateTableOverview(): void {
    this.tableOverview.totalTables = this.tables.length;
    this.tableOverview.availableTables = this.tables.filter(t => t.status === 'available').length;
    this.tableOverview.occupiedTables = this.tables.filter(t => t.status === 'occupied').length;
    this.tableOverview.reservedTables = this.tables.filter(t => t.status === 'reserved').length;
    this.tableOverview.cleaningTables = this.tables.filter(t => t.status === 'cleaning').length;

    // Tables that will be free in next 15 minutes
    this.tableOverview.tablesFreeSoon = this.tables.filter(t =>
      t.status === 'occupied' && t.estimatedFreeTime && t.estimatedFreeTime <= 15
    );
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
    sessionStorage.setItem('theme', newTheme);
  }

  // Navigation methods
  viewAllOrders(): void {
    this.router.navigate(['/restaurant/orders']);
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/restaurant/orders', order.id]);
  }

  viewKitchen(): void {
    this.router.navigate(['/kitchen/display']);
  }

  manageStaff(): void {
    this.router.navigate(['/restaurant/staff']);
  }

  createNewOrder(): void {
    this.router.navigate(['/restaurant/orders/new']);
  }

  manageMenu(): void {
    this.router.navigate(['/restaurant/menu']);
  }

  viewReports(): void {
    this.router.navigate(['/restaurant/reports']);
  }

  // Helper methods
  formatOrderTime(createdAt: Date | string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  }

  getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready',
      'served': 'Served',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  }

  getOrderStatusBadgeClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'confirmed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      'preparing': 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      'ready': 'bg-green-100 dark:bg-green-900/30 text-green-600',
      'served': 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      'completed': 'bg-gray-100 dark:bg-gray-700 text-gray-600'
    };
    return classMap[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  // Filtering methods
  filterOrders(): void {
    let filtered = [...this.activeOrders];

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.tableNumber.toString().includes(query) ||
        order.customerName?.toLowerCase().includes(query)
      );
    }

    // Time filter
    if (this.timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderTime = new Date(order.createdAt);
        switch (this.timeFilter) {
          case 'today':
            return orderTime.toDateString() === now.toDateString();
          case 'hour':
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            return orderTime >= oneHourAgo;
          case 'shift':
            const shiftStart = new Date(now);
            shiftStart.setHours(9, 0, 0, 0); // Assuming 9 AM shift start
            return orderTime >= shiftStart;
          default:
            return true;
        }
      });
    }

    this.filteredOrders = filtered;
  }

  // Order management
  canUpdateOrderStatus(order: Order): boolean {
    return ['confirmed', 'preparing', 'ready'].includes(order.status);
  }

  updateOrderStatus(order: Order): void {
    const statusFlow = {
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'served'
    };

    const newStatus = statusFlow[order.status as keyof typeof statusFlow];
    if (newStatus) {
      order.status = newStatus as any;
      this.filterOrders();
      this.updateStats();
      alert(`Order ${order.id.split('-').pop()} status updated to ${newStatus}`);
    }
  }

  // Staff icon helpers
  getStaffIconBg(icon: string): string {
    const bgMap: { [key: string]: string } = {
      'fas fa-user-chef': 'bg-orange-100 dark:bg-orange-900/30',
      'fas fa-cash-register': 'bg-green-100 dark:bg-green-900/30',
      'fas fa-user-tie': 'bg-blue-100 dark:bg-blue-900/30',
      'fas fa-user-gear': 'bg-purple-100 dark:bg-purple-900/30'
    };
    return bgMap[icon] || 'bg-gray-100 dark:bg-gray-700';
  }

  getStaffIconColor(icon: string): string {
    const colorMap: { [key: string]: string } = {
      'fas fa-user-chef': 'text-orange-600 dark:text-orange-400',
      'fas fa-cash-register': 'text-green-600 dark:text-green-400',
      'fas fa-user-tie': 'text-blue-600 dark:text-blue-400',
      'fas fa-user-gear': 'text-purple-600 dark:text-purple-400'
    };
    return colorMap[icon] || 'text-gray-600 dark:text-gray-400';
  }

  // Table helpers
  getTableStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'available': 'bg-green-100 dark:bg-green-900/30 text-green-600',
      'occupied': 'bg-red-100 dark:bg-red-900/30 text-red-600',
      'reserved': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      'cleaning': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
    };
    return classMap[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600';
  }

  getTableStatusText(status: string): string {
    const textMap: { [key: string]: string } = {
      'available': 'Available',
      'occupied': 'Occupied',
      'reserved': 'Reserved',
      'cleaning': 'Cleaning'
    };
    return textMap[status] || status;
  }

  getTableIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'available': 'fas fa-check-circle',
      'occupied': 'fas fa-users',
      'reserved': 'fas fa-calendar-check',
      'cleaning': 'fas fa-broom'
    };
    return iconMap[status] || 'fas fa-question-circle';
  }

  // Table management methods
  viewAllTables(): void {
    alert('Opening table management view...');
  }

  viewTableDetails(table: Table): void {
    alert(`Opening details for Table ${table.id} (${this.getTableStatusText(table.status)})`);
  }

  reserveTable(): void {
    alert('Opening table reservation dialog...');
  }

  markTableCleaning(): void {
    alert('Opening table cleaning assignment...');
  }

  viewTableHistory(): void {
    alert('Opening table usage history...');
  }
}
