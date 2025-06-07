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
          console.log('📋 Using all courses for recommended section');
          this.recommendedCourses = this.transformCoursesForRecommended(courses);
          console.log('🎯 Transformed recommended courses:', this.recommendedCourses);
        } else {
          console.log('⚠️ No courses found, loading fallback');
          this.loadFallbackCourses();
        }
        
        // 🎯 THIS IS WHERE CONTINUE LEARNING GETS ITS DATA
        this.updateContinueLearningSection(courses);
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
          this.recommendedCourses = this.transformCoursesForRecommended(courses);
          console.log('🎯 Transformed recommended courses from published:', this.recommendedCourses);
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
          : 'Professional Instructor',
        // Generate rating if not exists
        rating: course.rating || this.generateRating(course),
        // Generate price if not exists
        price: course.price || this.generatePrice(course),
        // Use enrollmentCount or generate participants
        participants: course.participants || course.enrollmentCount || this.generateParticipants(course)
      };
      
      console.log(`✅ Transformed course ${index + 1}:`, {
        id: transformedCourse.id,
        title: transformedCourse.title,
        instructor: transformedCourse.instructor,
        rating: transformedCourse.rating,
        price: transformedCourse.price,
        participants: transformedCourse.participants,
        status: transformedCourse.status,
        category: transformedCourse.category
      });
      
      return transformedCourse;
    });
    
    console.log('🎯 Final transformed courses:', transformedCourses);
    return transformedCourses;
  }

  private generateRating(course: Course): number {
    const baseRating = 4.0;
    const variationFactor = course.title.length % 10 / 10;
    return Math.round((baseRating + variationFactor) * 10) / 10;
  }
  
  private generatePrice(course: Course): number {
    const basePrices = {
      'beginner': 49.99,
      'intermediate': 99.99,
      'advanced': 149.99
    };
    
    const basePrice = basePrices[course.difficulty.toLowerCase() as keyof typeof basePrices] || 99.99;
    const contentMultiplier = (course.courseContent?.length || 1) * 0.1;
    
    return Math.round((basePrice + (basePrice * contentMultiplier)) * 100) / 100;
  }
  
  private generateParticipants(course: Course): number {
    const baseParticipants = 500;
    
    // Fix the createdAt handling to work with both Date and Timestamp
    let ageMultiplier = 1;
    if (course.createdAt) {
      let createdDate: Date;
      
      // Handle both Date and Timestamp types
      if (course.createdAt instanceof Date) {
        createdDate = course.createdAt;
      } else if (typeof course.createdAt === 'object' && 'toDate' in course.createdAt) {
        // It's a Firestore Timestamp
        createdDate = (course.createdAt as any).toDate();
      } else {
        // It's a string or number, convert to Date
        createdDate = new Date(course.createdAt as string | number);
      }
      
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      ageMultiplier = Math.floor(daysSinceCreation / 30) || 1; // Convert to months
    }
    
    return baseParticipants + (ageMultiplier * 100) + Math.floor(Math.random() * 1000);
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
        lastWatched: `Module ${Math.floor(Math.random() * 5) + 1}: ${course.courseContent && course.courseContent.length > 0 ? course.courseContent[0].title : 'Introduction'}`,
        remainingTime: `${Math.floor(Math.random() * 4) + 1}h ${Math.floor(Math.random() * 60)}m` // 🎲 Random remaining time
      };
    });
    
    this.continueLearningCourses = continueCourses;
    console.log('✅ Continue Learning courses updated:', this.continueLearningCourses);
  }
  
  private loadFallbackCourses(): void {
    console.log('🔄 Loading fallback courses due to error or no data');
    this.recommendedCourses = [
      {
        id: 'fallback-1',
        title: 'Industrial Facility Cleaning Certification',
        description: 'Professional cleaning techniques for industrial facilities',
        category: 'Industrial Cleaning',
        difficulty: 'intermediate',
        estimatedDuration: '4 weeks',
        imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop',
        status: 'published',
        tags: ['cleaning', 'industrial', 'certification'],
        courseContent: [
          { title: 'Safety Protocols', description: 'Learn basic safety', duration: '30 min' },
          { title: 'Equipment Handling', description: 'Equipment basics', duration: '45 min' }
        ],
        instructors: [{ name: 'Sarah Johnson', bio: 'ISSA Certified', role: 'Lead Instructor' }],
        learningOutcomes: [
          { outcome: 'Master industrial cleaning techniques' },
          { outcome: 'Understand safety protocols' }
        ],
        qualificationDetails: [],
        trainingRequirements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        enrollmentCount: 2453,
        instructor: 'Sarah Johnson',
        rating: 4.7,
        price: 99.99,
        participants: 2453
      } as Course,
      {
        id: 'fallback-2',
        title: 'Commercial Office Cleaning Standards',
        description: 'Learn professional office cleaning standards and techniques',
        category: 'Commercial Cleaning',
        difficulty: 'beginner',
        estimatedDuration: '3 weeks',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
        status: 'published',
        tags: ['office', 'commercial', 'standards'],
        courseContent: [
          { title: 'Office Environment Overview', description: 'Understanding office spaces', duration: '25 min' },
          { title: 'Cleaning Techniques', description: 'Effective cleaning methods', duration: '40 min' }
        ],
        instructors: [{ name: 'Mike Chen', bio: 'Commercial Cleaning Expert', role: 'Senior Instructor' }],
        learningOutcomes: [
          { outcome: 'Maintain professional office standards' },
          { outcome: 'Efficient cleaning workflows' }
        ],
        qualificationDetails: [],
        trainingRequirements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        enrollmentCount: 1847,
        instructor: 'Mike Chen',
        rating: 4.5,
        price: 79.99,
        participants: 1847
      } as Course
    ];
    
    console.log('📋 Fallback courses loaded:', this.recommendedCourses);
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