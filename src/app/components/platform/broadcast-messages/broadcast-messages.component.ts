import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BroadcastMessage, MockDataService, User } from '../../../services/mock-data.service';

@Component({
  selector: 'app-broadcast-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './broadcast-messages.component.html',
  styleUrl: './broadcast-messages.component.css'
})
export class BroadcastMessagesComponent implements OnInit, OnDestroy {
  broadcasts: BroadcastMessage[] = [];
  filteredBroadcasts: BroadcastMessage[] = [];
  selectedBroadcast: BroadcastMessage | null = null;
  typeFilter = 'all';
  statusFilter = 'all';
  audienceFilter = 'all';
  showCreateForm = false;

  newBroadcast: Partial<BroadcastMessage> = {
    title: '',
    message: '',
    type: 'announcement',
    priority: 'medium',
    status: 'draft',
    targetAudience: 'all',
    deliveryStatus: 'pending'
  };

  private subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadBroadcasts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadBroadcasts(): void {
    const subscription = this.mockDataService.getBroadcastMessages().subscribe(broadcasts => {
      this.broadcasts = broadcasts;
      this.filteredBroadcasts = [...this.broadcasts];
    });
    this.subscriptions.push(subscription);
  }

  filterBroadcasts(): void {
    this.filteredBroadcasts = this.broadcasts.filter(broadcast => {
      const matchesType = this.typeFilter === 'all' || broadcast.type === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || broadcast.status === this.statusFilter;
      const matchesAudience = this.audienceFilter === 'all' || broadcast.targetAudience === this.audienceFilter;

      return matchesType && matchesStatus && matchesAudience;
    });
  }

  selectBroadcast(broadcast: BroadcastMessage): void {
    this.selectedBroadcast = broadcast;
  }

  showCreateBroadcastForm(): void {
    this.showCreateForm = true;
    this.newBroadcast = {
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      status: 'draft',
      targetAudience: 'all',
      deliveryStatus: 'pending'
    };
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newBroadcast = {};
  }

  createBroadcast(): void {
    if (this.newBroadcast.title && this.newBroadcast.message) {
      // Calculate total recipients based on target audience
      let totalRecipients = 0;
      switch (this.newBroadcast.targetAudience) {
        case 'all':
          totalRecipients = 1500; // Mock total users
          break;
        case 'restaurants':
          totalRecipients = 24; // Mock restaurant count
          break;
        case 'customers':
          totalRecipients = 1200; // Mock customer count
          break;
        case 'staff':
          totalRecipients = 276; // Mock staff count
          break;
        default:
          totalRecipients = 0;
      }

      const broadcastMessage: BroadcastMessage = {
        id: `broadcast-${Date.now()}`,
        title: this.newBroadcast.title!,
        message: this.newBroadcast.message!,
        type: this.newBroadcast.type!,
        priority: this.newBroadcast.priority!,
        status: this.newBroadcast.status!,
        targetAudience: this.newBroadcast.targetAudience!,
        deliveryStatus: this.newBroadcast.deliveryStatus!,
        sentBy: 'Platform Admin', // Default sender
        totalRecipients,
        readCount: 0,
        engagementRate: 0
      };

      this.mockDataService.addBroadcastMessage(broadcastMessage);
      console.log('Creating new broadcast:', broadcastMessage);
      this.showCreateForm = false;
      this.newBroadcast = {};
    }
  }

  sendBroadcast(broadcast: BroadcastMessage): void {
    this.mockDataService.updateBroadcastMessageStatus(broadcast.id, 'sent');
    this.mockDataService.updateBroadcastMessageDeliveryStatus(broadcast.id, 'sending');
    console.log('Sending broadcast:', broadcast.id);

    // Simulate delivery completion
    setTimeout(() => {
      this.mockDataService.updateBroadcastMessageDeliveryStatus(broadcast.id, 'completed');
      // Note: In a real implementation, readCount and engagementRate would be updated via API
    }, 2000);
  }

  cancelBroadcast(broadcast: BroadcastMessage): void {
    if (confirm('Are you sure you want to cancel this broadcast?')) {
      this.mockDataService.updateBroadcastMessageStatus(broadcast.id, 'cancelled');
      this.mockDataService.updateBroadcastMessageDeliveryStatus(broadcast.id, 'failed');
      console.log('Cancelled broadcast:', broadcast.id);
    }
  }

  duplicateBroadcast(broadcast: BroadcastMessage): void {
    const duplicate: Partial<BroadcastMessage> = {
      ...broadcast,
      id: undefined,
      title: `${broadcast.title} (Copy)`,
      status: 'draft',
      sentAt: undefined,
      scheduledFor: undefined,
      deliveryStatus: 'pending',
      readCount: 0,
      engagementRate: 0
    };
    // In a real app, this would create a new broadcast
    console.log('Duplicating broadcast:', duplicate);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'promotion': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'update': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  }

  getAudienceDisplayName(audience: string): string {
    const names: { [key: string]: string } = {
      'all': 'All Users',
      'restaurants': 'Restaurant Owners',
      'customers': 'Customers',
      'staff': 'Staff Members',
      'specific': 'Specific Users'
    };
    return names[audience] || audience;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTotalSentCount(): number {
    return this.broadcasts.filter(b => b.status === 'sent').length;
  }

  getScheduledCount(): number {
    return this.broadcasts.filter(b => b.status === 'scheduled').length;
  }

  getTotalRecipients(): number {
    return this.broadcasts.reduce((sum, b) => sum + b.totalRecipients, 0);
  }

  getAverageEngagement(): number {
    if (this.broadcasts.length === 0) return 0;
    const totalEngagement = this.broadcasts.reduce((sum, b) => sum + b.engagementRate, 0);
    return Math.round(totalEngagement / this.broadcasts.length);
  }
}
