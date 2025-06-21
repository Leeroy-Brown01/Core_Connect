import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, query, where, orderBy, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { ICDAuthService } from './icd-auth.service'; // Changed from AuthService to ICDAuthService

export interface MessageData {
  id?: string;
  senderId: string;
  senderName: string;
  senderEmail?: string; // Add senderEmail property
  recipientDepartments: string[];
  to: string; // recipient email
  subject: string;
  message: string;
  // Base64 file storage
  attachedFile?: {
    name: string;
    size: number;
    type: string;
    base64Content: string;
  };
  timestamp: Timestamp;
  status: 'sent' | 'archived' | 'deleted' | 'draft';
  readBy?: string[]; // Array of user IDs who have read the message
  priority?: 'low' | 'normal' | 'high';
  category?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly MESSAGES_COLLECTION = 'messages';
  private firestore = inject(Firestore);
  private icdAuthService = inject(ICDAuthService); // Changed from authService to icdAuthService

  constructor() {
    console.log('MessageService initialized with ICDAuthService and Base64 file storage');
  }

  // Create a new message
  async createMessage(messageData: any): Promise<string> {
    try {
      console.log('📝 Creating message:', messageData);
      
      const currentUser = this.icdAuthService.getCurrentUser(); // Using ICDAuthService
      if (!currentUser) {
        throw new Error('User must be authenticated to send messages');
      }

      // Create base message object without undefined values
      const message: any = {
        ...messageData,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.fullName || currentUser.email,
        timestamp: Timestamp.now(),
        read: false,
        starred: false
      };

      // Only add file-related fields if they exist and are not undefined
      if (messageData.attachedFile && messageData.attachedFile !== undefined) {
        message.attachedFile = messageData.attachedFile;
      }
      if (messageData.fileName && messageData.fileName !== undefined) {
        message.fileName = messageData.fileName;
      }
      if (messageData.fileSize && messageData.fileSize !== undefined) {
        message.fileSize = messageData.fileSize;
      }
      if (messageData.fileType && messageData.fileType !== undefined) {
        message.fileType = messageData.fileType;
      }

      console.log('📤 Final message object:', message);
      
      const docRef = await addDoc(collection(this.firestore, this.MESSAGES_COLLECTION), message);
      console.log('✅ Message created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating message:', error);
      throw error;
    }
  }

  // Send message with attachment
  async sendMessageWithAttachment(messageData: any, file?: File): Promise<string> {
    try {
      console.log('📤 Sending message with optional attachment:', { messageData, hasFile: !!file });

      let finalMessageData = { ...messageData };

      // Only process file if one is provided
      if (file) {
        console.log('📎 Processing file attachment:', file.name);
        
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Convert file to base64
        const base64 = await this.convertFileToBase64(file);
        
        // Add file data to message
        finalMessageData = {
          ...finalMessageData,
          attachedFile: {
            name: file.name,
            size: file.size,
            type: file.type,
            base64Content: base64
          }
        };
        
        console.log('✅ File processed and added to message data');
      } else {
        console.log('📝 No file attachment - sending text-only message');
      }

      // Create the message
      const messageId = await this.createMessage(finalMessageData);
      
      console.log('✅ Message sent successfully with ID:', messageId);
      return messageId;
      
    } catch (error) {
      console.error('❌ Error sending message with attachment:', error);
      throw error;
    }
  }

  // Save as draft
  async saveDraft(messageData: any, file?: File): Promise<string> {
    try {
      console.log('💾 Saving draft with optional attachment:', { messageData, hasFile: !!file });

      let finalMessageData = { 
        ...messageData, 
        status: 'draft' 
      };

      // Only process file if one is provided
      if (file) {
        console.log('📎 Processing file attachment for draft:', file.name);
        
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Convert file to base64
        const base64 = await this.convertFileToBase64(file);
        
        // Add file data to draft
        finalMessageData = {
          ...finalMessageData,
          attachedFile: {
            name: file.name,
            size: file.size,
            type: file.type,
            base64Content: base64
          }
        };
        
        console.log('✅ File processed and added to draft data');
      } else {
        console.log('📝 No file attachment - saving text-only draft');
      }

      // Create the draft
      const draftId = await this.createMessage(finalMessageData);
      
      console.log('✅ Draft saved successfully with ID:', draftId);
      return draftId;
      
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      throw error;
    }
  }

