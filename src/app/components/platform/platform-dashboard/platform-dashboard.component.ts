import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { interval, Subscription } from 'rxjs';
import { MockDataService } from '../../../services/mock-data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-dashboard.component.html',
  styleUrls: ['./platform-dashboard.component.css']
})
export class PlatformDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private dashboardData: any = {};
  private subscriptions: Subscription[] = [];
  currentTime: string = '';

  constructor(private mockDataService: MockDataService) {}

  // Restaurant Ecosystem
  restaurantStats = {
    total: 156,
    newToday: 3,
    newThisWeek: 12,
    active: 148,
    trial: 5,
    expired: 2,
    suspended: 1
  };

  // User Metrics
  userMetrics = {
    platformOwners: 8,
    restaurantOwners: 156,
    restaurantManagers: 234,
    kitchenManagers: 189,
    waiters: 412,
    cashiers: 298,
    endCustomers: 45892,
    newUsersToday: 28,
    newCustomersToday: 19,
    newThisWeek: 312
  };

  // Business Activity Pulse
  businessPulse = {
    ordersToday: 1847,
    ordersTodayAmount: 456780,
    totalOrders: 12834,
    totalOrderAmount: 2456789
  };

  // System Performance
  systemPerformance = {
    apiRequestsPerMin: 4523,
    avgResponseTime: 124,
    errorRate: 0.02,
    activeConnections: 892
  };

  // Attention Required
  attentionItems = [
    {
      type: 'subscription',
      severity: 'critical',
      title: 'Subscriptions Expiring Soon',
      description: '8 restaurants have subscriptions expiring in the next 7 days',
      count: 8,
      icon: 'fas fa-exclamation-triangle',
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30'
    },
    {
      type: 'restaurant',
      severity: 'warning',
      title: 'Zero Orders Restaurants',
      description: '5 restaurants have had zero orders in the last 3 days',
      count: 5,
      icon: 'fas fa-store-slash',
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      type: 'payment',
      severity: 'critical',
      title: 'Payment Gateway Issues',
      description: '2 restaurants reporting payment processing failures',
      count: 2,
      icon: 'fas fa-credit-card',
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30'
    },
    {
      type: 'system',
      severity: 'info',
      title: 'High Database Load',
      description: 'Database connections at 78 percent capacity during peak hours',
      icon: 'fas fa-database',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    }
  ];

  // Recent Activity Feed
  recentActivities = [
    {
      type: 'onboarding',
      icon: 'fas fa-plus-circle',
      title: 'New Restaurant Onboarded',
      description: 'Spice Garden Restaurant joined with Enterprise plan',
      time: '2 min ago',
      status: 'Success',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      bgGradient: 'from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      iconBg: 'from-green-500 to-emerald-500'
    },
    {
      type: 'upgrade',
      icon: 'fas fa-arrow-up',
      title: 'Plan Upgrade',
      description: 'The Coffee House upgraded to Enterprise - MRR +50,000',
      time: '15 min ago',
      status: 'Upgrade',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      bgGradient: 'from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'from-blue-500 to-indigo-500'
    },
    {
      type: 'payment',
      icon: 'fas fa-credit-card',
      title: 'Payment Received',
      description: 'Urban Bites paid 45,000 for Professional plan',
      time: '32 min ago',
      status: 'Paid',
      statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      bgGradient: 'from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconBg: 'from-purple-500 to-pink-500'
    },
    {
      type: 'alert',
      icon: 'fas fa-shield-alt',
      title: 'Security Alert Resolved',
      description: 'Unusual login attempts blocked from IP 192.168.1.100',
      time: '1 hour ago',
      status: 'Resolved',
      statusColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      bgGradient: 'from-red-50 via-pink-50 to-red-50 dark:from-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      iconBg: 'from-red-500 to-pink-500'
    },
    {
      type: 'churn',
      icon: 'fas fa-user-minus',
      title: 'Subscription Cancelled',
      description: 'Quick Bites cancelled Starter plan - feedback noted',
      time: '2 hours ago',
      status: 'Cancelled',
      statusColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      bgGradient: 'from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      iconBg: 'from-orange-500 to-yellow-500'
    }
  ];

  ngOnInit(): void {
    this.updateCurrentTime();
    const timeSub = interval(1000).subscribe(() => {
      this.updateCurrentTime();
    });
    this.subscriptions.push(timeSub);

    this.mockDataService.getPlatformDashboardData().subscribe(data => {
      this.dashboardData = data;
    });

    this.startDynamicUpdates();
  }

  ngAfterViewInit(): void {
    // Delay chart initialization to ensure DOM is ready
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  private startDynamicUpdates(): void {
    const dynamicSub = interval(5000).subscribe(() => {
      this.updateDynamicData();
    });
    this.subscriptions.push(dynamicSub);
  }

  private updateDynamicData(): void {
    this.restaurantStats.newToday = Math.max(0, this.restaurantStats.newToday + Math.floor(Math.random() * 3) - 1);
    this.restaurantStats.newThisWeek = Math.max(0, this.restaurantStats.newThisWeek + Math.floor(Math.random() * 5) - 2);
    this.userMetrics.newUsersToday = Math.max(0, this.userMetrics.newUsersToday + Math.floor(Math.random() * 4) - 1);
    this.userMetrics.newCustomersToday = Math.max(0, this.userMetrics.newCustomersToday + Math.floor(Math.random() * 3) - 1);
    this.userMetrics.newThisWeek = Math.max(0, this.userMetrics.newThisWeek + Math.floor(Math.random() * 10) - 3);
    this.userMetrics.endCustomers = this.userMetrics.endCustomers + Math.floor(Math.random() * 10);
    this.businessPulse.ordersToday = Math.max(0, this.businessPulse.ordersToday + Math.floor(Math.random() * 5));
    this.businessPulse.ordersTodayAmount = Math.max(0, this.businessPulse.ordersTodayAmount + Math.floor(Math.random() * 5000));
    this.businessPulse.totalOrders = Math.max(0, this.businessPulse.totalOrders + Math.floor(Math.random() * 10));
    this.businessPulse.totalOrderAmount = Math.max(0, this.businessPulse.totalOrderAmount + Math.floor(Math.random() * 10000));
    this.systemPerformance.apiRequestsPerMin = Math.floor(4000 + Math.random() * 2000);
    this.systemPerformance.avgResponseTime = Math.floor(100 + Math.random() * 100);
    this.systemPerformance.activeConnections = Math.floor(800 + Math.random() * 200);
    this.systemPerformance.errorRate = parseFloat((Math.random() * 0.05).toFixed(2));
  }

  private initCharts(): void {
    // Revenue Trend Chart
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [32000, 35000, 38000, 42000, 45000, 45600, 48000, 52000, 55000, 58000, 61000, 65000]
      };

      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: revenueData.labels,
          datasets: [{
            label: 'Monthly Revenue',
            data: revenueData.data,
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

    // Subscription Distribution Chart
    const subscriptionCtx = document.getElementById('subscriptionChart') as HTMLCanvasElement;
    if (subscriptionCtx) {
      const subscriptionData = {
        labels: ['Starter', 'Professional', 'Enterprise'],
        data: [45, 28, 8]
      };

      new Chart(subscriptionCtx, {
        type: 'doughnut',
        data: {
          labels: subscriptionData.labels,
          datasets: [{
            data: subscriptionData.data,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',   // Blue for Starter
              'rgba(16, 185, 129, 0.8)',   // Green for Professional
              'rgba(139, 92, 246, 0.8)'    // Purple for Enterprise
            ],
            borderColor: [
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)',
              'rgba(139, 92, 246, 1)'
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
              'rgba(59, 130, 246, 0.9)',
              'rgba(16, 185, 129, 0.9)',
              'rgba(139, 92, 246, 0.9)'
            ]
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
                  const percentage = ((value / total) * 100).toFixed(1);
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
