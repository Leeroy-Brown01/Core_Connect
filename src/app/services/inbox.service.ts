import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface InboxMessage {
  id?: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  message: string;
  timestamp: any;
  isRead?: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
  priority?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private readonly MESSAGES_COLLECTION = 'messages';

  constructor(private firestore: Firestore) {
    console.log('InboxService initialized');
  }

  // Get inbox messages for a specific user
  getInboxMessages(userEmail: string): Observable<InboxMessage[]> {
    return from(this.fetchInboxMessages(userEmail));
  }

  private async fetchInboxMessages(userEmail: string): Promise<InboxMessage[]> {
    try {
      console.log('Fetching inbox messages for:', userEmail);
      
      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      const q = query(
        messagesCollection,
        where('to', '==', userEmail),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          from: data['from'] || '',
          fromName: data['fromName'] || data['senderName'] || data['from'] || 'Unknown Sender',
          to: data['to'] || '',
          subject: data['subject'] || 'No Subject',
          message: data['message'] || data['textContent'] || '',
          timestamp: data['timestamp'],
          isRead: data['isRead'] || false,
          hasAttachment: !!(data['attachment'] || data['attachedFile']),
          attachmentName: data['attachment']?.name || data['attachedFile']?.name || '',
          priority: data['priority'] || 'normal',
          category: data['category'] || 'general'
        } as InboxMessage;
      });
      
      console.log(`✅ Fetched ${messages.length} inbox messages`);
      return messages;
    } catch (error) {
      console.error('❌ Error fetching inbox messages:', error);
      return [];
    }
  }

  // Helper method to format timestamp
  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      let date: Date;
      
      if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp.seconds) {
        // Firestore timestamp object
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
      } else if (diffInHours < 168) { // Less than a week
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
  getMessageCounts(messages: InboxMessage[]): { all: number; unread: number; documents: number } {
    return {
      all: messages.length,
      unread: messages.filter(msg => !msg.isRead).length,
      documents: messages.filter(msg => msg.hasAttachment).length
    };
  }

  // Filter messages based on criteria
  filterMessages(messages: InboxMessage[], filterType: string): InboxMessage[] {
    switch (filterType) {
      case 'unread':
        return messages.filter(msg => !msg.isRead);
      case 'documents':
        return messages.filter(msg => msg.hasAttachment);
      case 'priority':
        return messages.filter(msg => msg.priority === 'high');
      default:
        return messages;
    }
  }
}
