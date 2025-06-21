import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ReplyData {
  replyTo: string; // Sender's email
  replyToName: string; // Sender's name
  originalSubject: string;
  originalMessage: string;
  originalMessageId: string;
  originalTimestamp: any;
  isReply: boolean;
}

export interface ForwardData {
  originalSubject: string;
  originalMessage: string;
  originalSender: string;
  originalSenderEmail?: string;
  originalMessageId: string;
  originalTimestamp: any;
  isForward: boolean;
}

export type ComposeData = ReplyData | ForwardData;

@Injectable({
  providedIn: 'root'
})
export class ReplyService {
  private composeDataSubject = new BehaviorSubject<ComposeData | null>(null);
  public composeData$ = this.composeDataSubject.asObservable();

  constructor() {
    console.log('ReplyService initialized');
  }

  /**
   * Set reply data for compose component
   */
  setReplyData(replyData: ReplyData): void {
    console.log('📧 Setting reply data:', replyData);
    this.composeDataSubject.next(replyData);
  }

  /**
   * Set forward data for compose component
   */
  setForwardData(forwardData: ForwardData): void {
    console.log('📤 Setting forward data:', forwardData);
    this.composeDataSubject.next(forwardData);
  }

  /**
   * Get current compose data
   */
  getComposeData(): ComposeData | null {
    return this.composeDataSubject.value;
  }

  /**
   * Clear compose data (call after using it)
   */
  clearComposeData(): void {
    console.log('🧹 Clearing compose data');
    this.composeDataSubject.next(null);
  }

  /**
   * Format reply subject with "Re:" prefix
   */
  formatReplySubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  /**
   * Format forward subject with "Fwd:" prefix
   */
  formatForwardSubject(originalSubject: string): string {
    if (originalSubject.toLowerCase().startsWith('fwd:') || originalSubject.toLowerCase().startsWith('fw:')) {
      return originalSubject;
    }
    return `Fwd: ${originalSubject}`;
  }

  /**
   * Format quoted original message for reply
   */
  formatQuotedMessage(originalMessage: string, senderName: string, timestamp: any): string {
    const formattedTimestamp = this.formatTimestamp(timestamp);
    
    return `\n\n--- Original Message ---\nFrom: ${senderName}\nSent: ${formattedTimestamp}\n\n${originalMessage}`;
  }

  /**
   * Format forward message content
   */
  formatForwardMessage(originalMessage: string, senderName: string, senderEmail: string, timestamp: any): string {
    const formattedTimestamp = this.formatTimestamp(timestamp);
    
    return `\n\n---------- Forwarded message ----------\nFrom: ${senderName} <${senderEmail || 'unknown@email.com'}>\nDate: ${formattedTimestamp}\n\n${originalMessage}`;
  }

  /**
   * Format timestamp for quoted message
   */
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

  /**
   * Check if data is reply data
   */
  isReplyData(data: ComposeData): data is ReplyData {
    return 'isReply' in data && data.isReply === true;
  }

  /**
   * Check if data is forward data
   */
  isForwardData(data: ComposeData): data is ForwardData {
    return 'isForward' in data && data.isForward === true;
  }
}
