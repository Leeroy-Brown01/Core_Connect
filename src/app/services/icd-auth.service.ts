import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService, UserData } from './auth.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export interface ICDUser extends UserData {
  // Add ICD-specific fields if needed
  accessLevel?: 'admin' | 'user' | 'viewer';
  lastActiveAt?: Date;
  permissions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ICDAuthService extends AuthService {
  private readonly ICD_COLLECTION = 'icd-users';

  constructor(
    auth: Auth,
    firestore: Firestore,
    router: Router
  ) {
    super(auth, firestore, router);
    console.log('ICDAuthService initialized');
  }

  // Override fetchUserData to use ICD users collection
  protected override async fetchUserData(uid: string): Promise<UserData> {
    try {
      console.log('Fetching ICD user data for UID:', uid);
      
      // First try ICD users collection
      const icdUserDocRef = doc(this.firestore, `${this.ICD_COLLECTION}/${uid}`);
      const icdUserDoc = await getDoc(icdUserDocRef);
      
      if (icdUserDoc.exists()) {
        const data = icdUserDoc.data();
        console.log('✅ ICD user data found:', data['email']);
        
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
        // Fallback to regular users collection
        console.log('ICD user not found, checking regular users collection');
        return await super.fetchUserData(uid);
      }
    } catch (error) {
      console.error('Error fetching ICD user data:', error);
      throw error;
    }
  }

  // Override saveUserData to save to ICD users collection
  protected override async saveUserData(uid: string, userData: UserData): Promise<void> {
    try {
      const icdUserDocRef = doc(this.firestore, `${this.ICD_COLLECTION}/${uid}`);
      console.log('Saving ICD user data to Firestore...');
      
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
        accessLevel: 'user', // Default access level for ICD
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin || null,
        lastActiveAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(icdUserDocRef, firestoreData);
      console.log('✅ ICD user data saved successfully');
    } catch (error: any) {
      console.error('❌ Error saving ICD user data:', error);
      throw error;
    }
  }

  // Override updateLastLogin to update ICD users collection
  protected override async updateLastLogin(uid: string): Promise<void> {
    try {
      const icdUserDocRef = doc(this.firestore, `${this.ICD_COLLECTION}/${uid}`);
      await updateDoc(icdUserDocRef, { 
        lastLogin: new Date(),
        lastActiveAt: new Date()
      });
      console.log('✅ ICD user last login updated');
    } catch (error) {
      console.warn('⚠️ Failed to update ICD user last login:', error);
    }
  }

  // ICD-specific method to get user by email from ICD collection
  async getICDUserByEmail(email: string): Promise<ICDUser | null> {
    try {
      const icdUsersRef = collection(this.firestore, this.ICD_COLLECTION);
      const q = query(icdUsersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          uid: data['uid'],
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
          trainingCompleted: data['trainingCompleted'] || false,
          accessLevel: data['accessLevel'] || 'user',
          lastActiveAt: data['lastActiveAt'] ? new Date(data['lastActiveAt'].seconds * 1000) : undefined,
          permissions: data['permissions'] || []
        } as ICDUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting ICD user by email:', error);
      return null;
    }
  }

  // Method to navigate to ICD main layout after successful login
  async signInAndNavigateToICD(email: string, password: string): Promise<void> {
    try {
      console.log('🔑 Starting ICD sign in process...');
      const userData = await this.signIn(email, password);
      
      if (userData) {
        console.log('✅ ICD sign in successful, navigating to main layout');
        this.router.navigate(['/main-layout']);
      }
    } catch (error) {
      console.error('❌ ICD sign in failed:', error);
      throw error;
    }
  }
}
