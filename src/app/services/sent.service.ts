import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AuthService } from './auth.service';

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
  priority?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SentService {
  private readonly MESSAGES_COLLECTION = 'messages';
  private selectedMessage: SentMessage | null = null;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    console.log('SentService initialized');
  }

  // Get sent messages for current user
  getSentMessages(): Observable<SentMessage[]> {
    return from(this.fetchSentMessages());
  }

  private async fetchSentMessages(): Promise<SentMessage[]> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.warn('No authenticated user found');
        return [];
      }

      console.log('Fetching sent messages for user:', currentUser.email);
      
      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      const q = query(
        messagesCollection,
        where('senderId', '==', currentUser.uid),
        where('status', '==', 'sent'),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data['senderId'] || '',
          senderName: data['senderName'] || currentUser.fullName,
          to: data['to'] || '',
          recipientDepartments: data['recipientDepartments'] || [],
          subject: data['subject'] || 'No Subject',
          message: data['message'] || '',
          timestamp: data['timestamp'],
          status: data['status'] || 'sent',
          hasAttachment: !!(data['attachedFile'] || data['attachment']),
          attachmentName: data['attachedFile']?.name || data['attachment']?.name || '',
          priority: data['priority'] || 'normal',
          category: data['category'] || 'general'
        } as SentMessage;
      });
      
      console.log(`✅ Fetched ${messages.length} sent messages`);
      return messages;
    } catch (error) {
      console.error('❌ Error fetching sent messages:', error);
      return [];
    }
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
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.warn('No authenticated user found');
        return null;
      }

      console.log('🔍 Fetching message by ID:', messageId);
      
      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      const q = query(
        messagesCollection,
        where('senderId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const message = querySnapshot.docs.find(doc => doc.id === messageId);
      
      if (message) {
        const data = message.data();
        const sentMessage = {
          id: message.id,
          senderId: data['senderId'] || '',
          senderName: data['senderName'] || currentUser.fullName,
          to: data['to'] || '',
          recipientDepartments: data['recipientDepartments'] || [],
          subject: data['subject'] || 'No Subject',
          message: data['message'] || '',
          timestamp: data['timestamp'],
          status: data['status'] || 'sent',
          hasAttachment: !!(data['attachedFile'] || data['attachment']),
          attachmentName: data['attachedFile']?.name || data['attachment']?.name || '',
          priority: data['priority'] || 'normal',
          category: data['category'] || 'general'
        } as SentMessage;
        
        console.log('✅ Message found:', sentMessage);
        return sentMessage;
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
}
