import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, signOut, fetchSignInMethodsForEmail } from '@angular/fire/auth';

export interface FirebaseICDUser {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  province: string;
  role: string;
  status: 'active' | 'inactive';
  profilePhoto?: string;
  trainingCompleted: boolean;
  createdAt: Date;
  createdBy: string;
  lastLoginAt?: Date;
  documentsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ICDUserService {
  private usersCollection = 'icd-users';
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  constructor() {
    console.log('ICDUserService initialized with proper injection context');
  }

  async createUser(
    userData: {
      fullName: string;
      email: string;
      phone: string;
      department: string;
      province: string;
      role: string;
      status: 'active' | 'inactive';
      profilePhoto?: string;
      trainingCompleted: boolean;
      createdBy: string;
    }
  ): Promise<{ success: boolean; user?: FirebaseICDUser; error?: string }> {
    try {
      console.log('👤 Starting ICD user creation...');

      // Save user data to Firestore
      const userInfo: Omit<FirebaseICDUser, 'id'> = {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        department: userData.department,
        province: userData.province,
        role: userData.role,
        status: userData.status,
        profilePhoto: userData.profilePhoto || '',
        trainingCompleted: userData.trainingCompleted,
        createdAt: new Date(),
        createdBy: userData.createdBy,
        documentsCount: 0
      };

      const docRef = await addDoc(collection(this.firestore, this.usersCollection), userInfo);
      
      console.log('✅ ICD User saved to Firestore');

      return {
        success: true,
        user: {
          id: docRef.id,
          ...userInfo
        }
      };

    } catch (error: any) {
      console.error('❌ Error creating ICD user:', error);
      return {
        success: false,
        error: error.message || 'Failed to create ICD user'
      };
    }
  }

  async checkEmailExists(email: string): Promise<{
    existsInAuth: boolean;
    existsInFirestore: boolean;
    canCreate: boolean;
    message: string;
  }> {
    try {
      // Check Firebase Auth
      const authMethods = await fetchSignInMethodsForEmail(this.auth, email);
      const existsInAuth = authMethods.length > 0;

      // Check ICD Firestore
      const existsInFirestore = await this.checkEmailInFirestore(email);

      let canCreate = false;
      let message = '';

      if (!existsInAuth && !existsInFirestore) {
        canCreate = true;
        message = 'Email is available for new user creation';
      } else if (existsInAuth) {
        message = 'Email already exists in Firebase Authentication';
      } else if (existsInFirestore) {
        message = 'Email already exists in ICD system';
      }

      return {
        existsInAuth,
        existsInFirestore,
        canCreate,
        message
      };
    } catch (error) {
      console.error('Error checking email:', error);
      return {
        existsInAuth: false,
        existsInFirestore: false,
        canCreate: false,
        message: 'Error checking email availability'
      };
    }
  }

  private async checkEmailInFirestore(email: string): Promise<boolean> {
    try {
      const usersRef = collection(this.firestore, this.usersCollection);
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking Firestore:', error);
      return false;
    }
  }

  async checkEmailExistsInAuth(email: string): Promise<boolean> {
    try {
      const authMethods = await fetchSignInMethodsForEmail(this.auth, email);
      return authMethods.length > 0;
    } catch (error) {
      console.error('Error checking email in Firebase Auth:', error);
      return false;
    }
  }

  async createUserForAdmin(
    userData: {
      fullName: string;
      email: string;
      phone: string;
      department: string;
      province: string;
      role: string;
      status: 'active' | 'inactive';
      profilePhoto?: string;
      trainingCompleted: boolean;
    },
    password: string,
    createdBy: string
  ): Promise<{ success: boolean; user?: FirebaseICDUser; error?: string }> {
    try {
      console.log('🔑 Admin creating user:', userData.email);

      // First check if email exists
      const emailCheck = await this.checkEmailExists(userData.email);
      if (!emailCheck.canCreate) {
        return {
          success: false,
          error: emailCheck.message
        };
      }

      // Create Firebase Auth user
      console.log('Creating Firebase Auth account...');
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        password
      );

      console.log('✅ Firebase Auth user created:', credential.user.uid);

      // Create ICD user record with the created user's UID
      console.log('Creating ICD user record...');
      const userDocRef = doc(this.firestore, this.usersCollection, credential.user.uid);
      await setDoc(userDocRef, {
        ...userData,
        uid: credential.user.uid,
        createdBy,
        createdAt: new Date(),
        documentsCount: 0
      });

      console.log('✅ ICD user record created');

      // Sign out the newly created user immediately to prevent auto-login
      console.log('🔓 Signing out newly created user...');
      await signOut(this.auth);

      console.log('✅ User created successfully by admin');
      
      return {
        success: true,
        user: {
          id: credential.user.uid,
          uid: credential.user.uid,
          ...userData,
          createdBy,
          createdAt: new Date(),
          documentsCount: 0
        } as FirebaseICDUser
      };

    } catch (error: any) {
      console.error('❌ Error in admin user creation:', error);
      
      let errorMessage = 'Failed to create user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getUsers(): Promise<FirebaseICDUser[]> {
    try {
      const q = query(
        collection(this.firestore, this.usersCollection),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: FirebaseICDUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps back to Date objects
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
          lastLoginAt: data['lastLoginAt']?.toDate ? data['lastLoginAt'].toDate() : undefined
        } as FirebaseICDUser);
      });

