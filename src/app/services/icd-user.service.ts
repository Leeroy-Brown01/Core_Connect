import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore';

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
  private usersCollection = 'icd-users'; // Make sure this matches ICDAuthService
  private firestore = inject(Firestore);

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
          fullName: data['fullName'],
          email: data['email'],
          phone: data['phone'],
          department: data['department'],
          province: data['province'],
          role: data['role'],
          status: data['status'],
          profilePhoto: data['profilePhoto'] || '',
          trainingCompleted: data['trainingCompleted'] || false,
          createdBy: data['createdBy'] || '',
          documentsCount: data['documentsCount'] || 0,
          // Convert Firestore timestamps back to Date objects
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
          lastLoginAt: data['lastLogin']?.toDate ? data['lastLogin'].toDate() : undefined
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
