import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User, onAuthStateChanged, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { map, filter, take } from 'rxjs/operators';

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phone: string | number;
  department: string;
  province: string;
  role: string;
  profilePhoto?: string;
  status: string;
  createdAt: Date;
  lastLogin?: Date;
  trainingCompleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  private authInitialized = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public authInitialized$ = this.authInitialized.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    console.log('AuthService initialized with Firebase Auth and Firestore');
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Set persistence to LOCAL to maintain sessions across browser restarts
      await setPersistence(this.auth, browserLocalPersistence);
      
      // Listen to auth state changes
      onAuthStateChanged(this.auth, async (user) => {
        console.log('Auth state changed:', user ? user.uid : 'No user');
        if (user) {
          try {
            // Fetch user data from Firestore
            const userData = await this.fetchUserData(user.uid);
            this.currentUserSubject.next(userData);
            
            // Update last login in background
            this.updateLastLoginBackground(user.uid);
          } catch (error) {
            console.error('Error fetching user data:', error);
            // If user doesn't exist in Firestore, sign them out
            await this.signOut();
          }
        } else {
          this.currentUserSubject.next(null);
        }
        if (!this.authInitialized.value) {
          this.authInitialized.next(true);
        }
      });
    } catch (error) {
      console.error('Error setting auth persistence:', error);
      this.authInitialized.next(true); // Still mark as initialized even if persistence fails
    }
  }

  private async fetchUserData(uid: string): Promise<UserData> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('User data fetched from Firestore:', data);
        
        return {
          uid: data['uid'] || uid,
          fullName: data['fullName'],
          email: data['email'],
          phone: data['phone'],
          department: data['department'],
          province: data['province'],
          role: data['role'],
          profilePhoto: data['profilePhoto'] || '',
          status: data['status'],
          createdAt: data['createdAt'] ? new Date(data['createdAt'].seconds * 1000) : new Date(),
          lastLogin: data['lastLogin'] ? new Date(data['lastLogin'].seconds * 1000) : undefined,
          trainingCompleted: data['trainingCompleted'] || false
        } as UserData;
      } else {
        throw new Error('User data not found in Firestore');
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      throw error;
    }
  }

  async createUserAccount(userData: Omit<UserData, 'uid'>, password: string): Promise<{ success: boolean; user?: any }> {
    try {
      console.log('Creating user account...');
      
      // Validate inputs
      if (!userData.email || !password) {
        throw new Error('Email and password are required');
      }
      
      console.log('Creating Firebase Auth user...');
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        password
      );
      
      console.log('✅ Firebase Auth user created:', credential.user.uid);
      
      if (credential.user) {
        const userDocData: UserData = {
          ...userData,
          uid: credential.user.uid,
          createdAt: new Date(),
          status: 'active',
          trainingCompleted: false
        };

        // Save to Firestore
        await this.saveUserData(credential.user.uid, userDocData);
        
        // Update current user subject
        this.currentUserSubject.next(userDocData);
        
        console.log('✅ User account created successfully');
        return { success: true, user: credential.user };
      }
      
      throw new Error('No user returned from Firebase Auth');
      
    } catch (error: any) {
      console.error('❌ Error creating user account:', error);
      
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
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  private async saveUserData(uid: string, userData: UserData): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      console.log('Saving user data to Firestore...');
      
      const firestoreData = {
        uid: userData.uid,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        department: userData.department,
        province: userData.province,
        role: userData.role,
        profilePhoto: userData.profilePhoto || '',
        status: userData.status,
        trainingCompleted: userData.trainingCompleted || false,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin || null,
        updatedAt: new Date()
      };
      
      await setDoc(userDocRef, firestoreData);
      console.log('✅ User data saved to Firestore successfully');
    } catch (error: any) {
      console.error('❌ Error saving user data to Firestore:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<UserData> {
    try {
      console.log('Starting sign in process for:', email);
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ Firebase Auth sign in successful');
      
      if (credential.user) {
        // Fetch user data from Firestore
        const userData = await this.fetchUserData(credential.user.uid);
        
        // Update last login
        userData.lastLogin = new Date();
        
        // Update current user subject
        this.currentUserSubject.next(userData);
        
        // Update last login in Firestore
        await this.updateLastLogin(credential.user.uid);
        
        console.log('✅ Sign in completed successfully');
        return userData;
      } else {
        throw new Error('No user returned from Firebase Auth');
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, { 
        lastLogin: new Date()
      });
      console.log('✅ Last login updated in Firestore');
    } catch (error) {
      console.warn('⚠️ Failed to update last login:', error);
    }
  }

  private async updateLastLoginBackground(uid: string): Promise<void> {
    // Background update without blocking
    this.updateLastLogin(uid).catch(error => {
      console.warn('Background last login update failed:', error);
    });
  }

  async signOut(): Promise<void> {
    try {
      console.log('Signing out...');
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/log-in']);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Clear local state even if Firebase signOut fails
      this.currentUserSubject.next(null);
      throw error;
    }
  }

  getCurrentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        const hasUser = !!user;
        const hasFirebaseUser = !!this.auth.currentUser;
        
        console.log('Auth check:', { hasUser, hasFirebaseUser });
        return hasUser && hasFirebaseUser;
      })
    );
  }

  // Add a synchronous method for checking auth state when needed
  isAuthenticatedSync(): boolean {
    const hasUser = !!this.currentUserSubject.value;
    const hasFirebaseUser = !!this.auth.currentUser;
    
    console.log('Sync auth check:', { hasUser, hasFirebaseUser });
    return hasUser && hasFirebaseUser;
  }

  getFirebaseUser(): Observable<User | null> {
    return authState(this.auth);
  }

  // Get user by email (for admin purposes)
  async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      // Note: This is a simplified approach. In production, you might want to use Cloud Functions
      // or implement proper search functionality
      const userData = this.currentUserSubject.value;
      if (userData && userData.email === email) {
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === 'admin';
  }

  // Update user data
  async updateUserData(uid: string, updates: Partial<UserData>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Update local state if it's the current user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.uid === uid) {
        const updatedUser = { ...currentUser, ...updates };
        this.currentUserSubject.next(updatedUser);
      }
      
      console.log('✅ User data updated successfully');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      throw error;
    }
  }

  // Wait for auth to be initialized
  async waitForAuthInitialization(): Promise<void> {
    if (this.authInitialized.value) {
      return Promise.resolve();
    }
    
    return firstValueFrom(
      this.authInitialized$.pipe(
        filter(initialized => initialized),
        take(1)
      )
    ).then(() => {});
  }

  // Get user token
  async getIdToken(): Promise<string | null> {
    const firebaseUser = this.auth.currentUser;
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  }
}
