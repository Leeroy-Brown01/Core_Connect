// Angular service for managing reply and forward data for message composition
import { Injectable } from '@angular/core'; // Angular DI
import { BehaviorSubject } from 'rxjs'; // RxJS for state

// Interface for reply data (used when replying to a message)
export interface ReplyData {
  replyTo: string; // Sender's email
  replyToName: string; // Sender's name
  originalSubject: string; // Subject of the original message
  originalMessage: string; // Body of the original message
  originalMessageId: string; // ID of the original message
  originalTimestamp: any; // Timestamp of the original message
  isReply: boolean; // Flag to indicate reply
}

// Interface for forward data (used when forwarding a message)
export interface ForwardData {
  originalSubject: string; // Subject of the original message
  originalMessage: string; // Body of the original message
  originalSender: string; // Name of the original sender
  originalSenderEmail?: string; // Email of the original sender
  originalMessageId: string; // ID of the original message
  originalTimestamp: any; // Timestamp of the original message
  isForward: boolean; // Flag to indicate forward
}

// Union type for compose data (reply or forward)
export type ComposeData = ReplyData | ForwardData;

@Injectable({
  providedIn: 'root'
})
export class ReplyService {
  // Holds the current compose data (reply or forward) as an observable
  private composeDataSubject = new BehaviorSubject<ComposeData | null>(null);
  public composeData$ = this.composeDataSubject.asObservable();

  constructor() {
    // Log service initialization
    console.log('ReplyService initialized');
  }

  // Set reply data for the compose component
  setReplyData(replyData: ReplyData): void {
    console.log('📧 Setting reply data:', replyData);
    this.composeDataSubject.next(replyData);
  }

  // Set forward data for the compose component
  setForwardData(forwardData: ForwardData): void {
    console.log('📤 Setting forward data:', forwardData);
    this.composeDataSubject.next(forwardData);
  }

  // Get the current compose data (reply or forward)
  getComposeData(): ComposeData | null {
    return this.composeDataSubject.value;
  }

  // Clear the compose data (call after sending or discarding)
  clearComposeData(): void {
    console.log('🧹 Clearing compose data');
    this.composeDataSubject.next(null);
  }

  // Format reply subject with "Re:" prefix
  formatReplySubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  // Format forward subject with "Fwd:" prefix
  formatForwardSubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('fwd:') || originalSubject.toLowerCase().startsWith('fw:')) {
      return originalSubject;
    }
    return `Fwd: ${originalSubject}`;
  }

  // Format quoted original message for reply
  formatQuotedMessage(originalMessage: string, senderName: string, timestamp: any): string {
    const formattedTimestamp = this.formatTimestamp(timestamp);
    return `\n\n--- Original Message ---\nFrom: ${senderName}\nSent: ${formattedTimestamp}\n\n${originalMessage}`;
  }

  // Format forward message content
  formatForwardMessage(originalMessage: string, senderName: string, senderEmail: string, timestamp: any): string {
    const formattedTimestamp = this.formatTimestamp(timestamp);
    return `\n\n---------- Forwarded message ----------\nFrom: ${senderName} <${senderEmail || 'unknown@email.com'}>\nDate: ${formattedTimestamp}\n\n${originalMessage}`;
  }

  // Format timestamp for quoted/forwarded message
  private formatTimestamp(timestamp: any): string {
    try {
      let date: Date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp?.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp for reply:', error);
      return 'Unknown time';
    }
  }

  // Type guard: check if data is reply data
  isReplyData(data: ComposeData): data is ReplyData {
    return 'isReply' in data && data.isReply === true;
  }

  // Type guard: check if data is forward data
  isForwardData(data: ComposeData): data is ForwardData {
    return 'isForward' in data && data.isForward === true;
  }
}
