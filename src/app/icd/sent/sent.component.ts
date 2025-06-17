import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SentService, SentMessage } from '../../services/sent.service';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { ICDDownloadsService } from '../../services/icd-downloads.service';
import { ToastService } from '../../services/toast.service';
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
    private icdUserService: ICDUserService,
    private icdDownloadsService: ICDDownloadsService,
    private toastService: ToastService
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

  // Download attachment with logging
  async downloadAttachment(message: SentMessage): Promise<void> {
    if (!message.hasAttachment) {
      console.warn('No attachment to download');
      this.toastService.warning('No attachment available');
      return;
    }

    try {
      console.log('📥 Downloading attachment from sent message:', message.id);
      
      const currentUser = this.icdAuthService.getCurrentUser();
      if (!currentUser) {
        this.toastService.error('User not authenticated');
        return;
      }

      const userId = currentUser.uid || currentUser.email;

      // Check if message has attachedFile property (the correct property name)
      if (message.attachedFile) {
        // Download the file using the attachedFile structure
        this.downloadFromBase64({
          fileName: message.attachedFile.name || 'attachment',
          fileType: message.attachedFile.type || 'application/octet-stream',
          attachmentData: message.attachedFile.base64Content
        });

        // Log the download to icd-downloads collection with proper data handling
        const downloadLogData: any = {
          fileName: message.attachedFile.name || 'attachment',
          fileSize: message.attachedFile.size || 0,
          fileType: message.attachedFile.type || 'application/octet-stream',
          category: 'Sent Messages',
          subject: message.subject || 'No Subject',
          senderName: currentUser.fullName || currentUser.email || 'Unknown',
          messageId: message.id || ''
        };

        // Only add optional fields if they exist
        if (currentUser.email) {
          downloadLogData.senderEmail = currentUser.email;
        }

        if (message.attachedFile.base64Content) {
          downloadLogData.fileData = message.attachedFile.base64Content;
        }

        await this.icdDownloadsService.logDownload(userId, downloadLogData);

        this.toastService.success(`Downloaded: ${message.attachedFile.name || 'attachment'}`);
        console.log('✅ Attachment downloaded and logged from sent messages');
      } else {
        console.warn('⚠️ No attachment file data available');
        this.toastService.warning('Attachment data not available');
      }
    } catch (error) {
      console.error('❌ Error downloading attachment:', error);
      this.toastService.error('Failed to download attachment');
    }
  }

  private downloadFromBase64(attachment: { fileName: string; fileType: string; attachmentData: string }): void {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(attachment.attachmentData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.fileType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log('✅ File downloaded from base64 successfully');
    } catch (error) {
      console.error('❌ Error in downloadFromBase64:', error);
      throw error;
    }
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

  // User display methods - These should show the CURRENT logged-in user, not the message sender
  getUserDisplayName(): string {
    if (this.currentICDUser?.fullName) {
      return this.currentICDUser.fullName;
    }
    
    if (this.currentUser?.fullName) {
      return this.currentUser.fullName;
    }
    
    if (this.currentUser?.displayName) {
      return this.currentUser.displayName;
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
    
    if (this.currentUser?.fullName) {
      return this.currentUser.fullName.split(' ')[0];
    }
    
    if (this.currentUser?.displayName) {
      return this.currentUser.displayName.split(' ')[0];
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
    
    if (this.currentUser?.fullName) {
      const names = this.currentUser.fullName.split(' ');
      return names.length >= 2 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email[0].toUpperCase();
    }
    
    return 'U';
  }

  // Get the CURRENT user's email for display
  getCurrentUserEmail(): string {
    return this.currentUser?.email || 'Unknown';
  }

  // Get the MESSAGE sender's information (different from current user)
  getMessageSenderName(message: SentMessage): string {
    return message.senderName || 'Unknown Sender';
  }

  getMessageSenderInitials(message: SentMessage): string {
    if (message.senderName) {
      const names = message.senderName.split(' ');
      return names.length >= 2 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return 'S';
  }

  // Forward message
  forwardMessage(message: SentMessage | null): void {
    if (!message) {
      console.warn('No message to forward');
      this.toastService.warning('No message selected');
      return;
    }

    try {
      console.log('📤 Forwarding sent message:', message.id);
      
      // Set the message for forwarding in the sent service
      this.sentService.setMessageForForwarding(message);
      
      // Show success notification
      this.toastService.success('Message prepared for forwarding');
      
      // Close the modal
      this.closeModal();
      
      // You might want to navigate to compose or open a compose modal here
      // For now, we'll just log the action
      console.log('✅ Message set for forwarding');
      
    } catch (error) {
      console.error('❌ Error forwarding message:', error);
      this.toastService.error('Failed to forward message');
    }
  }
}
