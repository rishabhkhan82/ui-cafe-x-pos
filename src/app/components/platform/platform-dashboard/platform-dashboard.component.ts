import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { CrudService } from '../../../services/crud.service';
import { RealtimeService } from '../../../services/realtime.service';

Chart.register(...registerables);

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-dashboard.component.html',
  styleUrls: ['./platform-dashboard.component.css']
})
export class PlatformDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  private revenueChartInstance: Chart | null = null;
  private subscriptionChartInstance: Chart | null = null;

  restaurantStats = {
    total: 0,
    newToday: 0,
    newThisWeek: 0,
    active: 0,
    trial: 0,
    expired: 0,
    suspended: 0
  };

  userMetrics = {
    platformOwners: 0,
    restaurantOwners: 0,
    restaurantManagers: 0,
    kitchenManagers: 0,
    waiters: 0,
    cashiers: 0,
    endCustomers: 0,
    newUsersToday: 0,
    newCustomersToday: 0,
    newThisWeek: 0
  };

  businessPulse = {
    ordersToday: 0,
    uncompletedOrdersToday: 0,
    completedOrdersToday: 0,
    ordersTodayAmount: 0,
    totalOrders: 0,
    totalOrderAmount: 0
  };

  recentActivities: any[] = [];

  currentMonthRevenue: number = 0;
  totalRevenue: number = 0;
  revenueGrowth: string = '0.0';
  totalTenants: number = 0;
  activeTenants: number = 0;
  activeTenantsPercentage: string = '0.0';
  newThisMonth: number = 0;
  churnRate: string = '0.0';
  churnTrend: string = '0.0';
  loading = false;

  private planNameMap: Record<number, string> = {};

  constructor(private realtimeService: RealtimeService, private crudService: CrudService) {}

  ngOnInit(): void {
    this.loading = true;
    this.crudService.getPlatformDashboard().subscribe({
      next: (snapshot: any) => {
        if (snapshot) {
          this.applyMetrics(snapshot);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('[Dashboard] Failed to fetch platform dashboard snapshot', err);
        this.loading = false;
      }
    });

    const metricsSub = this.realtimeService.platformDashboardMetrics$.subscribe(data => {
      if (data) {
        this.applyMetrics(data);
      }
    });
    this.subscriptions.push(metricsSub);
  }

  refreshDashboard(): void {
    this.loading = true;
    this.crudService.getPlatformDashboard().subscribe({
      next: (snapshot: any) => {
        if (snapshot) {
          this.applyMetrics(snapshot);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('[Dashboard] Refresh failed', err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private applyMetrics(data: any): void {
    if (data.restaurants) {
      this.restaurantStats = {
        total: data.restaurants.total ?? this.restaurantStats.total,
        newToday: data.restaurants.newToday ?? this.restaurantStats.newToday,
        newThisWeek: data.restaurants.newThisWeek ?? this.restaurantStats.newThisWeek,
        active: data.restaurants.active ?? this.restaurantStats.active,
        trial: data.restaurants.trial ?? this.restaurantStats.trial,
        expired: data.restaurants.expired ?? this.restaurantStats.expired,
        suspended: data.restaurants.suspended ?? this.restaurantStats.suspended
      };
    }

    if (data.users) {
      this.userMetrics = {
        platformOwners: data.users.platformOwners ?? this.userMetrics.platformOwners,
        restaurantOwners: data.users.restaurantOwners ?? this.userMetrics.restaurantOwners,
        restaurantManagers: data.users.restaurantManagers ?? this.userMetrics.restaurantManagers,
        kitchenManagers: data.users.kitchenManagers ?? this.userMetrics.kitchenManagers,
        waiters: data.users.waiters ?? this.userMetrics.waiters,
        cashiers: data.users.cashiers ?? this.userMetrics.cashiers,
        endCustomers: data.users.endCustomers ?? this.userMetrics.endCustomers,
        newUsersToday: data.users.newUsersToday ?? this.userMetrics.newUsersToday,
        newCustomersToday: data.users.newCustomersToday ?? this.userMetrics.newCustomersToday,
        newThisWeek: data.users.newThisWeek ?? this.userMetrics.newThisWeek
      };
    }

    if (data.orders) {
      this.businessPulse = {
        ordersToday: data.orders.ordersToday ?? this.businessPulse.ordersToday,
        uncompletedOrdersToday: data.orders.uncompletedOrdersToday ?? this.businessPulse.uncompletedOrdersToday,
        completedOrdersToday: data.orders.completedOrdersToday ?? this.businessPulse.completedOrdersToday,
        ordersTodayAmount: data.orders.ordersTodayAmount ?? this.businessPulse.ordersTodayAmount,
        totalOrders: data.orders.totalOrders ?? this.businessPulse.totalOrders,
        totalOrderAmount: data.orders.totalOrderAmount ?? this.businessPulse.totalOrderAmount
      };
    }

    if (data.revenue) {
      this.currentMonthRevenue = data.revenue.currentMonth ?? this.currentMonthRevenue;
      this.totalRevenue = data.revenue.total ?? this.totalRevenue;
      this.revenueGrowth = data.revenue.growth != null ? String(data.revenue.growth) : this.revenueGrowth;
    }

    if (data.revenue && Array.isArray(data.revenue.monthly)) {
      this.updateCharts(data.revenue.monthly);
    }

    if (data.subscriptions) {
      this.planNameMap = {};
      if (data.subscriptions.labels && Array.isArray(data.subscriptions.labels)) {
        data.subscriptions.labels.forEach((label: string, index: number) => {
          this.planNameMap[index] = label;
        });
      }
      this.updateChartsForSubscriptions(data.subscriptions.labels, data.subscriptions.data);
    }

    this.totalTenants = this.restaurantStats.total;
    this.activeTenants = this.restaurantStats.active;
    this.activeTenantsPercentage = this.totalTenants > 0 ? ((this.activeTenants / this.totalTenants) * 100).toFixed(1) : '0.0';
    this.newThisMonth = this.restaurantStats.newThisWeek;

    if (data.churn) {
      this.churnRate = data.churn.rate != null ? String(data.churn.rate) : this.churnRate;
      this.churnTrend = data.churn.trend != null ? String(data.churn.trend) : this.churnTrend;
    }
  }

  private getPlanName(planId: number): string {
    if (this.planNameMap[planId] != null) {
      return this.planNameMap[planId];
    }
    return `Plan ${planId}`;
  }

  private updateCharts(monthlyRevenue: number[] = []): void {
    if (this.revenueChartInstance) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.revenueChartInstance.data.labels = months;
      this.revenueChartInstance.data.datasets[0].data = monthlyRevenue.length === 12 ? monthlyRevenue : this.revenueChartInstance.data.datasets[0].data;
      this.revenueChartInstance.update();
    }
  }

  private updateChartsForSubscriptions(labels: string[] = [], data: number[] = []): void {
    if (this.subscriptionChartInstance) {
      this.subscriptionChartInstance.data.labels = labels;
      this.subscriptionChartInstance.data.datasets[0].data = data;

      if (labels.length > 0) {
        const colors = [
          'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(245,158,11,0.8)',
          'rgba(239,68,68,0.8)', 'rgba(6,182,212,0.8)', 'rgba(168,85,247,0.8)'
        ];
        this.subscriptionChartInstance.data.datasets[0].backgroundColor = colors.slice(0, labels.length);
        this.subscriptionChartInstance.data.datasets[0].borderColor = colors.map(c => c.replace('0.8', '1')).slice(0, labels.length);
      }

      this.subscriptionChartInstance.update();
    }
  }

  private initCharts(): void {
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      this.revenueChartInstance = new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Monthly Revenue',
            data: Array(12).fill(0),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: {
                label: function(context: any) {
                  return '₹' + context.parsed.y.toLocaleString();
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                callback: function(value: any) {
                  return '₹' + (value as number).toLocaleString();
                },
                color: '#6b7280'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280'
              }
            }
          }
        }
      });
    }

    const subscriptionCtx = document.getElementById('subscriptionChart') as HTMLCanvasElement;
    if (subscriptionCtx) {
      const colors = [
        'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(245,158,11,0.8)',
        'rgba(239,68,68,0.8)', 'rgba(6,182,212,0.8)', 'rgba(168,85,247,0.8)'
      ];

      this.subscriptionChartInstance = new Chart(subscriptionCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 2,
            hoverBackgroundColor: colors.map(c => c.replace('0.8', '0.9'))
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              callbacks: {
                label: function(context: any) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }
}
