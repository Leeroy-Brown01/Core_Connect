import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { MessageService, MessageData } from './message.service';
import { ICDAuthService } from './icd-auth.service';

export interface SentMessage {
  id?: string;
  senderId: string;
  senderName: string;
  to: string;
  recipientDepartments: string[];
  subject: string;
  message: string;
  timestamp: any;
  status: 'sent' | 'delivered' | 'pending' | 'failed';
  hasAttachment?: boolean;
  attachmentName?: string;
  attachedFile?: {
    name: string;
    size: number;
    type: string;
    base64Content: string;
  };
  priority?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SentService {
  private selectedMessage: SentMessage | null = null;
  private messageForForwarding: SentMessage | null = null;
  private messageService = inject(MessageService);
  private icdAuthService = inject(ICDAuthService);

  constructor() {
    console.log('SentService initialized with MessageService integration');
  }

  // Get sent messages for current user
  getSentMessages(): Observable<SentMessage[]> {
    return from(this.fetchSentMessages());
  }

  private async fetchSentMessages(): Promise<SentMessage[]> {
    try {
      const currentUser = this.icdAuthService.getCurrentUser();
      if (!currentUser) {
        console.warn('SentService: No authenticated user found via ICDAuthService');
        return [];
      }

      // Log extensive user information for debugging
      console.log('SentService.fetchSentMessages - Current User from ICDAuthService:', {
        uid: currentUser.uid,
        email: currentUser.email,
        fullName: currentUser.fullName,
        displayName: currentUser.displayName
      });

      console.log('🔍 Fetching sent messages for user:', currentUser.email);
      
      // Use the message service to get sent messages
      const allMessages = await this.messageService.getSentMessages();
      console.log(`📤 Received ${allMessages.length} total sent messages from MessageService`);

      // Filter messages by current user - use both email and uid for matching
      const userMessages = allMessages.filter(msg => {
        const isMatch = msg.senderId === currentUser.uid || 
                       msg.senderId === currentUser.email ||
                       (msg.senderEmail && msg.senderEmail === currentUser.email);
        
        if (isMatch) {
          console.log('✅ Message matches current user:', {
            messageId: msg.id,
            messageSenderId: msg.senderId,
            messageSenderEmail: msg.senderEmail,
            messageSenderName: msg.senderName,
            currentUserUid: currentUser.uid,
            currentUserEmail: currentUser.email,
            currentUserFullName: currentUser.fullName
          });
        }
        
        return isMatch;
      });

      console.log(`🔍 Filtered to ${userMessages.length} messages for current user`);
      
      if (userMessages.length === 0) {
        console.warn('⚠️ No sent messages found for current user:', {
          currentUserUid: currentUser.uid,
          currentUserEmail: currentUser.email,
          currentUserFullName: currentUser.fullName,
          totalMessages: allMessages.length,
          sampleMessageSenderIds: allMessages.slice(0, 3).map(m => ({ 
            id: m.id, 
            senderId: m.senderId, 
            senderEmail: m.senderEmail,
            senderName: m.senderName 
          }))
        });
      }

      // Transform MessageData to SentMessage format
      const sentMessages = userMessages.map(msg => this.transformToSentMessage(msg));
      
      console.log(`✅ Transformed ${sentMessages.length} sent messages for current user`);
      return sentMessages;
    } catch (error) {
      console.error('❌ Error fetching sent messages:', error);
      return [];
    }
  }

  private transformToSentMessage(msg: MessageData): SentMessage {
    return {
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      to: msg.to,
      recipientDepartments: msg.recipientDepartments || [],
      subject: msg.subject,
      message: msg.message,
      timestamp: msg.timestamp,
      status: 'sent', // Default to sent since we're fetching sent messages
      hasAttachment: !!(msg.attachedFile),
      attachmentName: msg.attachedFile?.name || '',
      attachedFile: msg.attachedFile,
      priority: msg.priority || 'normal',
      category: msg.category || 'general'
    };
  }

  // Set selected message for details view
  setSelectedMessage(message: SentMessage): void {
    this.selectedMessage = message;
    console.log('📧 Selected message set:', message.id);
  }

  // Get selected message
  getSelectedMessage(): SentMessage | null {
    return this.selectedMessage;
  }

  // Get message by ID (for direct URL access)
  async getMessageById(messageId: string): Promise<SentMessage | null> {
    try {
      const currentUser = this.icdAuthService.getCurrentUser();
      if (!currentUser) {
        console.warn('No authenticated user found');
        return null;
      }

      console.log('🔍 Fetching message by ID:', messageId);
      
      // Get all sent messages and find the specific one
      const sentMessages = await this.fetchSentMessages();
      const message = sentMessages.find(msg => msg.id === messageId);
      
      if (message) {
        console.log('✅ Message found:', message);
        return message;
      }
      
      console.log('❌ Message not found');
      return null;
    } catch (error) {
      console.error('❌ Error fetching message by ID:', error);
      return null;
    }
  }

  // Clear selected message
  clearSelectedMessage(): void {
    this.selectedMessage = null;
  }

  // Message forwarding methods
  setMessageForForwarding(message: SentMessage): void {
    this.messageForForwarding = message;
    console.log('📤 Message set for forwarding:', message.id);
  }

  getMessageForForwarding(): SentMessage | null {
    return this.messageForForwarding;
  }

  clearMessageForForwarding(): void {
    this.messageForForwarding = null;
  }

  // Format timestamp
  formatTime(timestamp: any): string {
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

  // Get message counts for filters
  getMessageCounts(messages: SentMessage[]): { all: number; delivered: number; pending: number; failed: number; documents: number } {
    return {
      all: messages.length,
      delivered: messages.filter(msg => msg.status === 'delivered').length,
      pending: messages.filter(msg => msg.status === 'pending').length,
      failed: messages.filter(msg => msg.status === 'failed').length,
      documents: messages.filter(msg => msg.hasAttachment).length
    };
  }

  // Filter messages
  filterMessages(messages: SentMessage[], filterType: string): SentMessage[] {
    switch (filterType) {
      case 'delivered':
        return messages.filter(msg => msg.status === 'delivered');
      case 'pending':
        return messages.filter(msg => msg.status === 'pending');
      case 'failed':
        return messages.filter(msg => msg.status === 'failed');
      case 'documents':
        return messages.filter(msg => msg.hasAttachment);
      case 'recent':
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return messages.filter(msg => {
          if (!msg.timestamp) return false;
          const msgDate = msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
          return msgDate > twentyFourHoursAgo;
        });
      default:
        return messages;
    }
  }

  // Download attachment from sent message
  downloadAttachment(message: SentMessage): void {
    if (!message.hasAttachment || !message.attachedFile) {
      console.warn('No attachment to download');
      return;
    }

    try {
      this.messageService.downloadFileFromBase64(message.attachedFile);
      console.log('✅ Attachment download initiated from sent message');
    } catch (error) {
      console.error('❌ Error downloading attachment from sent message:', error);
    }
  }
}
