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
  description?: string;
  category: string;
  difficulty?: string;
  estimatedDuration?: string;
  imageUrl?: string;
  status: string;
  tags?: string[];
  instructor?: string;
  instructorName?: string;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  published?: boolean;
  isActive?: boolean;
  // Course structure properties
  courseContent?: CourseContent[];
  instructors?: Instructor[];
  learningOutcomes?: LearningOutcome[];
  qualificationDetails?: QualificationDetail[];
  trainingRequirements?: TrainingRequirement[];
  // Remove rating, price, participants as they're not needed
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
        return { id: courseDoc.id, ...data } as Course;
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
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
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
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
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
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
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
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
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
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
      console.log('Fetched', courses.length, 'recent courses');
      return courses;
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      throw error;
    }
  }

  // Create new course
  async createCourse(courseData: Partial<Course>): Promise<any> {
    try {
      console.log('Creating course:', courseData);
      const coursesCollection = collection(this.firestore, 'courses');
      const docRef = await addDoc(coursesCollection, {
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Course created successfully with ID:', docRef.id);
      return docRef;
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
        updatedAt: new Date().toISOString()
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
      map(courses => {
        console.log('Raw courses data for metrics:', courses);
        
        // Count total courses
        const totalCourses = courses.length;
        
        // Count published courses - check multiple possible status formats
        const publishedCourses = courses.filter(course => {
          const status = course.status?.toLowerCase();
          const isPublished = course.published;
          const isActive = course.isActive;
          return status === 'published' || status === 'active' || isPublished === true || isActive === true;
        });
        
        // Count draft/pending courses
        const draftCourses = courses.filter(course => {
          const status = course.status?.toLowerCase();
          return status === 'draft' || status === 'pending' || status === 'awaiting approval';
        });
        
        // Count completed courses (courses that have been fully processed)
        const completedCourses = courses.filter(course => {
          return course.status?.toLowerCase() === 'completed' || course.status?.toLowerCase() === 'finished';
        });
        
        const metrics = {
          totalCourses: totalCourses,
          publishedCourses: publishedCourses.length,
          draftCourses: draftCourses.length,
          completedCourses: completedCourses.length,
          coursesAwaitingApproval: draftCourses.length
        };
        
        console.log('Calculated course metrics:', metrics);
        console.log('Sample course for debugging:', courses[0]);
        
        return metrics;
      })
    );
  }

  // Get courses by instructor
  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    return from(this.fetchCoursesByInstructor(instructorId));
  }

  private async fetchCoursesByInstructor(instructorId: string): Promise<Course[]> {
    try {
      const coursesCollection = collection(this.firestore, 'courses');
      const q = query(coursesCollection, where('createdBy', '==', instructorId));
      const coursesSnapshot = await getDocs(q);
      return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
    } catch (error) {
      console.error('Error fetching courses by instructor:', error);
      throw error;
    }
  }

  // Transform Firestore data to consistent format
  private transformCourseData(data: any): Course {
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      // Ensure course content is properly formatted
      courseContent: this.formatCourseContent(data.courseContent || []),
      instructors: data.instructors || [],
      learningOutcomes: data.learningOutcomes || [],
      qualificationDetails: data.qualificationDetails || [],
      trainingRequirements: data.trainingRequirements || [],
      tags: data.tags || []
    } as Course;
  }

  // Format course content to ensure consistent structure
  private formatCourseContent(courseContent: any[]): CourseContent[] {
    if (!courseContent || !Array.isArray(courseContent)) {
      return [];
    }
    
    return courseContent.map(content => ({
      title: content.title || 'Module',
      description: content.description || '',
      duration: content.duration || '30 minutes'
    }));
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

  // Simple course counting method - similar to user counting approach
  getCourseCount(): Observable<number> {
    return this.getAllCourses().pipe(
      map(courses => {
        console.log('Counting total courses:', courses.length);
        return courses.length;
      })
    );
  }

  // Get published course count
  getPublishedCourseCount(): Observable<number> {
    return this.getAllCourses().pipe(
      map(courses => {
        console.log('Counting published courses from all courses:', courses.length);
        const publishedCourses = courses.filter(course => {
          const status = course.status?.toLowerCase();
          const isPublished = course.published;
          const isActive = course.isActive;
          return status === 'published' || status === 'active' || isPublished === true || isActive === true;
        });
        console.log('Found published courses:', publishedCourses.length);
        return publishedCourses.length;
      })
    );
  }

  // Get draft/pending course count
  getDraftCourseCount(): Observable<number> {
    return this.getAllCourses().pipe(
      map(courses => {
        const draftCourses = courses.filter(course => {
          const status = course.status?.toLowerCase();
          return status === 'draft' || status === 'pending' || status === 'awaiting approval';
        });
        console.log('Found draft/pending courses:', draftCourses.length);
        return draftCourses.length;
      })
    );
  }

  // Simplified course metrics for individual metric cards
  getSimpleCourseMetrics(): Observable<any> {
    return this.getAllCourses().pipe(
      map(courses => {
        console.log('Calculating simple course metrics from courses:', courses.length);
        
        const totalCourses = courses.length;
        
        const publishedCourses = courses.filter(course => {
          const status = course.status?.toLowerCase();
          const isPublished = course.published;
          const isActive = course.isActive;
          return status === 'published' || status === 'active' || isPublished === true || isActive === true;
        });
        
        const draftCourses = courses.filter(course => {
          const status = course.status?.toLowerCase();
          return status === 'draft' || status === 'pending' || status === 'awaiting approval';
        });
        
        const completedCourses = courses.filter(course => {
          return course.status?.toLowerCase() === 'completed' || course.status?.toLowerCase() === 'finished';
        });
        
        const metrics = {
          totalCourses: totalCourses,
          publishedCourses: publishedCourses.length,
          draftCourses: draftCourses.length,
          completedCourses: completedCourses.length,
          coursesAwaitingApproval: draftCourses.length
        };
        
        console.log('Simple course metrics calculated:', metrics);
        return metrics;
      })
    );
  }
}
