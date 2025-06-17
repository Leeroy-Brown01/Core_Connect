import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp, writeBatch, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

// Re-export interfaces for backward compatibility
export interface CourseContent {
  title: string;
  description: string;
  duration: string;
}

export interface Instructor {
  name: string;
  bio: string;
  role: string;
}

export interface LearningOutcome {
  outcome: string;
}

export interface QualificationDetail {
  qualification: string;
  description: string;
}

export interface TrainingRequirement {
  requirement: string;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: string;
  imageUrl: string;
  status: string;
  tags: string[];
  courseContent: CourseContent[];
  instructors: Instructor[];
  learningOutcomes: LearningOutcome[];
  qualificationDetails: QualificationDetail[];
  trainingRequirements: TrainingRequirement[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore) {
    console.log('FirebaseService initialized - Consider using CourseService for course operations');
  }

  // Generic Firestore operations that can be used across different collections
  
  // Generic create operation
  async createDocument(collectionName: string, data: any): Promise<any> {
    try {
      const docCollection = collection(this.firestore, collectionName);
      const now = Timestamp.now();
      
      const docToSave = {
        ...data,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(docCollection, docToSave);
      console.log(`Document created successfully in ${collectionName} with ID:`, docRef.id);
      return docRef;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic read operation
  async getDocuments(collectionName: string): Promise<any[]> {
    try {
      const docCollection = collection(this.firestore, collectionName);
      const docsSnapshot = await getDocs(docCollection);
      return docsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error(`Error fetching documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic update operation
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      console.log(`Document updated successfully in ${collectionName}`);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic delete operation
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${collectionName}/${docId}`);
      await deleteDoc(docRef);
      console.log(`Document deleted successfully from ${collectionName}`);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Batch operations
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    docId?: string;
    data?: any;
  }>): Promise<void> {
    try {
      const batch = writeBatch(this.firestore);
      const now = Timestamp.now();

      for (const operation of operations) {
        switch (operation.type) {
          case 'create':
            if (operation.data) {
              const newDocRef = doc(collection(this.firestore, operation.collection));
              batch.set(newDocRef, {
                ...operation.data,
                createdAt: now,
                updatedAt: now
              });
            }
            break;
          case 'update':
            if (operation.docId && operation.data) {
              const updateDocRef = doc(this.firestore, `${operation.collection}/${operation.docId}`);
              batch.update(updateDocRef, {
                ...operation.data,
                updatedAt: now
              });
            }
            break;
          case 'delete':
            if (operation.docId) {
              const deleteDocRef = doc(this.firestore, `${operation.collection}/${operation.docId}`);
              batch.delete(deleteDocRef);
            }
            break;
        }
      }

      await batch.commit();
      console.log('Batch operations completed successfully');
    } catch (error) {
      console.error('Error executing batch operations:', error);
      throw error;
    }
  }

  // Legacy course methods (deprecated - use CourseService instead)
  /** @deprecated Use CourseService instead */
  async createCourse(courseData: Partial<Course>): Promise<any> {
    console.warn('FirebaseService.createCourse is deprecated. Use CourseService.createCourse instead.');
    return this.createDocument('courses', courseData);
  }

  /** @deprecated Use CourseService instead */
  getCourses(): Observable<Course[]> {
    console.warn('FirebaseService.getCourses is deprecated. Use CourseService.getAllCourses instead.');
    return from(this.getDocuments('courses'));
  }

  /** @deprecated Use CourseService instead */
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    console.warn('FirebaseService.updateCourse is deprecated. Use CourseService.updateCourse instead.');
    return this.updateDocument('courses', courseId, courseData);
  }

  /** @deprecated Use CourseService instead */
  async deleteCourse(courseId: string): Promise<void> {
    console.warn('FirebaseService.deleteCourse is deprecated. Use CourseService.deleteCourse instead.');
    return this.deleteDocument('courses', courseId);
  }
}
