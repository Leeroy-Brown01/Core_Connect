import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserData } from '../../services/auth.service';
import { CourseService, Course } from '../../services/course.service';
import { Subscription } from 'rxjs';

interface User {
  name: string;
  email: string;
  profileImage: string;
  notifications: number;
  wishlist: number;
  initials?: string;
}

interface ContinueLearningCourse {
  id: number;
  title: string;
  imageUrl: string;
  progress: number;
  lastWatched: string;
  remainingTime: string;
}

interface WasteManagementCourse {
  id: number;
  title: string;
  imageUrl: string;
  lastWatched: string;
  remainingTime: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
encodeURIComponent(arg0: string) {
throw new Error('Method not implemented.');
}
  currentUser: UserData | null = null;
  loading = true;
  coursesLoading = true;
  coursesError: string | null = null;
  
  user: User | null = {
    name: '',
    email: '',
    profileImage: '',
    notifications: 0,
    wishlist: 0,
    initials: ''
  };
  
  currentSlide = 0;
  sliderInterval: any;
  isAdmin: boolean = false;

  // Course data from CourseService
  recommendedCourses: Course[] = [];
  allCourses: Course[] = [];
  publishedCourses: Course[] = [];
  
  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  // Carousel navigation
  currentRecommendedIndex = 0;
  visibleRecommendedCount = 4;

  // Continue Learning
  continueLearningCourses: ContinueLearningCourse[] = [];
  currentContinueLearningIndex = 0;
  visibleContinueLearningCount = 4;