  // Convert file to Base64
  async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/png;base64,")
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to Base64'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Download file from Base64
  downloadFileFromBase64(attachedFile: MessageData['attachedFile']): void {
    if (!attachedFile) {
      console.error('No file to download');
      return;
    }

    try {
      console.log('📥 Downloading file:', attachedFile.name);
      
      // Convert Base64 back to file blob
      const byteCharacters = atob(attachedFile.base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachedFile.type });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachedFile.name;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      console.log('✅ File download initiated:', attachedFile.name);
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      throw error;
    }
  }

  // Get messages by status (updated method)
  async getMessagesByStatus(status: string): Promise<MessageData[]> {
    try {
      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      
      let messages: MessageData[] = [];

      try {
        // Try the optimized query first (requires index)
        const q = query(
          messagesCollection, 
          where('status', '==', status),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MessageData[];

      } catch (indexError) {
        console.warn('⚠️ Index not available for status query, falling back to simple query:', indexError);
        
        // Fallback: Query by status only, then sort in memory
        const fallbackQuery = query(
          messagesCollection,
          where('status', '==', status)
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        messages = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MessageData[];

        // Sort in memory by timestamp (descending) with proper timestamp conversion
        messages.sort((a, b) => {
          const aTime = this.convertTimestampToDate(a.timestamp);
          const bTime = this.convertTimestampToDate(b.timestamp);
          return bTime.getTime() - aTime.getTime();
        });
      }

      return messages;
    } catch (error) {
      console.error('❌ Error fetching messages by status:', error);
      throw error;
    }
  }

  // Get sent messages for current user
  async getSentMessages(): Promise<MessageData[]> {
    try {
      const currentUser = this.icdAuthService.getCurrentUser(); // Using ICDAuthService
      if (!currentUser) {
        console.warn('MessageService.getSentMessages: No authenticated user found');
        return [];
      }

      console.log('MessageService.getSentMessages - Current User:', {
        uid: currentUser.uid,
        email: currentUser.email
      });

      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      
      // Query messages where senderId matches current user's uid OR email
      const queries = [];
      
      if (currentUser.uid) {
        queries.push(
          query(
            messagesCollection,
            where('senderId', '==', currentUser.uid),
            orderBy('timestamp', 'desc')
          )
        );
      }
      
      if (currentUser.email && currentUser.email !== currentUser.uid) {
        queries.push(
          query(
            messagesCollection,
            where('senderId', '==', currentUser.email),
            orderBy('timestamp', 'desc')
          )
        );
      }

      // If we have senderEmail field, also query by that
      if (currentUser.email) {
        queries.push(
          query(
            messagesCollection,
            where('senderEmail', '==', currentUser.email),
            orderBy('timestamp', 'desc')
          )
        );
      }

      const messages: MessageData[] = [];
      const messageIds = new Set<string>(); // To avoid duplicates

      // Execute all queries and combine results
      for (const q of queries) {
        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            if (!messageIds.has(doc.id)) {
              messageIds.add(doc.id);
              const data = doc.data();
              messages.push({
                id: doc.id,
                senderId: data['senderId'],
                senderName: data['senderName'],
                senderEmail: data['senderEmail'],
                to: data['to'],
                recipientDepartments: data['recipientDepartments'] || [],
                subject: data['subject'],
                message: data['message'],
                timestamp: data['timestamp'],
                attachedFile: data['attachedFile'],
                priority: data['priority'],
                category: data['category'],
                status: data['status'] || 'sent'
              });
            }
          });
        } catch (queryError) {
          console.warn('Query failed:', queryError);
        }
      }

      // Sort by timestamp descending with proper timestamp conversion
      messages.sort((a, b) => {
        const timestampA = this.convertTimestampToDate(a.timestamp);
        const timestampB = this.convertTimestampToDate(b.timestamp);
        return timestampB.getTime() - timestampA.getTime();
      });

      console.log(`MessageService.getSentMessages: Found ${messages.length} sent messages for user`);
      console.log('Sample messages:', messages.slice(0, 2).map(m => ({
        id: m.id,
        senderId: m.senderId,
        senderEmail: m.senderEmail,
        subject: m.subject
      })));

      return messages;
    } catch (error) {
      console.error('❌ Error in MessageService.getSentMessages:', error);
      return [];
    }
  }

  // Get inbox messages for current user (updated method)
  async getInboxMessages(): Promise<MessageData[]> {
    try {
      const currentUser = this.icdAuthService.getCurrentUser(); // Using ICDAuthService
      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      console.log('🔍 Fetching inbox messages for user:', currentUser.email);

      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      
      let allMessages: MessageData[] = [];

      try {
        // Try the optimized query first (requires index)
        const q = query(
          messagesCollection,
          where('status', '==', 'sent'),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        allMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MessageData[];

      } catch (indexError) {
        console.warn('⚠️ Index not available, falling back to simple query:', indexError);
        
        // Fallback: Query without ordering, then sort in memory
        const fallbackQuery = query(
          messagesCollection,
          where('status', '==', 'sent')
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        allMessages = fallbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MessageData[];

        // Sort in memory by timestamp (descending) with proper timestamp conversion
        allMessages.sort((a, b) => {
          const aTime = this.convertTimestampToDate(a.timestamp);
          const bTime = this.convertTimestampToDate(b.timestamp);
          return bTime.getTime() - aTime.getTime();
        });
      }

      console.log(`📨 Found ${allMessages.length} total sent messages`);

      // Filter messages for current user's department or direct email
      const userInboxMessages = allMessages.filter(message => {
        // Check if message is directly addressed to user's email
        const isDirectMessage = message.to === currentUser.email;
        
        // Check if message is sent to user's department
        const isDepartmentMessage = message.recipientDepartments && 
          message.recipientDepartments.includes(currentUser.department);
        
        // Exclude messages sent by the current user (they appear in sent folder)
        const isNotSentByUser = message.senderId !== currentUser.uid;
        
        return (isDirectMessage || isDepartmentMessage) && isNotSentByUser;
      });

      console.log(`✅ Filtered to ${userInboxMessages.length} inbox messages for user`);
      
      return userInboxMessages;
    } catch (error) {
      console.error('❌ Error fetching inbox messages:', error);
      throw error;
    }
  }

  // Update message status
  async updateMessageStatus(messageId: string, status: MessageData['status']): Promise<void> {
    try {
      const messageDoc = doc(this.firestore, `${this.MESSAGES_COLLECTION}/${messageId}`);
      await updateDoc(messageDoc, { 
        status,
        updatedAt: Timestamp.now()
      });
      console.log('✅ Message status updated successfully');
    } catch (error) {
      console.error('❌ Error updating message status:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageDoc = doc(this.firestore, `${this.MESSAGES_COLLECTION}/${messageId}`);
      await deleteDoc(messageDoc);
      console.log('✅ Message deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  }

  // Mark message as read (updated method)
  async markAsRead(messageId: string): Promise<void> {
    try {
      const currentUser = this.icdAuthService.getCurrentUser(); // Using ICDAuthService
      if (!currentUser) return;

      const messageDoc = doc(this.firestore, `${this.MESSAGES_COLLECTION}/${messageId}`);
      
      // Get current message to update readBy array
      const messageSnapshot = await getDoc(messageDoc);
      if (!messageSnapshot.exists()) {
        console.error('Message not found for marking as read');
        return;
      }
      
      const currentData = messageSnapshot.data();
      const currentReadBy = currentData['readBy'] || [];
      
      // Add user to readBy array if not already present
      if (!currentReadBy.includes(currentUser.uid)) {
        const updatedReadBy = [...currentReadBy, currentUser.uid];
        
        await updateDoc(messageDoc, {
          readBy: updatedReadBy,
          readAt: Timestamp.now()
        });
        
        console.log('✅ Message marked as read');
      } else {
        console.log('ℹ️ Message already marked as read by this user');
      }
      
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      throw error;
    }
  }

  // Get available departments (for dropdown)
  getDepartments(): string[] {
    return [
      'Human Resources',
      'Finance',
      'Information Technology',
      'Operations',
      'Marketing',
      'Legal',
      'Administration',
      'Communications',
      'Engineering',
      'Sales',
      'Customer Service',
      'Other'
    ];
  }

  // Validate file type and size
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB (reduced for Base64 efficiency)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 
      'text/csv'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size is 10MB for Base64 storage.`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed. Please upload PDF, DOC, XLS, images, or text files.`
      };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file preview (for images)
  getFilePreviewUrl(attachedFile: MessageData['attachedFile']): string | null {
    if (!attachedFile || !attachedFile.type.startsWith('image/')) {
      return null;
    }
    
    return `data:${attachedFile.type};base64,${attachedFile.base64Content}`;
  }

  // Helper method to convert various timestamp formats to Date
  private convertTimestampToDate(timestamp: any): Date {
    if (!timestamp) {
      return new Date(0); // Return epoch if no timestamp
    }

    // If it's a Firestore Timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // If it's already a Date
    if (timestamp instanceof Date) {
      return timestamp;
    }

    // If it's a string
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }

    // If it's a Firebase timestamp with seconds property
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }

    // If it's a number (milliseconds)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }

    // Fallback
    try {
      return new Date(timestamp);
    } catch (error) {
      console.warn('Could not convert timestamp to Date:', timestamp);
      return new Date(0);
    }
  }
}
