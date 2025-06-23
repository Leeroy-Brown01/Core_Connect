import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArchivedComponent } from '../archived/archived.component';
import { SentComponent } from '../sent/sent.component';
import { RecycleComponent } from '../recycle/recycle.component';
import { IcdUserManagementComponent } from '../icd-user-management/icd-user-management.component';
import { MessageService, MessageData } from '../../services/message.service';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { InboxService } from '../../services/inbox.service';
import { ICDDownloadsService } from '../../services/icd-downloads.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { IcdDownloadsComponent } from '../icd-downloads/icd-downloads.component';
import { ReplyService, ReplyData, ForwardData } from '../../services/reply.service';
import { ComposeComponent } from '../compose/compose.component';
import { Router } from '@angular/router';

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
  imports: [CommonModule, IcdDownloadsComponent, SentComponent, IcdUserManagementComponent, ComposeComponent],
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
    { id: 'icd-downloads', label: 'Downloads' },
    { id: 'compose', label: 'Compose' },
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
  allMessages: MessageData[] = [];

  // Modal state
  showMessageModal = false;
  selectedModalMessage: InboxMessage | null = null;
  isMarkingAsRead = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private icdAuthService: ICDAuthService,
    private icdUserService: ICDUserService,
    private inboxService: InboxService,
    private icdDownloadsService: ICDDownloadsService,
    private toastService: ToastService,
    private replyService: ReplyService,
    private router: Router
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

  private transformMessageToInbox(msg: any): InboxMessage {
    return {
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName || 'Unknown Sender',
      senderEmail: msg.senderEmail, // Use the actual senderEmail field, not senderId
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

  private isMessageRead(msg: any): boolean {
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
      this.isMarkingAsRead = true;
      await this.inboxService.markAsRead(message.id);
      message.isRead = true;
      
      // Update the selected modal message if it's the same
      if (this.selectedModalMessage?.id === message.id) {
        this.selectedModalMessage.isRead = true;
      }
      
      this.updateFilterCounts();
      console.log('✅ Message marked as read:', message.id);
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
    } finally {
      this.isMarkingAsRead = false;
    }
  }

  viewMessage(message: InboxMessage): void {
    console.log('📧 Opening message modal for:', message.id);
    
    // Set the selected message for the modal
    this.selectedModalMessage = { ...message };
    this.showMessageModal = true;
    
    // Mark as read if not already read
    if (!message.isRead) {
      this.markAsRead(message);
    }
  }

  closeMessageModal(): void {
    this.showMessageModal = false;
    this.selectedModalMessage = null;
    console.log('📧 Message modal closed');
  }

  onModalBackgroundClick(event: MouseEvent): void {
    // Close modal only if clicking on the background (not the modal content)
    if (event.target === event.currentTarget) {
      this.closeMessageModal();
    }
  }

  async downloadAttachment(message: InboxMessage): Promise<void> {
    if (!message.hasAttachment || !message.id) {
      this.toastService?.warning('No attachment available');
      return;
    }
    
    try {
      console.log('📥 Downloading attachment from inbox message:', message.id);
      
      const currentUser = this.icdAuthService.getCurrentUser();
      if (!currentUser) {
        this.toastService?.error('User not authenticated');
        return;
      }

      const userId = currentUser.uid || currentUser.email;

      // Try to get attachment from the message itself first
      if (message.attachedFile) {
        try {
          // Download the file using message service
          this.messageService.downloadFileFromBase64(message.attachedFile);
          
          // Log the download to icd-downloads collection with proper data handling
          const downloadLogData: any = {
            fileName: message.attachedFile.name || 'unknown-file',
            fileSize: message.attachedFile.size || 0,
            fileType: message.attachedFile.type || 'application/octet-stream',
            category: 'Inbox Messages',
            subject: message.subject || 'No Subject',
            senderName: message.senderName || 'Unknown Sender',
            messageId: message.id
          };

          // Only add optional fields if they exist
          if (message.senderEmail) {
            downloadLogData.senderEmail = message.senderEmail;
          }

          if (message.attachedFile.base64Content) {
            downloadLogData.fileData = message.attachedFile.base64Content;
          }

          await this.icdDownloadsService.logDownload(userId, downloadLogData);

          this.toastService?.success(`Downloaded: ${message.attachedFile.name}`);
          console.log('✅ Attachment downloaded and logged from inbox');
          return;
        } catch (error) {
          console.error('❌ Error downloading attachment directly:', error);
        }
      }
      
      // Fallback: find the original message from allMessages if needed
      const originalMessage = this.allMessages.find(msg => msg.id === message.id);
      if (originalMessage?.attachedFile) {
        try {
          this.messageService.downloadFileFromBase64(originalMessage.attachedFile);
          
          // Log the download with proper data handling
          const downloadLogData: any = {
            fileName: originalMessage.attachedFile.name || 'unknown-file',
            fileSize: originalMessage.attachedFile.size || 0,
            fileType: originalMessage.attachedFile.type || 'application/octet-stream',
            category: 'Inbox Messages',
            subject: message.subject || 'No Subject',
            senderName: message.senderName || 'Unknown Sender',
            messageId: message.id
          };

          // Only add optional fields if they exist
          if (message.senderEmail) {
            downloadLogData.senderEmail = message.senderEmail;
          }

          if (originalMessage.attachedFile.base64Content) {
            downloadLogData.fileData = originalMessage.attachedFile.base64Content;
          }

          await this.icdDownloadsService.logDownload(userId, downloadLogData);

          this.toastService?.success(`Downloaded: ${originalMessage.attachedFile.name}`);
          console.log('✅ Attachment downloaded and logged from fallback');
        } catch (error) {
          console.error('❌ Error downloading attachment from fallback:', error);
          this.toastService?.error('Failed to download attachment');
        }
      } else {
        console.warn('⚠️ No attachment found for message:', message.id);
        this.toastService?.warning('Attachment not found');
      }
    } catch (error) {
      console.error('❌ Error in downloadAttachment:', error);
      this.toastService?.error('Failed to download attachment');
    }
  }

  // Modal-specific methods
  getModalRecipientDisplay(): string {
    if (!this.selectedModalMessage) return 'Unknown';
    
    if (this.selectedModalMessage.to && this.selectedModalMessage.to !== '') {
      return this.selectedModalMessage.to;
    }
    
    if (this.selectedModalMessage.recipientDepartments && this.selectedModalMessage.recipientDepartments.length > 0) {
      return this.selectedModalMessage.recipientDepartments.join(', ');
    }
    
    return 'Unknown Recipient';
  }

  getModalStatusColor(): string {
    if (!this.selectedModalMessage) return 'bg-gray-100 text-gray-700';
    
    switch (this.selectedModalMessage.status) {
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getModalStatusIcon(): string {
    if (!this.selectedModalMessage) return '📧';
    
    switch (this.selectedModalMessage.status) {
      case 'sent': return '📧';
      case 'delivered': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '📧';
    }
  }

  async replyToMessage(): Promise<void> {
    if (!this.selectedModalMessage) {
      console.warn('No message selected for reply');
      return;
    }
    
    console.log('📧 Preparing reply to message:', this.selectedModalMessage.id);
    console.log('📧 Message data:', {
      senderEmail: this.selectedModalMessage.senderEmail,
      senderId: this.selectedModalMessage.senderId,
      senderName: this.selectedModalMessage.senderName
    });
    
    // Get current user data for context
    const currentUser = this.icdAuthService.getCurrentUser();
    if (!currentUser) {
      this.toastService?.error('User not authenticated');
      return;
    }

    // Get sender's email - try multiple approaches
    let senderEmail = this.selectedModalMessage.senderEmail;
    
    // If no email, try to look it up using the senderId
    if (!senderEmail && this.selectedModalMessage.senderId) {
      try {
        console.log('🔍 Looking up sender email for senderId:', this.selectedModalMessage.senderId);
        
        // Get all users and find by senderId - try multiple matching strategies
        const allUsers = await this.icdUserService.getUsers();
        console.log('👥 Available users for lookup:', allUsers.map(u => ({ 
          id: u.id, 
          email: u.email, 
          fullName: u.fullName 
        })));
        
        let senderUser = allUsers.find(user => 
          user.id === this.selectedModalMessage!.senderId
        );
        
        // If not found by id, try email field
        if (!senderUser) {
          senderUser = allUsers.find(user => 
            user.email === this.selectedModalMessage!.senderId
          );
        }
        
        // If still not found, try any field that might contain the senderId
        if (!senderUser) {
          senderUser = allUsers.find(user => 
            user.id === this.selectedModalMessage!.senderId || // if uid field exists
            (user as any).firebaseUid === this.selectedModalMessage!.senderId // if firebaseUid field exists
          );
        }
        
        if (senderUser) {
          senderEmail = senderUser.email;
          console.log('✅ Found sender email via user lookup:', senderEmail);
        } else {
          console.warn('⚠️ No user found for senderId:', this.selectedModalMessage.senderId);
          console.warn('⚠️ Searched in users with IDs:', allUsers.map(u => u.id));
        }
      } catch (error) {
        console.error('❌ Error looking up sender email:', error);
      }
    }

    // If still no email and senderId looks like an email, use it directly
    if (!senderEmail && this.selectedModalMessage.senderId?.includes('@')) {
      senderEmail = this.selectedModalMessage.senderId;
      console.log('📧 Using senderId as email fallback:', senderEmail);
    }

    // Try to get email from the original message data if available
    if (!senderEmail && this.allMessages.length > 0) {
      const originalMessage = this.allMessages.find(msg => msg.id === this.selectedModalMessage!.id);
      if (originalMessage?.senderEmail) {
        senderEmail = originalMessage.senderEmail;
        console.log('📧 Found sender email from original message data:', senderEmail);
      }
    }

    // Final validation
    if (!senderEmail || !senderEmail.includes('@')) {
      // Show more detailed error information
      this.toastService?.warning(`Cannot determine sender email address for reply. Please contact ${this.selectedModalMessage.senderName} directly.`);
      console.error('❌ No valid sender email found after all attempts:', {
        senderEmail: this.selectedModalMessage.senderEmail,
        senderId: this.selectedModalMessage.senderId,
        senderName: this.selectedModalMessage.senderName,
        availableUserCount: (await this.icdUserService.getUsers()).length
      });
      return;
    }

    // Prepare reply data
    const replyData: ReplyData = {
      replyTo: senderEmail,
      replyToName: this.selectedModalMessage.senderName || 'Unknown Sender',
      originalSubject: this.selectedModalMessage.subject || 'No Subject',
      originalMessage: this.selectedModalMessage.message || '',
      originalMessageId: this.selectedModalMessage.id || '',
      originalTimestamp: this.selectedModalMessage.timestamp,
      isReply: true
    };

    // Set reply data in service
    this.replyService.setReplyData(replyData);
    
    // Close modal
    this.closeMessageModal();
    
    // Navigate to compose tab
    this.activeTab = 'compose';
    
    // Show success message
    this.toastService?.info(`Replying to: ${replyData.replyToName} (${senderEmail})`);
    
    console.log('✅ Reply data set, navigating to compose with email:', senderEmail);
  }

  forwardMessage(): void {
    if (!this.selectedModalMessage) return;
    
    console.log('📤 Preparing to forward message:', this.selectedModalMessage.id);
    
    // Get current user data for context
    const currentUser = this.icdAuthService.getCurrentUser();
    if (!currentUser) {
      this.toastService?.error('User not authenticated');
      return;
    }

    // Use sender's email from the message, fallback to senderId if no email
    const senderEmail = this.selectedModalMessage.senderEmail || this.selectedModalMessage.senderId || '';

    // Prepare forward data
    const forwardData: ForwardData = {
      originalSubject: this.selectedModalMessage.subject || 'No Subject',
      originalMessage: this.selectedModalMessage.message || '',
      originalSender: this.selectedModalMessage.senderName || 'Unknown Sender',
      originalSenderEmail: senderEmail,
      originalMessageId: this.selectedModalMessage.id || '',
      originalTimestamp: this.selectedModalMessage.timestamp,
      isForward: true
    };

    // Set forward data in service
    this.replyService.setForwardData(forwardData);
    
    // Close modal
    this.closeMessageModal();
    
    // Navigate to compose tab
    this.activeTab = 'compose';
    
    // Show success message
    this.toastService?.info(`Forwarding message from: ${forwardData.originalSender}`);
    
    console.log('✅ Forward data set, navigating to compose');
  }

  archiveMessage(): void {
    if (!this.selectedModalMessage?.id) return;
    
    console.log('📦 Archiving message:', this.selectedModalMessage.id);
    
    // Here you would implement the archive functionality
    // For now, just close the modal
    this.closeMessageModal();
  }

  async deleteMessage(): Promise<void> {
    if (!this.selectedModalMessage?.id) return;
    
    const confirmed = confirm(`Are you sure you want to delete the message "${this.selectedModalMessage.subject}"? This action cannot be undone.`);
    if (confirmed) {
      try {
        console.log('🗑️ Deleting message:', this.selectedModalMessage.id);
        
        // Show loading state
        this.isMarkingAsRead = true; // Reuse loading state for delete
        
        // Delete the message using message service
        await this.messageService.deleteMessage(this.selectedModalMessage.id);
        
        // Remove from local arrays
        this.inboxMessages = this.inboxMessages.filter(msg => msg.id !== this.selectedModalMessage!.id);
        this.filteredMessages = this.filteredMessages.filter(msg => msg.id !== this.selectedModalMessage!.id);
        
        // Update filter counts
        this.updateFilterCounts();
        
        // Close modal
        this.closeMessageModal();
        
        // Show success message
        this.toastService?.success('Message deleted successfully');
        
        console.log('✅ Message deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting message:', error);
        this.toastService?.error('Failed to delete message. Please try again.');
      } finally {
        this.isMarkingAsRead = false;
      }
    }
  }

  formatTimestamp(timestamp: any): string {
    return this.formatTime(timestamp);
  }

  // Refresh data
  async refreshMessages(): Promise<void> {
    await this.setupInboxStreams();
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