      return users;
    } catch (error) {
      console.error('Error fetching ICD users:', error);
      return [];
    }
  }

  async getUsersByDepartment(department: string): Promise<FirebaseICDUser[]> {
    try {
      const q = query(
        collection(this.firestore, this.usersCollection),
        where('department', '==', department),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: FirebaseICDUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
          lastLoginAt: data['lastLoginAt']?.toDate ? data['lastLoginAt'].toDate() : undefined
        } as FirebaseICDUser);
      });

      return users;
    } catch (error) {
      console.error('Error fetching ICD users by department:', error);
      return [];
    }
  }

  async getUsersByRole(role: string): Promise<FirebaseICDUser[]> {
    try {
      const q = query(
        collection(this.firestore, this.usersCollection),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: FirebaseICDUser[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
          lastLoginAt: data['lastLoginAt']?.toDate ? data['lastLoginAt'].toDate() : undefined
        } as FirebaseICDUser);
      });

      return users;
    } catch (error) {
      console.error('Error fetching ICD users by role:', error);
      return [];
    }
  }

  async getUserByEmail(email: string): Promise<FirebaseICDUser | null> {
    try {
      const usersRef = collection(this.firestore, 'icd-users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as FirebaseICDUser;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(this.firestore, this.usersCollection, userId));
      console.log('✅ ICD User deleted from Firestore');
      return true;
    } catch (error) {
      console.error('Error deleting ICD user:', error);
      return false;
    }
  }

  async updateUser(userId: string, updates: Partial<FirebaseICDUser>): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.usersCollection, userId);
      await updateDoc(docRef, updates);
      console.log('✅ ICD User updated in Firestore');
      return true;
    } catch (error) {
      console.error('Error updating ICD user:', error);
      return false;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.usersCollection, userId);
      await updateDoc(docRef, { status, lastLoginAt: new Date() });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  async incrementDocumentCount(userId: string): Promise<boolean> {
    try {
      // You would implement this to increment the user's document count
      // For now, we'll just update with a placeholder
      const docRef = doc(this.firestore, this.usersCollection, userId);
      await updateDoc(docRef, { 
        documentsCount: (await this.getDocumentCountForUser(userId)) + 1 
      });
      return true;
    } catch (error) {
      console.error('Error incrementing document count:', error);
      return false;
    }
  }

  private async getDocumentCountForUser(userId: string): Promise<number> {
    // This would typically query the documents collection to count user's documents
    // For now, return a placeholder
    return 0;
  }
}