  // Waste Management (New Section)
  wasteManagementCourses: WasteManagementCourse[] = [];
  currentWasteManagementIndex = 0;
  visibleWasteManagementCount = 4;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticatedSync()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/log-in'], { replaceUrl: true });
      return;
    }

    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        
        this.user = {
          name: user.fullName,
          email: user.email,
          profileImage: user.profilePhoto || '',
          notifications: 0,
          wishlist: 0,
          initials: this.getInitials(user.fullName)
        };
        
        this.isAdmin = user.role === 'admin';
        this.loading = false;
        console.log('User data loaded from Firestore:', user);
        
        this.loadCourses();
      } else {
        console.log('No user data, redirecting to login');
        this.router.navigate(['/log-in'], { replaceUrl: true });
      }
    });
    
    this.subscriptions.push(userSub);
    this.startSliderAutoplay();
  }
  
  ngOnDestroy(): void {
    this.stopSliderAutoplay();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Make this method public so it can be called from the template
  loadCourses(): void {
    this.coursesLoading = true;
    this.coursesError = null;
    
    console.log('🔄 Loading courses from CourseService...');
    console.log('🔍 CourseService instance:', this.courseService);
    
    // First, let's test with getAllCourses to see if we can fetch any data
    const allCoursesSub = this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('✅ All courses fetched successfully:', courses.length);
        console.log('📊 All courses data:', courses);
        
        this.allCourses = courses;
        
        // Use all courses for recommended if we have them
        if (courses && courses.length > 0) {
          console.log('📋 Using all courses for sections');
        } else {
          console.log('⚠️ No courses found, loading fallback');
          this.loadFallbackCourses();
        }
        
        // Update both sections with the same data
        this.updateContinueLearningSection(courses);
        this.updateWasteManagementSection(courses);
        this.coursesLoading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching all courses:', error);
        console.error('❌ Error details:', error.message || error);
        
        // Try to get published courses as fallback
        this.tryPublishedCoursesAsBackup();
      }
    });
    
    this.subscriptions.push(allCoursesSub);
  }

  private tryPublishedCoursesAsBackup(): void {
    console.log('🔄 Trying published courses as backup...');
    
    const publishedSub = this.courseService.getPublishedCourses().subscribe({
      next: (courses) => {
        console.log('✅ Published courses fetched successfully:', courses.length);
        console.log('📊 Published courses data:', courses);
        
        this.publishedCourses = courses;
        
        if (courses && courses.length > 0) {
          // Update both sections
          this.updateContinueLearningSection(courses);
          this.updateWasteManagementSection(courses);
          console.log('🎯 Updated both sections from published courses');
        } else {
          console.log('⚠️ No published courses found, loading fallback');
          this.loadFallbackCourses();
        }
        
        this.coursesLoading = false;
      },
      error: (error) => {
        console.error('❌ Error fetching published courses:', error);
        console.error('❌ Error details:', error.message || error);
        
        this.coursesError = 'Failed to load courses. Please try again later.';
        this.coursesLoading = false;
        this.loadFallbackCourses();
      }
    });
    
    this.subscriptions.push(publishedSub);
  }

  private transformCoursesForRecommended(courses: Course[]): Course[] {
    console.log('🔄 Transforming courses for recommended section...');
    console.log('📥 Input courses:', courses);
    
    if (!courses || courses.length === 0) {
      console.log('⚠️ No courses to transform');
      return [];
    }
    
    const transformedCourses = courses.map((course, index) => {
      console.log(`🔄 Transforming course ${index + 1}:`, course);
      
      const transformedCourse: Course = {
        ...course,
        // Ensure instructor property exists for the UI
        instructor: course.instructors && course.instructors.length > 0 
          ? course.instructors[0].name 
          : course.instructorName || course.createdBy || 'Professional Instructor',
        // Ensure course content is properly formatted
        courseContent: this.formatCourseContent(course.courseContent || [])
      };
      
      console.log(`✅ Transformed course ${index + 1}:`, {
        id: transformedCourse.id,
        title: transformedCourse.title,
        instructor: transformedCourse.instructor,
        status: transformedCourse.status,
        category: transformedCourse.category,
        courseContentCount: transformedCourse.courseContent?.length || 0
      });
      
      return transformedCourse;
    });
    
    console.log('🎯 Final transformed courses:', transformedCourses);
    return transformedCourses;
  }

  // Format course content to ensure consistent structure
  private formatCourseContent(courseContent: any[]): any[] {
    if (!courseContent || !Array.isArray(courseContent)) {
      return [];
    }
    
    return courseContent.map(content => ({
      title: content.title || 'Module',
      description: content.description || '',
      duration: content.duration || '30 minutes'
    }));
  }
  
  private updateContinueLearningSection(courses: Course[]): void {
    console.log('🔄 Updating Continue Learning section with courses:', courses.length);
    
    // Takes the first 5 courses from the fetched data
    const continueCourses = courses.slice(0, 5).map((course, index) => {
      console.log(`📚 Processing course ${index + 1} for Continue Learning:`, course.title);
      
      return {
        id: parseInt(course.id || '0'),
        title: course.title,
        imageUrl: course.imageUrl || 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(course.title),
        progress: Math.floor(Math.random() * 80) + 10, // 🎲 Random progress between 10-89%
        lastWatched: this.getLastWatchedContent(course),
        remainingTime: this.calculateEstimatedTime(course)
      };
    });
    
    this.continueLearningCourses = continueCourses;
    console.log('✅ Continue Learning courses updated:', this.continueLearningCourses);
  }
  
  private updateWasteManagementSection(courses: Course[]): void {
    console.log('🔄 Updating Waste Management section with courses:', courses.length);
    
    // Takes the first 5 courses from the fetched data (same as continue learning)
    const wasteManagementCourses = courses.slice(0, 5).map((course, index) => {
      console.log(`♻️ Processing course ${index + 1} for Waste Management:`, course.title);
      
      return {
        id: parseInt(course.id || '0'),
        title: course.title,
        imageUrl: course.imageUrl || 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(course.title),
        lastWatched: course.category || 'Professional Training', // Show category instead of progress
        remainingTime: this.calculateEstimatedTime(course)
      };
    });
    
    this.wasteManagementCourses = wasteManagementCourses;
    console.log('✅ Waste Management courses updated:', this.wasteManagementCourses);
  }

  // Helper method to get last watched content from course structure
  private getLastWatchedContent(course: Course): string {
    if (course.courseContent && course.courseContent.length > 0) {
      const firstModule = course.courseContent[0];
      return `Module 1: ${firstModule.title || 'Introduction'}`;
    }
    
    // Fallback based on category or difficulty
    if (course.category) {
      return `${course.category} Module`;
    }
    
    return 'Introduction Module';
  }

  // Helper method to calculate estimated time from course data
  private calculateEstimatedTime(course: Course): string {
    // Use estimatedDuration if available
    if (course.estimatedDuration) {
      return course.estimatedDuration;
    }
    
    // Calculate from course content if available
    if (course.courseContent && course.courseContent.length > 0) {
      const totalMinutes = course.courseContent.reduce((total, content) => {
        // Parse duration strings like "30 minutes", "1 hour", etc.
        const duration = content.duration || '30 minutes';
        const minutes = this.parseDurationToMinutes(duration);
        return total + minutes;
      }, 0);
      
      return this.formatMinutesToDuration(totalMinutes);
    }
    
    // Fallback based on difficulty
    const difficultyMap: { [key: string]: string } = {
      'beginner': '2h 30m',
      'intermediate': '4h 15m',
      'advanced': '6h 45m'
    };
    
    return difficultyMap[course.difficulty?.toLowerCase() || 'intermediate'] || '3h 30m';
  }

  // Parse duration string to minutes
  private parseDurationToMinutes(duration: string): number {
    const hourMatch = duration.match(/(\d+)\s*h/i);
    const minuteMatch = duration.match(/(\d+)\s*m/i);
    
    let totalMinutes = 0;
    
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    
    // If no match found, assume it's minutes
    if (!hourMatch && !minuteMatch) {
      const numberMatch = duration.match(/(\d+)/);
      if (numberMatch) {
        totalMinutes = parseInt(numberMatch[1]);
      } else {
        totalMinutes = 30; // Default fallback
      }
    }
    
    return totalMinutes;
  }

  // Format minutes back to duration string
  private formatMinutesToDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  private loadFallbackCourses(): void {
    console.log('🔄 Loading fallback courses due to error or no data');
    
    // Create fallback data for Continue Learning
    this.continueLearningCourses = [
      {
        id: 1,
        title: 'Industrial Facility Cleaning Certification',
        imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop',
        progress: 75,
        lastWatched: 'Module 3: Safety Protocols',
        remainingTime: '2h 30m'
      },
      {
        id: 2,
        title: 'Commercial Office Cleaning Standards',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        progress: 45,
        lastWatched: 'Module 2: Cleaning Techniques',
        remainingTime: '4h 15m'
      }
    ];

    // Create fallback data for Waste Management
    this.wasteManagementCourses = [
      {
        id: 1,
        title: 'Industrial Facility Cleaning Certification',
        imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop',
        lastWatched: 'Industrial Cleaning',
        remainingTime: '4h 30m'
      },
      {
        id: 2,
        title: 'Commercial Office Cleaning Standards',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        lastWatched: 'Commercial Cleaning',
        remainingTime: '3h 45m'
      }
    ];
    
    console.log('📋 Fallback courses loaded for both sections');
  }

  // Navigation methods
  navigateTo(url: string): void {
    this.router.navigate([url]);
  }

  // Slider methods
  startSliderAutoplay(): void {
    this.sliderInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 3;
    }, 4000);
  }
  
  stopSliderAutoplay(): void {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }
  
  setSlide(index: number): void {
    this.currentSlide = index;
    this.stopSliderAutoplay();
    this.startSliderAutoplay();
  }

  // Carousel navigation methods
  prevRecommended(): void {
    if (this.currentRecommendedIndex > 0) {
      this.currentRecommendedIndex--;
    }
  }
  
  nextRecommended(): void {
    if (this.currentRecommendedIndex < this.recommendedCourses.length - this.visibleRecommendedCount) {
      this.currentRecommendedIndex++;
    }
  }

  prevContinueLearning(): void {
    if (this.currentContinueLearningIndex > 0) {
      this.currentContinueLearningIndex--;
    }
  }
  
  nextContinueLearning(): void {
    if (this.currentContinueLearningIndex < this.continueLearningCourses.length - this.visibleContinueLearningCount) {
      this.currentContinueLearningIndex++;
    }
  }

  // Waste Management navigation methods
  prevWasteManagement(): void {
    if (this.currentWasteManagementIndex > 0) {
      this.currentWasteManagementIndex--;
    }
  }
  
  nextWasteManagement(): void {
    if (this.currentWasteManagementIndex < this.wasteManagementCourses.length - this.visibleWasteManagementCount) {
      this.currentWasteManagementIndex++;
    }
  }

  // Utility methods
  getInitials(name: string): string {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  onImageError(event: Event, courseTitle: string): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src) {
      imgElement.src = 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(courseTitle);
    }
  }

  addToWishlist(courseId: string): void {
    console.log('Added to wishlist:', courseId);
    if (this.user) {
      this.user.wishlist++;
    }
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id || index.toString();
  }
}