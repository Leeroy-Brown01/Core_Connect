import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, addDoc, writeBatch, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
  enrollmentCount?: number;
  completionRate?: number;
  // UI-specific properties for displaying courses
  instructor?: string; // For backward compatibility
  rating?: number; // Generated rating for display
  price?: number; // Generated or actual price
  participants?: number; // Alternative to enrollmentCount
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private firestore: Firestore) {
    console.log('CourseService initialized with Firestore:', !!this.firestore);
  }

  // Get single course by ID
  getCourse(courseId: string): Observable<Course | null> {
    console.log('Getting course data for ID:', courseId);
    return from(this.fetchCourse(courseId)).pipe(
      catchError(error => {
        console.error('Error getting course:', error);
        throw error;
      })
    );
  }

  private async fetchCourse(courseId: string): Promise<Course | null> {
    try {
      const courseDocRef = doc(this.firestore, `courses/${courseId}`);
      const courseDoc = await getDoc(courseDocRef);
      
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        console.log('Course data fetched successfully for:', courseId);
        return this.transformCourseData({ id: courseDoc.id, ...data });
      } else {
        console.log('No course document found for:', courseId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching course document:', error);
      throw error;
    }
  }

  // Get all courses
  getAllCourses(): Observable<Course[]> {
    console.log('Fetching all courses');
    return from(this.fetchAllCourses()).pipe(
      catchError(error => {
        console.error('Error getting all courses:', error);
        throw error;
      })
    );
  }

  private async fetchAllCourses(): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const coursesSnapshot = await getDocs(coursesCollection);
      const courses = coursesSnapshot.docs.map(doc => 
        this.transformCourseData({ id: doc.id, ...doc.data() })
      );
      console.log('Fetched', courses.length, 'courses');
      return courses;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      throw error;
    }
  }

  // Get courses by category
  getCoursesByCategory(category: string): Observable<Course[]> {
    console.log('Fetching courses by category:', category);
    return from(this.fetchCoursesByCategory(category)).pipe(
      catchError(error => {
        console.error('Error getting courses by category:', error);
        throw error;
      })
    );
  }

  private async fetchCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const q = query(coursesCollection, where('category', '==', category));
      const coursesSnapshot = await getDocs(q);
      const courses = coursesSnapshot.docs.map(doc => 
        this.transformCourseData({ id: doc.id, ...doc.data() })
      );
      console.log('Fetched', courses.length, 'courses for category:', category);
      return courses;
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw error;
    }
  }

  // Get courses by status
  getCoursesByStatus(status: string): Observable<Course[]> {
    console.log('Fetching courses by status:', status);
    return from(this.fetchCoursesByStatus(status)).pipe(
      catchError(error => {
        console.error('Error getting courses by status:', error);
        throw error;
      })
    );
  }

  private async fetchCoursesByStatus(status: string): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const q = query(coursesCollection, where('status', '==', status));
      const coursesSnapshot = await getDocs(q);
      const courses = coursesSnapshot.docs.map(doc => 
        this.transformCourseData({ id: doc.id, ...doc.data() })
      );
      console.log('Fetched', courses.length, 'courses with status:', status);
      return courses;
    } catch (error) {
      console.error('Error fetching courses by status:', error);
      throw error;
    }
  }

  // Get published courses only
  getPublishedCourses(): Observable<Course[]> {
    return this.getCoursesByStatus('published');
  }

  // Get draft courses only
  getDraftCourses(): Observable<Course[]> {
    return this.getCoursesByStatus('draft');
  }

  // Get courses by difficulty
  getCoursesByDifficulty(difficulty: string): Observable<Course[]> {
    console.log('Fetching courses by difficulty:', difficulty);
    return from(this.fetchCoursesByDifficulty(difficulty)).pipe(
      catchError(error => {
        console.error('Error getting courses by difficulty:', error);
        throw error;
      })
    );
  }

  private async fetchCoursesByDifficulty(difficulty: string): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const q = query(coursesCollection, where('difficulty', '==', difficulty));
      const coursesSnapshot = await getDocs(q);
      const courses = coursesSnapshot.docs.map(doc => 
        this.transformCourseData({ id: doc.id, ...doc.data() })
      );
      console.log('Fetched', courses.length, 'courses with difficulty:', difficulty);
      return courses;
    } catch (error) {
      console.error('Error fetching courses by difficulty:', error);
      throw error;
    }
  }

  // Get recent courses
  getRecentCourses(limitCount: number = 10): Observable<Course[]> {
    console.log('Fetching recent courses, limit:', limitCount);
    return from(this.fetchRecentCourses(limitCount)).pipe(
      catchError(error => {
        console.error('Error getting recent courses:', error);
        throw error;
      })
    );
  }

  private async fetchRecentCourses(limitCount: number): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const q = query(
        coursesCollection, 
        orderBy('createdAt', 'desc'), 
        limit(limitCount)
      );
      const coursesSnapshot = await getDocs(q);
      const courses = coursesSnapshot.docs.map(doc => 
        this.transformCourseData({ id: doc.id, ...doc.data() })
      );
      console.log('Fetched', courses.length, 'recent courses');
      return courses;
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      throw error;
    }
  }

  // Create new course
  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Creating new course:', courseData.title);
      const coursesCollection = collection(this.firestore, 'courses');
      const now = Timestamp.now();
      
      const courseToSave = {
        ...courseData,
        createdAt: now,
        updatedAt: now,
        status: courseData.status || 'draft',
        enrollmentCount: 0,
        completionRate: 0
      };

      const docRef = await addDoc(coursesCollection, courseToSave);
      console.log('Course created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Update course
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    try {
      console.log('Updating course:', courseId, 'with data:', courseData);
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
      console.log('Deleting course:', courseId);
      const courseDocRef = doc(this.firestore, `courses/${courseId}`);
      await deleteDoc(courseDocRef);
      console.log('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Search courses by title or description
  searchCourses(searchTerm: string): Observable<Course[]> {
    console.log('Searching courses for term:', searchTerm);
    return from(this.performCourseSearch(searchTerm)).pipe(
      catchError(error => {
        console.error('Error searching courses:', error);
        throw error;
      })
    );
  }

  private async performCourseSearch(searchTerm: string): Promise<Course[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified search that gets all courses and filters client-side
      // For production, consider using Algolia or Elasticsearch
      const allCourses = await this.fetchAllCourses();
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredCourses = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchTermLower) ||
        course.description.toLowerCase().includes(searchTermLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
      
      console.log('Search found', filteredCourses.length, 'courses for term:', searchTerm);
      return filteredCourses;
    } catch (error) {
      console.error('Error performing course search:', error);
      throw error;
    }
  }

  // Get course metrics
  getCourseMetrics(): Observable<any> {
    return this.getAllCourses().pipe(
      map(courses => ({
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.status === 'published').length,
        draftCourses: courses.filter(c => c.status === 'draft').length,
        totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
        averageCompletionRate: courses.length > 0 
          ? courses.reduce((sum, c) => sum + (c.completionRate || 0), 0) / courses.length 
          : 0,
        coursesByCategory: this.groupCoursesByCategory(courses),
        coursesByDifficulty: this.groupCoursesByDifficulty(courses)
      }))
    );
  }

  private groupCoursesByCategory(courses: Course[]): { [key: string]: number } {
    return courses.reduce((acc, course) => {
      acc[course.category] = (acc[course.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private groupCoursesByDifficulty(courses: Course[]): { [key: string]: number } {
    return courses.reduce((acc, course) => {
      acc[course.difficulty] = (acc[course.difficulty] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  // Transform Firestore data to consistent format
  private transformCourseData(data: any): Course {
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      courseContent: data.courseContent || [],
      instructors: data.instructors || [],
      learningOutcomes: data.learningOutcomes || [],
      qualificationDetails: data.qualificationDetails || [],
      trainingRequirements: data.trainingRequirements || [],
      tags: data.tags || [],
      enrollmentCount: data.enrollmentCount || 0,
      completionRate: data.completionRate || 0
    } as Course;
  }

  // Bulk operations
  async createMultipleCourses(coursesData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    try {
      console.log('Creating multiple courses:', coursesData.length);
      const batch = writeBatch(this.firestore);
      const now = Timestamp.now();
      
      for (const courseData of coursesData) {
        const courseRef = doc(collection(this.firestore, 'courses'));
        batch.set(courseRef, {
          ...courseData,
          createdAt: now,
          updatedAt: now,
          status: courseData.status || 'draft',
          enrollmentCount: 0,
          completionRate: 0
        });
      }
      
      await batch.commit();
      console.log('Multiple courses created successfully');
    } catch (error) {
      console.error('Error creating multiple courses:', error);
      throw error;
    }
  }
}
