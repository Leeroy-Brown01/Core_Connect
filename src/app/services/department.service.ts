import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore';

export interface FirebaseDepartment {
  id?: string;
  name: string;
  description: string;
  departmentManager: string;
  createdAt: Date;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private departmentsCollection = 'icd-departments';
  private firestore = inject(Firestore);

  constructor() {
    console.log('DepartmentService initialized with proper injection context');
  }

  async createDepartment(
    departmentData: {
      name: string;
      description: string;
      departmentManager: string;
      createdBy: string;
    }
  ): Promise<{ success: boolean; department?: FirebaseDepartment; error?: string }> {
    try {
      console.log('🏢 Starting department creation...');

      // Save department data to Firestore
      const deptData: Omit<FirebaseDepartment, 'id'> = {
        name: departmentData.name,
        description: departmentData.description,
        departmentManager: departmentData.departmentManager,
        createdAt: new Date(),
        createdBy: departmentData.createdBy
      };

      const docRef = await addDoc(collection(this.firestore, this.departmentsCollection), deptData);
      
      console.log('✅ Department saved to Firestore');

      return {
        success: true,
        department: {
          id: docRef.id,
          ...deptData
        }
      };

    } catch (error: any) {
      console.error('❌ Error creating department:', error);
      return {
        success: false,
        error: error.message || 'Failed to create department'
      };
    }
  }

  async getDepartments(): Promise<FirebaseDepartment[]> {
    try {
      const q = query(
        collection(this.firestore, this.departmentsCollection),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const departments: FirebaseDepartment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        departments.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps back to Date objects
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt'])
        } as FirebaseDepartment);
      });

      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  async getDepartmentsByName(name: string): Promise<FirebaseDepartment[]> {
    try {
      const q = query(
        collection(this.firestore, this.departmentsCollection),
        where('name', '==', name),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const departments: FirebaseDepartment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        departments.push({
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt'])
        } as FirebaseDepartment);
      });

      return departments;
    } catch (error) {
      console.error('Error fetching departments by name:', error);
      return [];
    }
  }

  async deleteDepartment(departmentId: string): Promise<boolean> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(this.firestore, this.departmentsCollection, departmentId));
      console.log('✅ Department deleted from Firestore');
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      return false;
    }
  }

  async updateDepartment(departmentId: string, updates: Partial<FirebaseDepartment>): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.departmentsCollection, departmentId);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating department:', error);
      return false;
    }
  }
}
