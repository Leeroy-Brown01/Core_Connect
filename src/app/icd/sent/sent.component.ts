import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentService, SentMessage } from '../../services/sent.service';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sent.component.html',
  styleUrl: './sent.component.scss'
})
export class SentComponent implements OnInit, OnDestroy {
  
  // Loading and error states
  isLoading = true;
  error: string | null = null;

  // User information
  currentUser: any = null;
  currentICDUser: FirebaseICDUser | null = null;
  isLoadingUser = true;

  // Message data
  sentMessages: SentMessage[] = [];
  filteredMessages: SentMessage[] = [];

  // Filter options
  selectedMobileFilter = 'all';
  mobileFilterCategories = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'documents', label: 'Documents', count: 0 },
    { id: 'recent', label: 'Recent', count: 0 }
  ];

  // Modal state
  showModal = false;
  selectedMessage: SentMessage | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private sentService: SentService,
    private icdAuthService: ICDAuthService,
    private icdUserService: ICDUserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadSentMessages();
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
          console.log('🔍 Loading ICD user data for sent component:', authUser.email);
          
          // Get all users and find current user by email
          const allUsers = await this.icdUserService.getUsers();
          this.currentICDUser = allUsers.find(user => user.email === authUser.email) || null;
          
          if (this.currentICDUser) {
            console.log('✅ Sent ICD User data loaded:', this.currentICDUser);
          } else {
            console.warn('⚠️ ICD User not found in database for sent component');
          }
        }
        
        this.isLoadingUser = false;
      });

      this.subscriptions.push(authSub);
      
    } catch (error) {
      console.error('❌ Error loading user data for sent component:', error);
      this.isLoadingUser = false;
    }
  }

  private async loadSentMessages(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      console.log('🔄 Loading sent messages...');

      // Get current user
      const currentUser = this.icdAuthService.getCurrentUser();
      if (!currentUser) {
        this.error = 'No authenticated user found';
        this.isLoading = false;
        return;
      }

      // Fetch sent messages
      const sentSub = this.sentService.getSentMessages().subscribe({
        next: (messages) => {
          this.sentMessages = messages;
          console.log('✅ Received sent messages:', this.sentMessages);
          
          // Apply current filter
          this.applyCurrentFilter();
          
          // Update filter counts
          this.updateFilterCounts();
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading sent messages:', error);
          this.error = 'Failed to load sent messages. Please try again.';
          this.isLoading = false;
        }
      });

      this.subscriptions.push(sentSub);

    } catch (error) {
      console.error('❌ Error in loadSentMessages:', error);
      this.error = 'Failed to load sent messages. Please try again.';
      this.isLoading = false;
    }
  }

  private updateFilterCounts(): void {
    const counts = this.sentService.getMessageCounts(this.sentMessages);
    
    this.mobileFilterCategories = [
      { id: 'all', label: 'All', count: counts.all },
      { id: 'documents', label: 'Documents', count: counts.documents },
      { id: 'recent', label: 'Recent', count: this.sentService.filterMessages(this.sentMessages, 'recent').length }
    ];
  }

  private applyCurrentFilter(): void {
    this.filteredMessages = this.sentService.filterMessages(this.sentMessages, this.selectedMobileFilter);
  }

  // Filter methods
  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    this.applyCurrentFilter();
    console.log('Mobile filter changed to:', filterId);
  }

  // Message actions
  viewMessage(message: SentMessage): void {
    console.log('📧 Viewing sent message:', message.id);
    this.selectedMessage = message;
    this.sentService.setSelectedMessage(message);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMessage = null;
    this.sentService.clearSelectedMessage();
  }

  onModalBackgroundClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Download attachment
  downloadAttachment(message: SentMessage): void {
    if (!message.hasAttachment) {
      console.warn('No attachment to download');
      return;
    }

    try {
      this.sentService.downloadAttachment(message);
      console.log('✅ Attachment download initiated');
    } catch (error) {
      console.error('❌ Error downloading attachment:', error);
    }
  }

  // Forward message
  forwardMessage(message: SentMessage): void {
    console.log('📤 Forwarding message:', message.id);
    // Implementation for forwarding message
  }

  // Refresh data
  async refreshMessages(): Promise<void> {
    await this.loadSentMessages();
  }

  // Utility methods
  trackByMessageId(index: number, item: SentMessage): string {
    return item.id || index.toString();
  }

  getRecipientDisplay(message: SentMessage): string {
    if (message.to && message.to !== '') {
      return message.to;
    }
    
    if (message.recipientDepartments && message.recipientDepartments.length > 0) {
      return message.recipientDepartments.join(', ');
    }
    
    return 'Unknown Recipient';
  }

  getModalRecipientDisplay(): string {
    if (!this.selectedMessage) return 'Unknown';
    return this.getRecipientDisplay(this.selectedMessage);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getStatusColorClass(): string {
    if (!this.selectedMessage) return 'bg-gray-100 text-gray-700';
    return this.getStatusColor(this.selectedMessage.status);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent': return '📤';
      case 'delivered': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '📧';
    }
  }

  formatMessageTime(timestamp: any): string {
    return this.sentService.formatTime(timestamp);
  }

  formatTimestamp(timestamp: any): string {
    return this.sentService.formatTime(timestamp);
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
}
