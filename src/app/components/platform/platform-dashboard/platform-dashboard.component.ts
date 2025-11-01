import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-dashboard.component.html',
  styleUrls: ['./platform-dashboard.component.css']
})
export class PlatformDashboardComponent implements OnInit, AfterViewInit {

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  private initCharts(): void {
    // Revenue Trend Chart
    const revenueCtx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Revenue',
            data: [32000, 35000, 38000, 42000, 45000, 45600],
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
    if (subscriptionCtx) {
      new Chart(subscriptionCtx, {
        type: 'doughnut',
        data: {
          labels: ['Pro Plan', 'Starter Plan', 'Enterprise'],
          datasets: [{
            data: [12, 6, 6],
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
