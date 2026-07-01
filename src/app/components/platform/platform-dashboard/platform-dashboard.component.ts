import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { interval, Subscription, Subject } from 'rxjs';
import { RealtimeService } from '../../../services/realtime.service';
import { CrudService } from '../../../services/crud.service';

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
  currentTime: string = '';

  private platformOrders: any[] = [];
  private platformRestaurants: any[] = [];
  private platformSubscriptions: any[] = [];
  private platformUsers: any[] = [];
  private platformCustomers: any[] = [];
  private systemPerformanceData: any = {};

  private revenueChartInstance: Chart | null = null;
  private subscriptionChartInstance: Chart | null = null;
  private chartUpdateSubject = new Subject<void>();

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
    ordersTodayAmount: 0,
    totalOrders: 0,
    totalOrderAmount: 0
  };

  systemPerformance: any = {};

  recentActivities: any[] = [];

  mrr: number = 0;
  arr: number = 0;
  mrrGrowth: string = '0.0';
  totalTenants: number = 0;
  activeTenants: number = 0;
  activeTenantsPercentage: string = '0.0';
  newThisMonth: number = 0;
  systemUptime: string = '99.9%';
  systemHealth: string = 'Healthy';
  churnRate: string = '0.0';
  churnTrend: string = '0.0';

  constructor(private realtimeService: RealtimeService, private crudService: CrudService) {}

  ngOnInit(): void {
    this.updateCurrentTime();
    const timeSub = interval(1000).subscribe(() => {
      this.updateCurrentTime();
    });
    this.subscriptions.push(timeSub);

    const ordersSub = this.realtimeService.platformOrders$.subscribe(data => {
      if (data) {
        this.platformOrders = data;
        this.updateDerivedData();
      }
    });
    this.subscriptions.push(ordersSub);

    const restaurantsSub = this.realtimeService.platformRestaurants$.subscribe(data => {
      if (data) {
        this.platformRestaurants = data;
        this.updateDerivedData();
      }
    });
    this.subscriptions.push(restaurantsSub);

    const subscriptionsSub = this.realtimeService.platformSubscriptions$.subscribe(data => {
      if (data) {
        this.platformSubscriptions = data;
        this.updateDerivedData();
      }
    });
    this.subscriptions.push(subscriptionsSub);

    const usersSub = this.realtimeService.platformUsers$.subscribe(data => {
      if (data) {
        this.platformUsers = data;
        this.updateDerivedData();
      }
    });
    this.subscriptions.push(usersSub);

    const customersSub = this.realtimeService.platformCustomers$.subscribe(data => {
      if (data) {
        this.platformCustomers = data;
        this.updateDerivedData();
      }
    });
    this.subscriptions.push(customersSub);

    const systemPerfSub = this.realtimeService.platformSystemPerformance$.subscribe(data => {
      if (data) {
        this.systemPerformanceData = data;
        this.systemPerformance = data;
        this.updateDerivedData();
      }
    });
    this.subscriptions.push(systemPerfSub);

    const notifSub = this.realtimeService.newNotification$.subscribe(data => {
      if (data) {
        this.addRecentActivity(data);
      }
    });
    this.subscriptions.push(notifSub);

    const chartUpdateSub = this.chartUpdateSubject.pipe().subscribe(() => {
      this.updateCharts();
    });
    this.subscriptions.push(chartUpdateSub);
  }

  ngAfterViewInit(): void {
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

  private updateDerivedData(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.restaurantStats = {
      total: this.platformRestaurants.length,
      newToday: this.platformRestaurants.filter(r => new Date(r.created_at) >= today).length,
      newThisWeek: this.platformRestaurants.filter(r => new Date(r.created_at) >= weekAgo).length,
      active: this.platformRestaurants.filter(r => r.status === 'ACTIVE').length,
      trial: this.platformSubscriptions.filter(s => s.is_trial_used && s.trial_end_date && new Date(s.trial_end_date) > now).length,
      expired: this.platformSubscriptions.filter(s => {
        if (!s.current_period_end) return false;
        return new Date(s.current_period_end) < now && s.status !== 'ACTIVE';
      }).length,
      suspended: this.platformRestaurants.filter(r => r.status === 'SUSPENDED').length
    };

    this.userMetrics = {
      platformOwners: this.platformUsers.filter(u => u.role === 'platform_owner').length,
      restaurantOwners: this.platformUsers.filter(u => u.role === 'restaurant_owner').length,
      restaurantManagers: this.platformUsers.filter(u => u.role === 'restaurant_manager').length,
      kitchenManagers: this.platformUsers.filter(u => u.role === 'kitchen_manager').length,
      waiters: this.platformUsers.filter(u => u.role === 'waiter').length,
      cashiers: this.platformUsers.filter(u => u.role === 'cashier').length,
      endCustomers: this.platformCustomers.length,
      newUsersToday: this.platformUsers.filter(u => new Date(u.created_at) >= today).length,
      newCustomersToday: this.platformCustomers.filter(c => new Date(c.created_at) >= today).length,
      newThisWeek: this.platformUsers.filter(u => new Date(u.created_at) >= weekAgo).length + this.platformCustomers.filter(c => new Date(c.created_at) >= weekAgo).length
    };

    const todayOrders = this.platformOrders.filter(o => new Date(o.created_at) >= today);
    this.businessPulse = {
      ordersToday: todayOrders.length,
      ordersTodayAmount: todayOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
      totalOrders: this.platformOrders.length,
      totalOrderAmount: this.platformOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
    };

    this.systemPerformance = { ...this.systemPerformanceData };

    this.totalTenants = this.platformRestaurants.length;
    this.activeTenants = this.restaurantStats.active;
    this.activeTenantsPercentage = this.totalTenants > 0 ? ((this.activeTenants / this.totalTenants) * 100).toFixed(1) : '0.0';
    this.newThisMonth = this.platformRestaurants.filter(r => new Date(r.created_at) >= monthStart).length;

    const monthlyRevenue = this.getMonthlyRevenue();
    this.mrr = monthlyRevenue[now.getMonth()] || 0;
    this.arr = this.mrr * 12;
    
    const currentMonthRev = this.mrr;
    const lastMonthRev = monthlyRevenue[(now.getMonth() - 1 + 12) % 12] || 0;
    if (lastMonthRev > 0) {
      this.mrrGrowth = ((currentMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1);
    } else {
      this.mrrGrowth = currentMonthRev > 0 ? '100.0' : '0.0';
    }

    const errorRate = this.systemPerformanceData.errorRate || 0;
    this.systemUptime = this.systemPerformanceData.uptime || ((100 - errorRate * 100).toFixed(1) + '%');
    this.systemHealth = errorRate < 0.05 ? 'Healthy' : 'Degraded';

    const churned = this.platformSubscriptions.filter(s => {
      if (!s.cancelled_at && !s.end_date) return false;
      const cancelledDate = s.cancelled_at ? new Date(s.cancelled_at) : new Date(s.end_date);
      return cancelledDate >= thirtyDaysAgo && (s.status === 'CANCELLED' || s.status === 'EXPIRED');
    }).length;
    this.churnRate = this.totalTenants > 0 ? ((churned / this.totalTenants) * 100).toFixed(1) : '0.0';
    this.churnTrend = '-' + this.churnRate;

    this.chartUpdateSubject.next();
  }

  private getMonthlyRevenue(): number[] {
    const monthlyData: number[] = Array(12).fill(0);
    this.platformOrders.forEach(order => {
      const date = new Date(order.created_at);
      const monthIndex = date.getMonth();
      monthlyData[monthIndex] += parseFloat(order.total_amount) || 0;
    });
    return monthlyData;
  }

  private getSubscriptionDistribution(): { labels: string[], data: number[] } {
    const plans: { [key: string]: number } = {};
    this.platformSubscriptions.forEach(s => {
      const plan = s.plan_id ? `Plan ${s.plan_id}` : 'Unknown';
      plans[plan] = (plans[plan] || 0) + 1;
    });
    return { labels: Object.keys(plans), data: Object.values(plans) };
  }

  private addRecentActivity(data: any): void {
    const typeMap: any = {
      'onboarding': { icon: 'fas fa-plus-circle', title: 'New Restaurant Onboarded', status: 'Success', statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', bgGradient: 'from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20', borderColor: 'border-green-200 dark:border-green-800', iconBg: 'from-green-500 to-emerald-500' },
      'upgrade': { icon: 'fas fa-arrow-up', title: 'Plan Upgrade', status: 'Upgrade', statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', bgGradient: 'from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800', iconBg: 'from-blue-500 to-indigo-500' },
      'payment': { icon: 'fas fa-credit-card', title: 'Payment Received', status: 'Paid', statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', bgGradient: 'from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800', iconBg: 'from-purple-500 to-pink-500' },
      'alert': { icon: 'fas fa-shield-alt', title: 'Security Alert Resolved', status: 'Resolved', statusColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', bgGradient: 'from-red-50 via-pink-50 to-red-50 dark:from-red-900/20', borderColor: 'border-red-200 dark:border-red-800', iconBg: 'from-red-500 to-pink-500' },
      'churn': { icon: 'fas fa-user-minus', title: 'Subscription Cancelled', status: 'Cancelled', statusColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', bgGradient: 'from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800', iconBg: 'from-orange-500 to-yellow-500' }
    };

    const mapping = typeMap[data.type] || typeMap['alert'];
    this.recentActivities.unshift({
      type: data.type,
      icon: mapping.icon,
      title: mapping.title,
      description: data.message || data.title || 'New event',
      time: 'Just now',
      status: mapping.status,
      statusColor: mapping.statusColor,
      bgGradient: mapping.bgGradient,
      borderColor: mapping.borderColor,
      iconBg: mapping.iconBg
    });
    if (this.recentActivities.length > 20) this.recentActivities.pop();
  }

  private updateCharts(): void {
    if (this.revenueChartInstance) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyRevenue = this.getMonthlyRevenue();
      this.revenueChartInstance.data.labels = months;
      this.revenueChartInstance.data.datasets[0].data = monthlyRevenue;
      this.revenueChartInstance.update();
    }

    if (this.subscriptionChartInstance) {
      const subData = this.getSubscriptionDistribution();
      this.subscriptionChartInstance.data.labels = subData.labels;
      this.subscriptionChartInstance.data.datasets[0].data = subData.data;
      
      if (subData.labels.length > 0) {
        const colors = [
          'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(245,158,11,0.8)',
          'rgba(239,68,68,0.8)', 'rgba(6,182,212,0.8)', 'rgba(168,85,247,0.8)'
        ];
        this.subscriptionChartInstance.data.datasets[0].backgroundColor = colors.slice(0, subData.labels.length);
        this.subscriptionChartInstance.data.datasets[0].borderColor = colors.map(c => c.replace('0.8', '1')).slice(0, subData.labels.length);
      }
      
      this.subscriptionChartInstance.update();
    }
  }

  private initCharts(): void {
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyRevenue = this.getMonthlyRevenue();
      
      this.revenueChartInstance = new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Monthly Revenue',
            data: monthlyRevenue,
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
      const subData = this.getSubscriptionDistribution();
      const colors = [
        'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(245,158,11,0.8)',
        'rgba(239,68,68,0.8)', 'rgba(6,182,212,0.8)', 'rgba(168,85,247,0.8)'
      ];
      
      this.subscriptionChartInstance = new Chart(subscriptionCtx, {
        type: 'doughnut',
        data: {
          labels: subData.labels,
          datasets: [{
            data: subData.data,
            backgroundColor: colors.slice(0, subData.labels.length),
            borderColor: colors.slice(0, subData.labels.length).map(c => c.replace('0.8', '1')),
            borderWidth: 2,
            hoverBackgroundColor: colors.slice(0, subData.labels.length).map(c => c.replace('0.8', '0.9'))
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
