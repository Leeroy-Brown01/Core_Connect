// Angular service for handling authentication and user management using Firebase Auth and Firestore
import { Injectable } from '@angular/core'; // Angular DI decorator
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, authState, User, onAuthStateChanged, setPersistence, browserLocalPersistence } from '@angular/fire/auth'; // Firebase Auth
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore'; // Firestore DB
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs'; // RxJS for state
import { Router } from '@angular/router'; // Angular Router
import { map, filter, take } from 'rxjs/operators'; // RxJS operators

// NOTE: For ICD components, use ICDAuthService instead of this generic AuthService
// This service is kept for non-ICD legacy components only

// Interface for user data stored in Firestore and used in the app
export interface UserData {
  displayName: any; // User's display name (string or object)
  uid: string; // Firebase Auth user ID
  fullName: string; // User's full name
  email: string; // User's email address
  phone: string | number; // User's phone number
  department: string; // User's department
  province?: string; // Optional: user's province
  role: string; // User's role (admin, user, etc.)
  profilePhoto?: string; // Optional: profile photo URL
  status: string; // User's status (active, inactive, etc.)
  createdAt: Date; // Account creation date
  lastLogin?: Date; // Optional: last login date
  trainingCompleted?: boolean; // Optional: training completion flag
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Holds the current user data as an observable
  protected currentUserSubject = new BehaviorSubject<UserData | null>(null);
  // Tracks if Firebase Auth has been initialized
  private authInitialized = new BehaviorSubject<boolean>(false);
  // Flag to prevent navigation when admin is creating a user
  private isAdminCreatingUser = false;

  // Observable for current user
  public currentUser$ = this.currentUserSubject.asObservable();
  // Observable for auth initialization state
  public authInitialized$ = this.authInitialized.asObservable();

  constructor(
    public auth: Auth, // Injected Firebase Auth instance
    public firestore: Firestore, // Injected Firestore instance
    public router: Router // Injected Angular Router
  ) {
    console.log('AuthService initialized with Firebase Auth and Firestore');
    this.initializeAuth(); // Start auth initialization on service creation
  }

  // Initializes Firebase Auth and sets up auth state listener
  private async initializeAuth() {
    try {
      console.log('🔥 Initializing Firebase Auth...');
      await setPersistence(this.auth, browserLocalPersistence); // Persist auth state in browser

      // Listen to auth state changes (login/logout)
      onAuthStateChanged(this.auth, async (user) => {
        console.log('🔥 Auth state changed:', user ? `✅ ${user.email}` : '❌ No user');

        // Skip processing if admin is creating a user
        if (this.isAdminCreatingUser) {
          console.log('⏭️ Skipping auth state change (admin creating user)');
          return;
        }
        
        if (user) {
          try {
            const userData = await this.fetchUserData(user.uid);
            console.log('✅ User data loaded:', userData.email);
            this.currentUserSubject.next(userData);
            this.updateLastLoginBackground(user.uid);
          } catch (error) {
            console.error('❌ Error fetching user data, signing out:', error);
            await this.signOut();
          }
        } else {
          console.log('🔓 No authenticated user');
          this.currentUserSubject.next(null);
        }
        
        // Mark as initialized only after first auth state check
        if (!this.authInitialized.value) {
          console.log('✅ Auth initialization complete');
          this.authInitialized.next(true);
        }
      });
    } catch (error) {
      console.error('❌ Error setting auth persistence:', error);
      this.authInitialized.next(true);
    }
  }

  protected async fetchUserData(uid: string): Promise<UserData> {
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

  async createUserAccount(
    userData: Omit<UserData, 'uid'>, 
    password: string,
    preventAutoLogin: boolean = false
  ): Promise<{ success: boolean; user?: any }> {
    try {
      console.log('Creating user account...');
      
      // Set flag if this is admin creation
      if (preventAutoLogin) {
        this.isAdminCreatingUser = true;
      }
      
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
        
        // Only auto-login if not prevented (for admin user creation)
        if (!preventAutoLogin) {
          // Update current user subject
          this.currentUserSubject.next(userDocData);
          console.log('✅ User account created and logged in');
        } else {
          console.log('✅ User account created without auto-login (admin mode)');
          // Don't update currentUserSubject to maintain admin session
        }
        
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
    } finally {
      // Reset the flag
      this.isAdminCreatingUser = false;
    }
  }

  protected async saveUserData(uid: string, userData: UserData): Promise<void> {
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

  protected async updateLastLogin(uid: string): Promise<void> {
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
      console.log('🔓 AuthService: Starting sign out process...');
      
      // Sign out from Firebase Auth
      await signOut(this.auth);
      
      // Clear local user state
      this.currentUserSubject.next(null);
      
      console.log('✅ AuthService: Sign out successful');
      
      // Navigate to generic login page (can be overridden by subclasses)
      this.router.navigate(['/log-in'], { 
        replaceUrl: true,
        queryParams: {},
  fragment: undefined 
      });
      
    } catch (error) {
      console.error('❌ AuthService: Sign out error:', error);
      
      // Clear local state even if Firebase signOut fails
      this.currentUserSubject.next(null);
      
      // Force navigation to login page
      this.router.navigate(['/log-in'], { 
        replaceUrl: true,
        queryParams: {},
  fragment: undefined 
      });
      
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
