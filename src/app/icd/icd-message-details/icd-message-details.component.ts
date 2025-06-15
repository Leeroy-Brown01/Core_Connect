import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SentService, SentMessage } from '../../services/sent.service';

@Component({
  selector: 'app-icd-message-details',
  imports: [CommonModule],
  templateUrl: './icd-message-details.component.html',
  styleUrl: './icd-message-details.component.scss'
})
export class IcdMessageDetailsComponent implements OnInit {
  message: SentMessage | null = null;
  isLoading = true;
  error: string | null = null;
  messageId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sentService: SentService
  ) {}

  ngOnInit(): void {
    this.loadMessageDetails();
  }

  private async loadMessageDetails(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Get message ID from route
      this.messageId = this.route.snapshot.paramMap.get('id');
      
      if (!this.messageId) {
        this.error = 'No message ID provided';
        this.isLoading = false;
        return;
      }

      console.log('📧 Loading message details for ID:', this.messageId);

      // First try to get from selected message (if navigated from sent list)
      this.message = this.sentService.getSelectedMessage();
      
      // If no selected message, fetch from Firestore
      if (!this.message || this.message.id !== this.messageId) {
        console.log('🔍 Fetching message from Firestore...');
        this.message = await this.sentService.getMessageById(this.messageId);
      }

      if (!this.message) {
        this.error = 'Message not found or you do not have permission to view it';
      }

      this.isLoading = false;
    } catch (error) {
      console.error('❌ Error loading message details:', error);
      this.error = 'Failed to load message details. Please try again.';
      this.isLoading = false;
    }
  }

  // Navigate back to sent messages
  goBack(): void {
    this.router.navigate(['/main-layout/sent']);
  }

  // Refresh message details
  async refreshMessage(): Promise<void> {
    if (this.messageId) {
      this.sentService.clearSelectedMessage();
      await this.loadMessageDetails();
    }
  }

  // Format timestamp
  formatTimestamp(timestamp: any): string {
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

  // Get priority color class
  getPriorityColorClass(): string {
    if (!this.message) return 'text-gray-600';
    
    switch (this.message.priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-gray-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }
}
