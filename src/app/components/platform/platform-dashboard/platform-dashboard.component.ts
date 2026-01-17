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

  ngOnInit(): void {
    // Initialize current time
    this.updateCurrentTime();
    const timeSub = interval(1000).subscribe(() => {
      this.updateCurrentTime();
    });
    this.subscriptions.push(timeSub);

    // Component initialization
    this.mockDataService.getPlatformDashboardData().subscribe(data => {
      this.dashboardData = data;
    });
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
