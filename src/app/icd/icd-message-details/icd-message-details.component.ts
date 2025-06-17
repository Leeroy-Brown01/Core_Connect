import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SentService, SentMessage } from '../../services/sent.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-icd-message-details',
  standalone: true,
  imports: [CommonModule],
  providers: [SentService],
  templateUrl: './icd-message-details.component.html',
  styleUrl: './icd-message-details.component.scss'
})
export class IcdMessageDetailsComponent implements OnInit, OnDestroy {
  message: SentMessage | null = null;
  isLoading = true;
  error: string | null = null;
  
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sentService: SentService
  ) {}

  ngOnInit(): void {
    this.loadMessage();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async loadMessage(): Promise<void> {
    try {
      const messageId = this.route.snapshot.paramMap.get('id');
      if (!messageId) {
        this.error = 'Message ID not found';
        this.isLoading = false;
        return;
      }

      this.message = await this.sentService.getMessageById(messageId);
      if (!this.message) {
        this.error = 'Message not found';
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading message:', error);
      this.error = 'Failed to load message';
      this.isLoading = false;
    }
  }

  // Refresh message data
  async refreshMessage(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    await this.loadMessage();
  }

  goBack(): void {
    this.router.navigate(['/main-layout/inbox']);
  }

  formatTime(timestamp: any): string {
    return this.sentService.formatTime(timestamp);
  }

  // Get recipient display
  getRecipientDisplay(): string {
    if (!this.message) return 'Unknown';
    
    if (this.message.to && this.message.to !== '') {
      return this.message.to;
    }
    
    if (this.message.recipientDepartments && this.message.recipientDepartments.length > 0) {
      return this.message.recipientDepartments.join(', ');
    }
    
    return 'Unknown Recipient';
  }

  // Get status color class
  getStatusColorClass(): string {
    if (!this.message) return 'bg-gray-100 text-gray-700';
    
    switch (this.message.status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // Get status icon
  getStatusIcon(): string {
    if (!this.message) return '📧';
    
    switch (this.message.status) {
      case 'delivered': return '✓';
      case 'sent': return '📤';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '📧';
    }
  }

  // Download attachment
  downloadAttachment(): void {
    if (!this.message?.hasAttachment) {
      console.warn('No attachment to download');
      return;
    }

    try {
      console.log('📥 Downloading attachment for message:', this.message.id);
      
      // For now, we'll simulate the download since we're using the SentService
      // In a real implementation, you'd fetch the actual file data
      const fileName = this.message.attachmentName || 'attachment.txt';
      const fileContent = `Attachment from message: ${this.message.subject}\nSent by: ${this.message.senderName}\nSent on: ${this.formatTime(this.message.timestamp)}`;
      
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
      
    } catch (error) {
      console.error('❌ Error downloading attachment:', error);
    }
  }

  // Forward message
  forwardMessage(): void {
    if (!this.message) return;
    
    console.log('📤 Forwarding message:', this.message.id);
    
    // Navigate to compose with pre-filled data
    this.router.navigate(['/main-layout/compose'], {
      queryParams: {
        forward: 'true',
        originalSubject: this.message.subject,
        originalMessage: this.message.message,
        originalSender: this.message.senderName
      }
    });
  }

  // Reply to message
  replyToMessage(): void {
    if (!this.message) return;
    
    console.log('📧 Replying to message:', this.message.id);
    
    // Navigate to compose with reply data
    this.router.navigate(['/main-layout/compose'], {
      queryParams: {
        reply: 'true',
        replyTo: this.message.senderName,
        originalSubject: this.message.subject,
        originalMessage: this.message.message
      }
    });
  }

  // Delete message
  deleteMessage(): void {
    if (!this.message?.id) return;
    
    const confirmed = confirm('Are you sure you want to delete this message?');
    if (confirmed) {
      console.log('🗑️ Deleting message:', this.message.id);
      // Implementation would call message service to delete
      // For now, just navigate back
      this.goBack();
    }
  }

  // Archive message
  archiveMessage(): void {
    if (!this.message?.id) return;
    
    console.log('📦 Archiving message:', this.message.id);
    // Implementation would call message service to archive
    // For now, just navigate back
    this.goBack();
  }
}
