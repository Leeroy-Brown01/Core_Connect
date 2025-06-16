import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, orderBy, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, catchError } from 'rxjs/operators';
import { MessageService, MessageData } from './message.service';
import { ICDAuthService } from './icd-auth.service';

export interface InboxMessage extends MessageData {
  isRead?: boolean;
  deliveredAt?: any;
  readAt?: any;
  messageType?: 'direct' | 'department' | 'broadcast';
}

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private firestore = inject(Firestore);
  private messageService = inject(MessageService);
  private icdAuthService = inject(ICDAuthService);

  // Real-time message streams
  private userMessagesSubject = new BehaviorSubject<InboxMessage[]>([]);
  private departmentMessagesSubject = new BehaviorSubject<InboxMessage[]>([]);
  private allInboxMessagesSubject = new BehaviorSubject<InboxMessage[]>([]);

  // Public observables
  public userMessages$ = this.userMessagesSubject.asObservable();
  public departmentMessages$ = this.departmentMessagesSubject.asObservable();
  public allInboxMessages$ = this.allInboxMessagesSubject.asObservable();

  private readonly MESSAGES_COLLECTION = 'messages';
  private activeListeners: (() => void)[] = [];

  constructor() {
    console.log('InboxService initialized with real-time message fetching');
    this.initializeInboxStreams();
  }

  /**
   * Get inbox messages for a specific user and department
   */
  getUserInboxMessages(userId: string, userEmail: string, department: string): Observable<InboxMessage[]> {
    const userMessages$ = this.getUserDirectMessages(userEmail);
    const deptMessages$ = this.getDepartmentMessages(department);

    return combineLatest([userMessages$, deptMessages$]).pipe(
      map(([userMsgs, deptMsgs]) => {
        // Combine both message arrays
        const allMessages = [...userMsgs, ...deptMsgs];
        
        // Remove duplicates based on message ID
        const uniqueMessages = allMessages.filter((message, index, array) => 
          array.findIndex(msg => msg.id === message.id) === index
        );
        
        // Filter out messages sent by the current user (they should appear in sent folder)
        const inboxMessages = uniqueMessages.filter(msg => msg.senderId !== userId);
        
        // Sort by timestamp (newest first)
        return inboxMessages.sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
          return bTime - aTime;
        });
      }),
      catchError(error => {
        console.error('❌ Error in getUserInboxMessages:', error);
        return [];
      }),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );
  }

  /**
   * Get messages sent directly to a user's email - Fixed version
   */
  private getUserDirectMessages(userEmail: string): Observable<InboxMessage[]> {
    return new Observable<InboxMessage[]>(observer => {
      // Always use fallback approach to avoid index requirements
      this.fallbackGetDirectMessages(userEmail).then(messages => {
        observer.next(messages);
        
        // Set up simple real-time listener without complex queries
        const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
        const simpleQuery = query(
          messagesCollection,
          where('to', '==', userEmail),
          where('status', '==', 'sent')
        );

        const unsubscribe = onSnapshot(simpleQuery, 
          (snapshot) => {
            const messages: InboxMessage[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              messageType: 'direct'
            })) as InboxMessage[];
            
            // Sort in memory since we can't use orderBy with compound queries
            const sortedMessages = messages.sort((a, b) => {
              const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
              const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
              return bTime - aTime;
            });
            
            console.log(`📧 Real-time: ${sortedMessages.length} direct messages for ${userEmail}`);
            observer.next(sortedMessages);
          },
          (error) => {
            console.error('❌ Error in direct messages real-time listener:', error);
            // Don't propagate error, just use the initial fallback data
          }
        );

        this.activeListeners.push(unsubscribe);
        return () => {
          unsubscribe();
          this.activeListeners = this.activeListeners.filter(fn => fn !== unsubscribe);
        };
      }).catch(error => {
        console.error('❌ Error in initial direct messages fetch:', error);
        observer.next([]);
      });

      // Return cleanup function
      return () => {
        // Cleanup handled in the promise above
      };
    });
  }

  /**
   * Get messages sent to a user's department - Fixed version
   */
  private getDepartmentMessages(department: string): Observable<InboxMessage[]> {
    return new Observable<InboxMessage[]>(observer => {
      // Always use fallback approach to avoid index requirements
      this.fallbackGetDepartmentMessages(department).then(messages => {
        observer.next(messages);
        
        // Set up simple real-time listener without complex queries
        const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
        const simpleQuery = query(
          messagesCollection,
          where('recipientDepartments', 'array-contains', department),
          where('status', '==', 'sent')
        );

        const unsubscribe = onSnapshot(simpleQuery,
          (snapshot) => {
            const messages: InboxMessage[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              messageType: 'department'
            })) as InboxMessage[];
            
            // Sort in memory since we can't use orderBy with compound queries
            const sortedMessages = messages.sort((a, b) => {
              const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
              const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
              return bTime - aTime;
            });
            
            console.log(`🏢 Real-time: ${sortedMessages.length} department messages for ${department}`);
            observer.next(sortedMessages);
          },
          (error) => {
            console.error('❌ Error in department messages real-time listener:', error);
            // Don't propagate error, just use the initial fallback data
          }
        );

        this.activeListeners.push(unsubscribe);
        return () => {
          unsubscribe();
          this.activeListeners = this.activeListeners.filter(fn => fn !== unsubscribe);
        };
      }).catch(error => {
        console.error('❌ Error in initial department messages fetch:', error);
        observer.next([]);
      });

      // Return cleanup function
      return () => {
        // Cleanup handled in the promise above
      };
    });
  }

  /**
   * Fallback method for direct messages (without real-time) - Fixed injection context
   */
  private async fallbackGetDirectMessages(userEmail: string): Promise<InboxMessage[]> {
    try {
      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      
      // Use simple query without ordering to avoid index requirements
      const simpleQuery = query(
        messagesCollection,
        where('to', '==', userEmail),
        where('status', '==', 'sent')
      );
      
      const snapshot = await getDocs(simpleQuery);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        messageType: 'direct'
      })) as InboxMessage[];
      
      // Sort in memory by timestamp (newest first)
      const sortedMessages = messages.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return bTime - aTime;
      });
      
      console.log(`📧 Fallback: ${sortedMessages.length} direct messages for ${userEmail}`);
      return sortedMessages;
      
    } catch (error) {
      console.error('❌ Error in fallback direct messages query:', error);
      return [];
    }
  }

  /**
   * Fallback method for department messages (without real-time) - Fixed injection context
   */
  private async fallbackGetDepartmentMessages(department: string): Promise<InboxMessage[]> {
    try {
      const messagesCollection = collection(this.firestore, this.MESSAGES_COLLECTION);
      
      // Use simple query without ordering to avoid index requirements
      const simpleQuery = query(
        messagesCollection,
        where('recipientDepartments', 'array-contains', department),
        where('status', '==', 'sent')
      );
      
      const snapshot = await getDocs(simpleQuery);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        messageType: 'department'
      })) as InboxMessage[];
      
      // Sort in memory by timestamp (newest first)
      const sortedMessages = messages.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return bTime - aTime;
      });
      
      console.log(`🏢 Fallback: ${sortedMessages.length} department messages for ${department}`);
      return sortedMessages;
      
    } catch (error) {
      console.error('❌ Error in fallback department messages query:', error);
      return [];
    }
  }

  /**
   * Initialize inbox streams for the current user
   */
  private initializeInboxStreams(): void {
    // Subscribe to authentication changes
    this.icdAuthService.currentUser$.subscribe(authUser => {
      if (authUser?.email && authUser?.department) {
        console.log('🔄 Initializing inbox streams for:', authUser.email);
        this.startInboxStreams(authUser.uid, authUser.email, authUser.department);
      } else {
        console.log('👤 No authenticated user, stopping inbox streams');
        this.stopInboxStreams();
      }
    });
  }

  /**
   * Start real-time inbox streams
   */
  private startInboxStreams(userId: string, userEmail: string, department: string): void {
    // Stop existing streams
    this.stopInboxStreams();

    // Start new streams
    const inboxSubscription = this.getUserInboxMessages(userId, userEmail, department).subscribe(
      messages => {
        this.allInboxMessagesSubject.next(messages);
        console.log(`✅ Updated inbox with ${messages.length} messages`);
      },
      error => {
        console.error('❌ Error in inbox stream:', error);
        this.allInboxMessagesSubject.next([]);
      }
    );

    // Note: We don't need to manually manage this subscription since 
    // the observables handle their own cleanup
  }

  /**
   * Stop all real-time streams
   */
  private stopInboxStreams(): void {
    // Unsubscribe from all Firestore listeners
    this.activeListeners.forEach(unsubscribe => unsubscribe());
    this.activeListeners = [];
    
    // Clear subjects
    this.userMessagesSubject.next([]);
    this.departmentMessagesSubject.next([]);
    this.allInboxMessagesSubject.next([]);
    
    console.log('🛑 Stopped all inbox streams');
  }

  /**
   * Get unread message count
   */
  getUnreadCount(): Observable<number> {
    return this.allInboxMessages$.pipe(
      map(messages => {
        const currentUser = this.icdAuthService.getCurrentUser();
        if (!currentUser) return 0;
        
        return messages.filter(msg => 
          !msg.readBy || !msg.readBy.includes(currentUser.uid)
        ).length;
      })
    );
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.messageService.markAsRead(messageId);
      console.log('✅ Message marked as read via InboxService');
    } catch (error) {
      console.error('❌ Error marking message as read via InboxService:', error);
      throw error;
    }
  }

  /**
   * Get messages by type (direct, department, broadcast)
   */
  getMessagesByType(messageType: 'direct' | 'department' | 'broadcast'): Observable<InboxMessage[]> {
    return this.allInboxMessages$.pipe(
      map(messages => messages.filter(msg => msg.messageType === messageType))
    );
  }

  /**
   * Get messages by read status
   */
  getMessagesByReadStatus(isRead: boolean): Observable<InboxMessage[]> {
    return this.allInboxMessages$.pipe(
      map(messages => {
        const currentUser = this.icdAuthService.getCurrentUser();
        if (!currentUser) return [];
        
        return messages.filter(msg => {
          const messageIsRead = msg.readBy && msg.readBy.includes(currentUser.uid);
          return messageIsRead === isRead;
        });
      })
    );
  }

  /**
   * Cleanup method
   */
  ngOnDestroy(): void {
    this.stopInboxStreams();
  }
}
