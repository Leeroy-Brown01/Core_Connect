import { Injectable } from '@angular/core';
import { SentService } from './sent.service';
import { MessageService } from './message.service';
import { ICDAuthService } from './icd-auth.service';

@Injectable({
  providedIn: 'root'
})
export class TestSentService {

  constructor(
    private sentService: SentService,
    private messageService: MessageService,
    private icdAuthService: ICDAuthService
  ) {}

  async testSentMessagesFlow(): Promise<void> {
    console.log('🧪 Testing Sent Messages Flow...');
    
    // Check if user is authenticated
    const currentUser = this.icdAuthService.getCurrentUser();
    if (!currentUser) {
      console.error('❌ No authenticated user for testing');
      return;
    }
    
    console.log('👤 Current user:', currentUser.email);
    
    try {
      // Test 1: Direct MessageService call
      console.log('\n1️⃣ Testing direct MessageService.getSentMessages()...');
      const directMessages = await this.messageService.getSentMessages();
      console.log(`📤 Direct MessageService returned ${directMessages.length} messages`);
      
      // Test 2: SentService call
      console.log('\n2️⃣ Testing SentService.getSentMessages()...');
      this.sentService.getSentMessages().subscribe({
        next: (sentMessages) => {
          console.log(`📤 SentService returned ${sentMessages.length} messages`);
          console.log('✅ First sent message:', sentMessages[0]);
        },
        error: (error) => {
          console.error('❌ SentService error:', error);
        }
      });
      
      // Test 3: Check for any interface mismatches
      console.log('\n3️⃣ Checking for interface compatibility...');
      if (directMessages.length > 0) {
        const firstMessage = directMessages[0];
        console.log('📋 MessageData properties:', Object.keys(firstMessage));
        
        // Check if all required SentMessage properties can be mapped
        const requiredProps = ['id', 'senderId', 'senderName', 'to', 'subject', 'message', 'timestamp'];
        const missingProps = requiredProps.filter(prop => !(prop in firstMessage));
        
        if (missingProps.length === 0) {
          console.log('✅ All required properties present');
        } else {
          console.warn('⚠️ Missing properties:', missingProps);
        }
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}
