import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { SubscriptionMetrics, PlanAnalytics, RevenueData, MockDataService } from '../../../services/mock-data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-subscription-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-analytics.component.html',
  styleUrl: './subscription-analytics.component.css'
})
export class SubscriptionAnalyticsComponent implements OnInit, AfterViewInit {
  metrics: SubscriptionMetrics = {
    totalRevenue: 154195,
    monthlyRecurringRevenue: 44555,
    annualRecurringRevenue: 109640,
    totalSubscribers: 81,
    activeSubscribers: 73,
    churnRate: 8.5,
    averageRevenuePerUser: 1901,
    lifetimeValue: 22812,
    conversionRate: 67.3
  };

  planAnalytics: PlanAnalytics[] = [];

  revenueData: RevenueData[] = [];

  selectedTimeframe = '6months';
  selectedMetric = 'revenue';

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.mockDataService.getSubscriptionMetrics().subscribe(metrics => {
      if (metrics) {
        this.metrics = metrics;
      }
    });

    this.mockDataService.getPlanAnalytics().subscribe(planAnalytics => {
      this.planAnalytics = planAnalytics;
    });

    this.mockDataService.getRevenueData().subscribe(revenueData => {
      this.revenueData = revenueData;
    });
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  initCharts(): void {
    this.initRevenueChart();
    this.initSubscriberChart();
    this.initPlanDistributionChart();
    this.initChurnChart();
  }

  initRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.revenueData.map(d => d.month),
          datasets: [{
            label: 'Monthly Revenue',
            data: this.revenueData.map(d => d.revenue),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return '₹' + (value as number).toLocaleString();
                }
              }
            }
          }
        }
      });
    }
  }

  initSubscriberChart(): void {
    const ctx = document.getElementById('subscriberChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.revenueData.map(d => d.month),
          datasets: [
            {
              label: 'New Subscribers',
              data: this.revenueData.map(d => d.newSubscribers),
              backgroundColor: '#10b981',
              borderRadius: 4
            },
            {
              label: 'Churned Subscribers',
              data: this.revenueData.map(d => d.churnedSubscribers),
              backgroundColor: '#ef4444',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }

  initPlanDistributionChart(): void {
    const ctx = document.getElementById('planDistributionChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.planAnalytics.map(p => p.planName),
          datasets: [{
            data: this.planAnalytics.map(p => p.subscriberCount),
            backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  initChurnChart(): void {
    const ctx = document.getElementById('churnChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.planAnalytics.map(p => p.planName),
          datasets: [{
            label: 'Churn Rate (%)',
            data: this.planAnalytics.map(p => p.churnRate),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }

  exportData(): void {
    // In a real app, this would export analytics data
    console.log('Exporting subscription analytics data...');
  }

  refreshData(): void {
    // In a real app, this would refresh analytics data from API
    console.log('Refreshing subscription analytics...');
  }
}
