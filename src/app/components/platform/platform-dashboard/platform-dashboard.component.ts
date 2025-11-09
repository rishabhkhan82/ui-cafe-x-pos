import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { MockDataService } from '../../../services/mock-data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-dashboard.component.html',
  styleUrls: ['./platform-dashboard.component.css']
})
export class PlatformDashboardComponent implements OnInit, AfterViewInit {
  private dashboardData: any = {};

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    // Component initialization
    this.mockDataService.getPlatformDashboardData().subscribe(data => {
      this.dashboardData = data;
    });
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  private initCharts(): void {
    // Revenue Trend Chart
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx && this.dashboardData.revenueChart) {
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: this.dashboardData.revenueChart.labels,
          datasets: [{
            label: 'Monthly Revenue',
            data: this.dashboardData.revenueChart.data,
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
                  return '₹' + (value as number).toLocaleString();
                }
              }
            }
          }
        }
      });
    }

    // Subscription Distribution Chart
    const subscriptionCtx = document.getElementById('subscriptionChart') as HTMLCanvasElement;
    if (subscriptionCtx && this.dashboardData.subscriptionChart) {
      new Chart(subscriptionCtx, {
        type: 'doughnut',
        data: {
          labels: this.dashboardData.subscriptionChart.labels,
          datasets: [{
            data: this.dashboardData.subscriptionChart.data,
            backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }
}
