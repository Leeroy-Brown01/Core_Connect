// Angular service for testing Firestore connectivity
import { Injectable } from '@angular/core'; // Angular DI
import { Firestore, doc, setDoc } from '@angular/fire/firestore'; // Firestore DB

@Injectable({
  providedIn: 'root'
})
export class FirebaseTestService {

  // Inject Firestore instance
  constructor(private firestore: Firestore) {}

  // Test Firestore connection by writing a test document
  async testFirestoreConnection(): Promise<void> {
    try {
      console.log('Testing Firestore connection...');
      // Reference to a test document in Firestore
      const testDocRef = doc(this.firestore, 'test/connection');
      // Write a test object to Firestore
      await setDoc(testDocRef, { 
        timestamp: new Date(), // Current timestamp
        message: 'Connection test successful' // Test message
      });
      console.log('✅ Firestore connection test passed');
    } catch (error) {
      // Log and rethrow error if connection fails
      console.error('❌ Firestore connection test failed:', error);
      throw error;
    }
  }
}
