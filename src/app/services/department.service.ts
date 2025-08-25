// Angular service for managing department data in Firestore
import { Injectable, inject } from '@angular/core'; // Angular DI
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from '@angular/fire/firestore'; // Firestore DB

// Interface representing a department document in Firestore
export interface FirebaseDepartment {
  id?: string; // Firestore document ID
  name: string; // Department name
  description: string; // Department description
  departmentManager: string; // Manager's name or ID
  createdAt: Date; // Creation timestamp
  createdBy: string; // User who created the department
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  // Name of the Firestore collection for departments
  private departmentsCollection = 'icd-departments';
  // Injected Firestore instance
  private firestore = inject(Firestore);

  constructor() {
    // Log service initialization
    console.log('DepartmentService initialized with proper injection context');
  }

  // Create a new department in Firestore
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

      // Prepare department data for Firestore (omit id)
      const deptData: Omit<FirebaseDepartment, 'id'> = {
        name: departmentData.name,
        description: departmentData.description,
        departmentManager: departmentData.departmentManager,
        createdAt: new Date(),
        createdBy: departmentData.createdBy
      };

      // Add new department document to Firestore
      const docRef = await addDoc(collection(this.firestore, this.departmentsCollection), deptData);
      
      console.log('✅ Department saved to Firestore');

      // Return success and the created department (with Firestore ID)
      return {
        success: true,
        department: {
          id: docRef.id,
          ...deptData
        }
      };

    } catch (error: any) {
      // Handle and log errors
      console.error('❌ Error creating department:', error);
      return {
        success: false,
        error: error.message || 'Failed to create department'
      };
    }
  }

  // Fetch all departments from Firestore, ordered by creation date (descending)
  async getDepartments(): Promise<FirebaseDepartment[]> {
    try {
      const q = query(
        collection(this.firestore, this.departmentsCollection),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const departments: FirebaseDepartment[] = [];
      
      // Iterate over each document and build department objects
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
      // Log and return empty array on error
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Fetch departments by name (exact match), ordered by creation date
  async getDepartmentsByName(name: string): Promise<FirebaseDepartment[]> {
    try {
      const q = query(
        collection(this.firestore, this.departmentsCollection),
        where('name', '==', name),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const departments: FirebaseDepartment[] = [];
      
      // Build department objects from query results
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
      // Log and return empty array on error
      console.error('Error fetching departments by name:', error);
      return [];
    }
  }

  // Delete a department by its Firestore document ID
  async deleteDepartment(departmentId: string): Promise<boolean> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(this.firestore, this.departmentsCollection, departmentId));
      console.log('✅ Department deleted from Firestore');
      return true;
    } catch (error) {
      // Log and return false on error
      console.error('Error deleting department:', error);
      return false;
    }
  }

  // Update a department's fields by its Firestore document ID
  async updateDepartment(departmentId: string, updates: Partial<FirebaseDepartment>): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.departmentsCollection, departmentId);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      // Log and return false on error
      console.error('Error updating department:', error);
      return false;
    }
  }
}
