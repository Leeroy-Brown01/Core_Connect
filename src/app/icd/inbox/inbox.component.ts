import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchivedComponent } from '../archived/archived.component';
import { SentComponent } from '../sent/sent.component';
import { RecycleComponent } from '../recycle/recycle.component';
import { IcdUserManagementComponent } from '../icd-user-management/icd-user-management.component';
import { MessageService, MessageData } from '../../services/message.service';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { InboxService, InboxMessage as ServiceInboxMessage } from '../../services/inbox.service';
import { Subscription } from 'rxjs';

interface InboxMessage {
  id?: string;
  senderId?: string;
  senderName: string;
  senderEmail?: string;
  recipientDepartments?: string[];
  to?: string;
  subject: string;
  textContent: string;
  message: string;
  time: string;
  timestamp: any;
  hasAttachment: boolean;
  attachmentName?: string;
  attachedFile?: {
    name: string;
    size: number;
    type: string;
    base64Content: string;
  };
  isRead: boolean;
  priority?: string;
  category?: string;
  status?: string;
  messageType?: string;
  readBy?: string[];
}

@Component({
  selector: 'app-inbox',
  imports: [CommonModule, ArchivedComponent, SentComponent, RecycleComponent, IcdUserManagementComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent implements OnInit, OnDestroy {
  
  // Loading and error states
  isLoading = true;
  error: string | null = null;

  // User information
  currentUser: any = null;
  currentICDUser: FirebaseICDUser | null = null;
  isLoadingUser = true;

  // Tab management
  activeTab: string = 'inbox';

  tabs = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'sent', label: 'Sent' },
    { id: 'icd-user-management', label: 'Users' },
    { id: 'archived', label: 'Archived' },
    { id: 'recycled', label: 'Recycled' }
  ];

  // Filter options
  selectedFilter = 'all';
  filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'documents', label: 'Documents' },
    { value: 'messages', label: 'Messages' },
    { value: 'unread', label: 'Unread' },
    { value: 'priority', label: 'High Priority' }
  ];

  // Mobile filter categories (for the rounded pills) - dynamically updated
  mobileFilterCategories = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'unread', label: 'Unread', count: 0 },
    { id: 'documents', label: 'Documents', count: 0 }
  ];

  selectedMobileFilter = 'all';

  // Message data
  inboxMessages: InboxMessage[] = [];
  filteredMessages: InboxMessage[] = [];
  allMessages: ServiceInboxMessage[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private icdAuthService: ICDAuthService,
    private icdUserService: ICDUserService,
    private inboxService: InboxService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setupInboxStreams();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadUserData(): Promise<void> {
    try {
      this.isLoadingUser = true;
      
      // Subscribe to current authenticated user
      const authSub = this.icdAuthService.currentUser$.subscribe(async (authUser) => {
        this.currentUser = authUser;
        
        if (authUser?.email) {
          console.log('🔍 Loading ICD user data for inbox:', authUser.email);
          
          // Get all users and find current user by email
          const allUsers = await this.icdUserService.getUsers();
          this.currentICDUser = allUsers.find(user => user.email === authUser.email) || null;
          
          if (this.currentICDUser) {
            console.log('✅ Inbox ICD User data loaded:', this.currentICDUser);
          } else {
            console.warn('⚠️ ICD User not found in database for inbox');
          }
        }
        
        this.isLoadingUser = false;
      });

      this.subscriptions.push(authSub);
      
    } catch (error) {
      console.error('❌ Error loading user data for inbox:', error);
      this.isLoadingUser = false;
    }
  }

  private setupInboxStreams(): void {
    // Subscribe to current user changes
    const userSub = this.icdAuthService.currentUser$.subscribe(authUser => {
      if (authUser?.email && authUser?.department) {
        console.log('🔄 Setting up inbox streams for:', authUser.email);
        this.subscribeToInboxMessages(authUser.uid, authUser.email, authUser.department);
      }
    });

    this.subscriptions.push(userSub);
  }

  private subscribeToInboxMessages(userId: string, userEmail: string, department: string): void {
    this.isLoading = true;
    this.error = null;

    // Subscribe to combined inbox messages
    const inboxSub = this.inboxService.getUserInboxMessages(userId, userEmail, department).subscribe({
      next: (messages) => {
        console.log('✅ Received inbox messages via InboxService:', messages);
        
        // Store original messages for attachment access
        this.allMessages = messages;
        
        // Transform messages to inbox format
        this.inboxMessages = messages.map(msg => this.transformMessageToInbox(msg));
        
        // Apply current filter
        this.applyCurrentFilter();
        
        // Update filter counts
        this.updateFilterCounts();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading inbox messages via InboxService:', error);
        this.error = 'Failed to load inbox messages. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(inboxSub);
  }

  private transformMessageToInbox(msg: ServiceInboxMessage): InboxMessage {
    return {
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName || 'Unknown Sender',
      senderEmail: msg.senderId,
      recipientDepartments: msg.recipientDepartments,
      to: msg.to,
      subject: msg.subject || 'No Subject',
      textContent: msg.message || '',
      message: msg.message || '',
      time: this.formatTime(msg.timestamp),
      timestamp: msg.timestamp,
      hasAttachment: !!(msg.attachedFile),
      attachmentName: msg.attachedFile?.name || '',
      attachedFile: msg.attachedFile,
      isRead: this.isMessageRead(msg),
      priority: msg.priority || 'normal',
      category: msg.category || 'general',
      status: msg.status || 'sent',
      messageType: msg.messageType || 'direct',
      readBy: msg.readBy
    };
  }

  private isMessageRead(msg: ServiceInboxMessage): boolean {
    const currentUser = this.icdAuthService.getCurrentUser();
    if (!currentUser || !msg.readBy) return false;
    
    return msg.readBy.includes(currentUser.uid);
  }

  private formatTime(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      let date: Date;
      
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else if (diffInHours < 168) {
        const days = Math.floor(diffInHours / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  }

  private updateFilterCounts(): void {
    const counts = {
      all: this.inboxMessages.length,
      unread: this.inboxMessages.filter(msg => !msg.isRead).length,
      documents: this.inboxMessages.filter(msg => msg.hasAttachment).length
    };

    this.mobileFilterCategories = [
      { id: 'all', label: 'All', count: counts.all },
      { id: 'unread', label: 'Unread', count: counts.unread },
      { id: 'documents', label: 'Documents', count: counts.documents }
    ];
  }

  private applyCurrentFilter(): void {
    switch (this.selectedMobileFilter) {
      case 'unread':
        this.filteredMessages = this.inboxMessages.filter(msg => !msg.isRead);
        break;
      case 'documents':
        this.filteredMessages = this.inboxMessages.filter(msg => msg.hasAttachment);
        break;
      case 'priority':
        this.filteredMessages = this.inboxMessages.filter(msg => msg.priority === 'high');
        break;
      default:
        this.filteredMessages = [...this.inboxMessages];
    }
  }

  // User display methods
  getUserDisplayName(): string {
    if (this.currentICDUser?.fullName) {
      return this.currentICDUser.fullName;
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email.split('@')[0];
    }
    
    return 'User';
  }

  getUserFirstName(): string {
    if (this.currentICDUser?.fullName) {
      return this.currentICDUser.fullName.split(' ')[0];
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email.split('@')[0];
    }
    
    return 'User';
  }

  getUserLastName(): string {
    if (this.currentICDUser?.fullName) {
      const names = this.currentICDUser.fullName.split(' ');
      return names.length > 1 ? names[names.length - 1] : '';
    }
    
    return '';
  }

  getUserRole(): string {
    return this.currentICDUser?.role || 'Medical Staff';
  }

  getUserInitials(): string {
    if (this.currentICDUser?.fullName) {
      const names = this.currentICDUser.fullName.split(' ');
      return names.length >= 2 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email[0].toUpperCase();
    }
    
    return 'U';
  }

  // Navigation and filter methods
  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.selectedMobileFilter = filter;
    this.applyCurrentFilter();
    console.log('Filter changed to:', filter);
  }

  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    this.selectedFilter = filterId;
    this.applyCurrentFilter();
    console.log('Mobile filter changed to:', filterId);
  }

  // Message actions
  async markAsRead(message: InboxMessage): Promise<void> {
    if (!message.id || message.isRead) return;
    
    try {
      await this.inboxService.markAsRead(message.id);
      message.isRead = true;
      this.updateFilterCounts();
      console.log('✅ Message marked as read:', message.id);
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    }
  }

  viewMessage(message: InboxMessage): void {
    console.log('📧 Viewing message:', message.id);
    
    // Mark as read if not already read
    if (!message.isRead) {
      this.markAsRead(message);
    }
    
    // Here you can implement message detail view
    // For now, just log the message
    console.log('Message details:', message);
  }

  downloadAttachment(message: InboxMessage): void {
    if (!message.hasAttachment || !message.id) return;
    
    // Try to get attachment from the message itself first
    if (message.attachedFile) {
      try {
        this.messageService.downloadFileFromBase64(message.attachedFile);
        console.log('✅ Attachment download initiated');
        return;
      } catch (error) {
        console.error('❌ Error downloading attachment directly:', error);
      }
    }
    
    // Fallback: find the original message from allMessages
    const originalMessage = this.allMessages.find(msg => msg.id === message.id);
    if (originalMessage?.attachedFile) {
      try {
        this.messageService.downloadFileFromBase64(originalMessage.attachedFile);
        console.log('✅ Attachment download initiated from original message');
      } catch (error) {
        console.error('❌ Error downloading attachment from original:', error);
      }
    } else {
      console.warn('⚠️ No attachment found for message:', message.id);
    }
  }

  // Refresh data
  async refreshMessages(): Promise<void> {
    this.setupInboxStreams();
  }

  // Utility methods
  trackByItemId(index: number, item: InboxMessage): string {
    return item.id || index.toString();
  }

  getMessageStatusColor(message: InboxMessage): string {
    if (!message.isRead) return 'bg-blue-50 border-l-4 border-l-blue-500';
    return '';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-gray-600 bg-gray-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  formatAttachmentName(name: string, maxLength: number = 20): string {
    if (!name) return 'Attachment';
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  }
}
