import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { UserData } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUserCreationService {
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  async createUserWithoutSignIn(
    userData: Omit<UserData, 'uid'>, 
    password: string,
    currentUserCredentials: { email: string; password?: string }
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      console.log('🔧 Creating user without affecting current auth state...');
      
      // Store current user
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Create new user (this will automatically sign them in)
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        password
      );

      if (!credential.user) {
        throw new Error('Failed to create user');
      }

      const newUserId = credential.user.uid;
      console.log('✅ New user created with ID:', newUserId);

      // Save user data to ICD collection
      const userDocData = {
        uid: newUserId,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        department: userData.department,
        province: userData.province,
        role: userData.role,
        profilePhoto: userData.profilePhoto || '',
        status: userData.status,
        trainingCompleted: userData.trainingCompleted || false,
        accessLevel: 'user',
        createdAt: userData.createdAt,
        lastLogin: null,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
        documentsCount: 0
      };

      // Save to Firestore
      const icdUserDocRef = doc(this.firestore, `icd-users/${newUserId}`);
      await setDoc(icdUserDocRef, userDocData);
      console.log('✅ New user data saved to ICD collection');

      // Sign out the newly created user
      await signOut(this.auth);
      console.log('✅ Signed out newly created user');

      // Re-authenticate the original admin user
      if (currentUserCredentials.password) {
        await signInWithEmailAndPassword(
          this.auth, 
          currentUserCredentials.email, 
          currentUserCredentials.password
        );
        console.log('✅ Re-authenticated original admin user');
      } else {
        console.warn('⚠️ No password provided for re-authentication');
      }

      return {
        success: true,
        userId: newUserId
      };

    } catch (error: any) {
      console.error('❌ Error creating user without sign in:', error);
      
      // Try to restore original user session if possible
      try {
        if (currentUserCredentials.password) {
          await signInWithEmailAndPassword(
            this.auth, 
            currentUserCredentials.email, 
            currentUserCredentials.password
          );
          console.log('✅ Restored original user session after error');
        }
      } catch (restoreError) {
        console.error('❌ Failed to restore original user session:', restoreError);
      }

      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  async createUserDirectly(
    userData: Omit<UserData, 'uid'>, 
    password: string,
    createdBy: string
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      console.log('🔧 Creating user directly in ICD collection...');
      
      // Create new user account
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        password
      );

      if (!credential.user) {
        throw new Error('Failed to create user');
      }

      const newUserId = credential.user.uid;
      console.log('✅ New user created with ID:', newUserId);

      // Save user data to ICD collection
      const userDocData = {
        uid: newUserId,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        department: userData.department,
        province: userData.province,
        role: userData.role,
        profilePhoto: userData.profilePhoto || '',
        status: userData.status,
        trainingCompleted: userData.trainingCompleted || false,
        accessLevel: 'user',
        createdAt: userData.createdAt,
        createdBy: createdBy,
        lastLogin: null,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
        documentsCount: 0
      };

      // Save to Firestore
      const icdUserDocRef = doc(this.firestore, `icd-users/${newUserId}`);
      await setDoc(icdUserDocRef, userDocData);
      console.log('✅ New user data saved to ICD collection');

      // Important: Sign out the newly created user immediately
      await signOut(this.auth);
      console.log('✅ Signed out newly created user to prevent auto-login');

      return {
        success: true,
        userId: newUserId
      };

    } catch (error: any) {
      console.error('❌ Error creating user directly:', error);
      
      // Handle specific auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      }
      
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }
}
