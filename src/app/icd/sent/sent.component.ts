import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SentService, SentMessage } from '../../services/sent.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sent',
  imports: [CommonModule],
  templateUrl: './sent.component.html',
  styleUrl: './sent.component.scss'
})
export class SentComponent implements OnInit, OnDestroy {
  // Loading and error states
  isLoading = true;
  error: string | null = null;

  // Data
  sentMessages: SentMessage[] = [];
  filteredMessages: SentMessage[] = [];
  
  // Modal state
  showModal = false;
  selectedMessage: SentMessage | null = null;

  // Filter options
  selectedFilter = 'all';
  filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'recent', label: 'Recent' }
  ];

  // Mobile filter categories (dynamically updated with real counts)
  mobileFilterCategories = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'documents', label: 'Documents', count: 0 },
    { id: 'delivered', label: 'Delivered', count: 0 }
  ];

  selectedMobileFilter = 'all';
  
  private subscription?: Subscription;

  constructor(
    private sentService: SentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSentMessages();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async loadSentMessages(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      console.log('🔄 Loading sent messages...');
      
      this.subscription = this.sentService.getSentMessages().subscribe({
        next: (messages) => {
          console.log('✅ Received sent messages:', messages);
          this.sentMessages = messages;
          this.filteredMessages = messages;
          this.updateFilterCounts();
          this.applyCurrentFilter();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading sent messages:', error);
          this.error = 'Failed to load sent messages. Please try again.';
          this.isLoading = false;
        }
      });
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
      { id: 'delivered', label: 'Delivered', count: counts.delivered }
    ];
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyCurrentFilter();
    console.log('Filter changed to:', filter);
  }

  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    this.selectedFilter = filterId;
    this.applyCurrentFilter();
    console.log('Mobile filter changed to:', filterId);
  }

  private applyCurrentFilter(): void {
    this.filteredMessages = this.sentService.filterMessages(this.sentMessages, this.selectedFilter);
  }

  // Refresh data
  async refreshMessages(): Promise<void> {
    await this.loadSentMessages();
  }

  trackByMessageId(index: number, message: SentMessage): string {
    return message.id || index.toString();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'delivered': return '✓';
      case 'sent': return '📤';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '📧';
    }
  }

  // Format time using service method
  formatMessageTime(timestamp: any): string {
    return this.sentService.formatTime(timestamp);
  }

  // Get recipient display name
  getRecipientDisplay(message: SentMessage): string {
    if (message.to && message.to !== '') {
      return message.to;
    }
    
    if (message.recipientDepartments && message.recipientDepartments.length > 0) {
      return message.recipientDepartments.join(', ');
    }
    
    return 'Unknown Recipient';
  }

  // Get priority color
  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-gray-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  // Modal methods
  viewMessage(message: SentMessage): void {
    console.log('📧 Viewing message:', message.id);
    this.selectedMessage = message;
    this.showModal = true;
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    console.log('🔒 Closing modal');
    
    // Add closing animation class (optional)
    const modalElement = document.querySelector('.modal-content');
    if (modalElement) {
      modalElement.classList.add('modal-closing');
    }
    
    // Close after animation
    setTimeout(() => {
      this.showModal = false;
      this.selectedMessage = null;
      
      // Restore body scroll
      document.body.style.overflow = 'auto';
    }, 150);
  }

  // Close modal when clicking outside
  onModalBackgroundClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Escape key handler for modal
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.showModal) {
      this.closeModal();
    }
  }

  // Format timestamp for modal
  formatTimestamp(timestamp: any): string {
    return this.sentService.formatTime(timestamp);
  }

  // Get status color class for modal
  getStatusColorClass(): string {
    if (!this.selectedMessage) return 'bg-gray-100 text-gray-700';
    
    switch (this.selectedMessage.status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // Get recipient display for modal
  getModalRecipientDisplay(): string {
    if (!this.selectedMessage) return 'Unknown';
    
    if (this.selectedMessage.to && this.selectedMessage.to !== '') {
      return this.selectedMessage.to;
    }
    
    if (this.selectedMessage.recipientDepartments && this.selectedMessage.recipientDepartments.length > 0) {
      return this.selectedMessage.recipientDepartments.join(', ');
    }
    
    return 'Unknown Recipient';
  }

  // Download attachment method
  downloadAttachment(message: SentMessage): void {
    if (!message.hasAttachment) {
      console.warn('No attachment to download');
      return;
    }

    try {
      console.log('📥 Downloading attachment for message:', message.id);
      
      // For now, we'll simulate the download since we're using the SentService
      // In a real implementation, you'd fetch the actual file data
      const fileName = message.attachmentName || 'attachment.txt';
      const fileContent = `Attachment from message: ${message.subject}\nSent by: ${message.senderName}\nSent on: ${this.formatTimestamp(message.timestamp)}`;
      
      // Create a blob and download
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Attachment download initiated:', fileName);
      
      // Show success message (you can implement a toast notification here)
      this.showDownloadSuccess(fileName);
      
    } catch (error) {
      console.error('❌ Error downloading attachment:', error);
      this.showDownloadError();
    }
  }

  // Forward message method
  forwardMessage(message: SentMessage): void {
    console.log('📤 Forwarding message:', message.id);
    
    // Close modal first
    this.closeModal();
    
    // Navigate to compose with pre-filled data
    // You can pass the message data as query parameters or use a service
    this.router.navigate(['/main-layout/compose'], {
      queryParams: {
        forward: 'true',
        originalSubject: message.subject,
        originalMessage: message.message,
        originalSender: message.senderName
      }
    });
  }

  // Show download success message (placeholder for toast notification)
  private showDownloadSuccess(fileName: string): void {
    // For now, just log. You can implement a proper toast notification later
    console.log(`✅ Download started: ${fileName}`);
    
    // Simple alert for now (replace with proper notification)
    alert(`Download started: ${fileName}`);
  }

  // Show download error message (placeholder for toast notification)
  private showDownloadError(): void {
    console.log('❌ Download failed');
    
    // Simple alert for now (replace with proper notification)
    alert('Failed to download attachment. Please try again.');
  }
}
