import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

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

  constructor(private firestore: Firestore) {}

  // Create new course
  async createCourse(courseData: Partial<Course>): Promise<any> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const now = Timestamp.now();
      
      const courseToSave = {
        ...courseData,
        createdAt: now,
        updatedAt: now,
        status: courseData.status || 'draft'
      };

      const docRef = await addDoc(coursesCollection, courseToSave);
      console.log('Course created successfully with ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Get all courses
  getCourses(): Observable<Course[]> {
    return from(this.fetchCourses());
  }

  private async fetchCourses(): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const coursesSnapshot = await getDocs(coursesCollection);
      return coursesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Course & { id: string }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Update course
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    try {
      const courseDocRef = doc(this.firestore, `courses/${courseId}`);
      await updateDoc(courseDocRef, {
        ...courseData,
        updatedAt: Timestamp.now()
      });
      console.log('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete course
  async deleteCourse(courseId: string): Promise<void> {
    try {
      const courseDocRef = doc(this.firestore, `courses/${courseId}`);
      await deleteDoc(courseDocRef);
      console.log('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
}
