import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, User } from '../../../services/mock-data.service';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'promotion' | 'maintenance' | 'emergency' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  targetAudience: 'all' | 'restaurants' | 'customers' | 'staff' | 'specific';
  sentBy: string;
  sentAt?: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  totalRecipients: number;
  readCount: number;
  engagementRate: number;
  deliveryStatus: 'pending' | 'sending' | 'completed' | 'failed';
  attachments?: string[];
  ctaText?: string;
  ctaUrl?: string;
}

@Component({
  selector: 'app-broadcast-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './broadcast-messages.component.html',
  styleUrl: './broadcast-messages.component.css'
})
export class BroadcastMessagesComponent implements OnInit {
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

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.loadBroadcasts();
  }

  loadBroadcasts(): void {
    // In a real app, this would fetch broadcast messages from API
    // For now, we'll create mock broadcast messages
    this.broadcasts = [
      {
        id: 'broadcast-1',
        title: 'Platform Maintenance Notice',
        message: 'Scheduled maintenance will occur tonight from 11 PM to 1 AM IST. All services will be temporarily unavailable.',
        type: 'maintenance',
        priority: 'high',
        status: 'sent',
        targetAudience: 'all',
        sentBy: 'Platform Admin',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalRecipients: 1500,
        readCount: 1200,
        engagementRate: 80,
        deliveryStatus: 'completed'
      },
      {
        id: 'broadcast-2',
        title: 'New Feature: Digital Menu Updates',
        message: 'Exciting news! You can now update your restaurant menus digitally. Check out the new menu management features.',
        type: 'update',
        priority: 'medium',
        status: 'scheduled',
        targetAudience: 'restaurants',
        sentBy: 'Product Team',
        scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000),
        totalRecipients: 24,
        readCount: 0,
        engagementRate: 0,
        deliveryStatus: 'pending',
        ctaText: 'Explore New Features',
        ctaUrl: '/restaurant/menu'
      },
      {
        id: 'broadcast-3',
        title: 'Happy Hour Promotion',
        message: 'Enjoy 20% off on all beverages during happy hour (5-7 PM)! Limited time offer for our valued customers.',
        type: 'promotion',
        priority: 'medium',
        status: 'sent',
        targetAudience: 'customers',
        sentBy: 'Marketing Team',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        totalRecipients: 1200,
        readCount: 800,
        engagementRate: 67,
        deliveryStatus: 'completed',
        ctaText: 'Order Now',
        ctaUrl: '/customer/menu'
      },
      {
        id: 'broadcast-4',
        title: 'Emergency: System Alert',
        message: 'URGENT: System experiencing high load. Some services may be slow. We are working to resolve this immediately.',
        type: 'emergency',
        priority: 'critical',
        status: 'sent',
        targetAudience: 'all',
        sentBy: 'System Admin',
        sentAt: new Date(Date.now() - 30 * 60 * 1000),
        totalRecipients: 1500,
        readCount: 1450,
        engagementRate: 97,
        deliveryStatus: 'completed'
      }
    ];
    this.filteredBroadcasts = [...this.broadcasts];
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

      this.newBroadcast.totalRecipients = totalRecipients;

      // In a real app, this would call an API to create the broadcast
      console.log('Creating new broadcast:', this.newBroadcast);
      this.showCreateForm = false;
      this.newBroadcast = {};
      // Reload broadcasts
      this.loadBroadcasts();
    }
  }

  sendBroadcast(broadcast: BroadcastMessage): void {
    broadcast.status = 'sent';
    broadcast.sentAt = new Date();
    broadcast.deliveryStatus = 'sending';
    // In a real app, this would trigger the broadcast sending process
    console.log('Sending broadcast:', broadcast.id);

    // Simulate delivery completion
    setTimeout(() => {
      broadcast.deliveryStatus = 'completed';
      broadcast.readCount = Math.floor(broadcast.totalRecipients * 0.8); // 80% read rate
      broadcast.engagementRate = Math.round((broadcast.readCount / broadcast.totalRecipients) * 100);
    }, 2000);
  }

  cancelBroadcast(broadcast: BroadcastMessage): void {
    if (confirm('Are you sure you want to cancel this broadcast?')) {
      broadcast.status = 'cancelled';
      broadcast.deliveryStatus = 'failed';
      // In a real app, this would call an API to cancel the broadcast
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
