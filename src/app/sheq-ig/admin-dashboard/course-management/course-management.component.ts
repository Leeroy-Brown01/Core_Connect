import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService, Course } from '../../../services/course.service';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.scss'
})
export class CourseManagementComponent implements OnInit {

  // Province filter
  selectedProvince: string = 'All Provinces';

  // Course metrics - will be populated from service
  publishedCoursesCount: number = 0;
  coursesAwaitingApproval: number = 0;
  totalCourses: number = 0;
  completedCoursesCount: number = 0;
  completionPercentage: number = 0;

  // Loading states
  isLoadingCourses: boolean = false;
  isLoadingMetrics: boolean = false;

  // Course data - will be populated from service
  filteredCourses: any[] = [];
  allCourses: Course[] = [];

  // Hardcoded data (keeping as requested)
  instructorSubmissions = [
    { courseTitle: 'Advanced Safety Protocols', instructor: 'John Smith', submissionDate: new Date('2024-12-15'), status: 'Pending' },
    { courseTitle: 'Equipment Maintenance 101', instructor: 'Sarah Johnson', submissionDate: new Date('2024-12-14'), status: 'Approved' },
    { courseTitle: 'Emergency Response Training', instructor: 'Mike Wilson', submissionDate: new Date('2024-12-13'), status: 'Pending' },
    { courseTitle: 'Health & Safety Fundamentals', instructor: 'Emma Davis', submissionDate: new Date('2024-12-12'), status: 'Rejected' },
    { courseTitle: 'Risk Assessment Procedures', instructor: 'Tom Brown', submissionDate: new Date('2024-12-11'), status: 'Pending' },
    { courseTitle: 'Chemical Handling Guidelines', instructor: 'Lisa Garcia', submissionDate: new Date('2024-12-10'), status: 'Approved' },
    { courseTitle: 'Fire Safety & Prevention', instructor: 'David Lee', submissionDate: new Date('2024-12-09'), status: 'Pending' },
    { courseTitle: 'Workplace Ergonomics', instructor: 'Rachel Green', submissionDate: new Date('2024-12-08'), status: 'Approved' },
    { courseTitle: 'Hazardous Materials Training', instructor: 'James Carter', submissionDate: new Date('2024-12-07'), status: 'Pending' },
    { courseTitle: 'PPE Usage Guidelines', instructor: 'Maria Rodriguez', submissionDate: new Date('2024-12-06'), status: 'Approved' },
    { courseTitle: 'Machine Safety Standards', instructor: 'Robert Kim', submissionDate: new Date('2024-12-05'), status: 'Rejected' },
    { courseTitle: 'Environmental Compliance', instructor: 'Amy Zhang', submissionDate: new Date('2024-12-04'), status: 'Pending' },
    { courseTitle: 'Incident Reporting Procedures', instructor: 'Carlos Lopez', submissionDate: new Date('2024-12-03'), status: 'Approved' },
    { courseTitle: 'Lockout/Tagout Training', instructor: 'Jennifer White', submissionDate: new Date('2024-12-02'), status: 'Pending' }
  ];

  recentUpdates = [
    { title: 'System Maintenance', description: 'Scheduled maintenance on Dec 20th', updateDate: new Date('2024-12-15'), type: 'System' },
    { title: 'New Course Available', description: 'Digital Safety Training now live', updateDate: new Date('2024-12-14'), type: 'Course' },
    { title: 'Policy Update', description: 'Updated safety compliance requirements', updateDate: new Date('2024-12-13'), type: 'Policy' },
    { title: 'Course Retired', description: 'Old machinery training removed', updateDate: new Date('2024-12-12'), type: 'Course' },
    { title: 'System Enhancement', description: 'Improved user interface features', updateDate: new Date('2024-12-11'), type: 'System' },
    { title: 'New Certification', description: 'ISO 45001 certification added', updateDate: new Date('2024-12-10'), type: 'Policy' },
    { title: 'Database Backup', description: 'Weekly database backup completed', updateDate: new Date('2024-12-09'), type: 'System' },
    { title: 'Training Module Update', description: 'Updated emergency response protocols', updateDate: new Date('2024-12-08'), type: 'Course' },
    { title: 'Security Patch', description: 'Applied latest security updates', updateDate: new Date('2024-12-07'), type: 'System' },
    { title: 'Compliance Review', description: 'Annual compliance review completed', updateDate: new Date('2024-12-06'), type: 'Policy' },
    { title: 'Course Content Refresh', description: 'Updated safety video library', updateDate: new Date('2024-12-05'), type: 'Course' },
    { title: 'User Access Update', description: 'Enhanced role-based permissions', updateDate: new Date('2024-12-04'), type: 'System' },
    { title: 'Regulatory Change', description: 'New OSHA guidelines implemented', updateDate: new Date('2024-12-03'), type: 'Policy' },
    { title: 'Mobile App Update', description: 'Released training app v2.1', updateDate: new Date('2024-12-02'), type: 'System' }
  ];

  // Updated table configuration to use category instead of status
  tableColumns = [
    { key: 'title', label: 'Course Title' },
    { key: 'category', label: 'Category' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'modified', label: 'Last Modified' }
  ];

  // Sorting properties
  currentSort = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCourseData();
    this.loadCourseMetrics();
  }

  // Load course data from service
  private loadCourseData() {
    this.isLoadingCourses = true;
    
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('Raw courses data received:', courses);
        this.allCourses = courses;
        this.filteredCourses = this.transformCoursesForTable(courses);
        this.isLoadingCourses = false;
        console.log('Courses loaded successfully:', courses.length);
        
        // If metrics failed to load, try calculating from here
        if (this.totalCourses === 0 && courses.length > 0) {
          console.log('Metrics seem empty, calculating from course data...');
          this.calculateFallbackMetrics(courses);
        }
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoadingCourses = false;
      }
    });
  }

  // Load course metrics from service - simplified approach like user management
  private loadCourseMetrics() {
    this.isLoadingMetrics = true;
    
    this.courseService.getSimpleCourseMetrics().subscribe({
      next: (metrics) => {
        console.log('Received simple course metrics from service:', metrics);
        
        this.totalCourses = metrics.totalCourses;
        this.publishedCoursesCount = metrics.publishedCourses;
        this.coursesAwaitingApproval = metrics.coursesAwaitingApproval;
        this.completedCoursesCount = metrics.completedCourses;
        this.calculateCompletionMetrics();
        this.isLoadingMetrics = false;
        
        console.log('Component course metrics after assignment:', {
          totalCourses: this.totalCourses,
          publishedCoursesCount: this.publishedCoursesCount,
          coursesAwaitingApproval: this.coursesAwaitingApproval,
          completedCoursesCount: this.completedCoursesCount
        });
      },
      error: (error) => {
        console.error('Error loading course metrics:', error);
        this.isLoadingMetrics = false;
        
        // Fallback: try individual counting methods
        this.loadFallbackMetrics();
      }
    });
  }

  // Fallback method for individual course counting
  private loadFallbackMetrics() {
    console.log('Using fallback course metrics calculation');
    
    // Get total course count
    this.courseService.getCourseCount().subscribe({
      next: (count) => {
        this.totalCourses = count;
        console.log('Fallback total course count:', count);
      },
      error: (error) => console.error('Error getting total course count:', error)
    });
    
    // Get published course count
    this.courseService.getPublishedCourseCount().subscribe({
      next: (count) => {
        this.publishedCoursesCount = count;
        console.log('Fallback published course count:', count);
      },
      error: (error) => console.error('Error getting published course count:', error)
    });
    
    // Get draft course count
    this.courseService.getDraftCourseCount().subscribe({
      next: (count) => {
        this.coursesAwaitingApproval = count;
        console.log('Fallback draft course count:', count);
      },
      error: (error) => console.error('Error getting draft course count:', error)
    });
  }

  // Transform course data for table display - fix instructor display
  private transformCoursesForTable(courses: Course[]): any[] {
    return courses.map(course => ({
      title: course.title || 'N/A',
      category: this.formatCourseCategory(course.category) || 'N/A',
      instructor: this.extractInstructorName(course),
      modified: course.updatedAt ? new Date(course.updatedAt) : course.createdAt ? new Date(course.createdAt) : new Date(),
      status: course.status || 'Draft' // Keep for internal use
    }));
  }

  // Extract instructor name from various possible sources
  private extractInstructorName(course: Course): string {
    // Check if instructors array exists and has data
    if (course.instructors && course.instructors.length > 0) {
      return course.instructors[0].name;
    }
    
    // Check for direct instructor name field
    if (course.instructorName) {
      return course.instructorName;
    }
    
    // Check for instructor field
    if (course.instructor) {
      return course.instructor;
    }
    
    // Check for createdBy field (might contain name or ID)
    if (course.createdBy) {
      // If createdBy looks like a name (contains spaces), use it
      if (course.createdBy.includes(' ')) {
        return course.createdBy;
      }
      // Otherwise it's probably an ID, return a placeholder
      return 'Instructor';
    }
    
    return 'N/A';
  }

  // Format course category for display
  private formatCourseCategory(category: string): string {
    if (!category) return 'N/A';
    
    const categoryMap: { [key: string]: string } = {
      'safety': 'Safety Training',
      'health': 'Health & Wellness',
      'compliance': 'Compliance',
      'technical': 'Technical Skills',
      'soft-skills': 'Soft Skills',
      'leadership': 'Leadership',
      'emergency': 'Emergency Response',
      'equipment': 'Equipment Training',
      'environmental': 'Environmental Safety'
    };
    
    const normalizedCategory = category.toLowerCase();
    return categoryMap[normalizedCategory] || this.capitalizeFirstLetter(category);
  }

  // Helper method to capitalize first letter
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  // Calculate fallback metrics from course data
  private calculateFallbackMetrics(courses: Course[]) {
    this.totalCourses = courses.length;
    this.publishedCoursesCount = courses.filter(c => 
      c.status?.toLowerCase() === 'published' || c.published === true
    ).length;
    this.coursesAwaitingApproval = courses.filter(c => 
      c.status?.toLowerCase() === 'pending' || c.status?.toLowerCase() === 'draft'
    ).length;
    this.completedCoursesCount = courses.filter(c => 
      c.status?.toLowerCase() === 'completed'
    ).length;
    this.calculateCompletionMetrics();
  }

  private calculateCompletionMetrics() {
    // Calculate completion percentage
    this.completionPercentage = this.totalCourses > 0 ? 
      Math.round((this.completedCoursesCount / this.totalCourses) * 100) : 0;
  }

  // Course table sorting
  sortTable(key: string) {
    if (this.currentSort === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = key;
      this.sortDirection = 'asc';
    }

    this.filteredCourses.sort((a, b) => {
      const aValue = a[key as keyof typeof a];
      const bValue = b[key as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return this.sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
  }

  // Navigation to create training
  navigateToCreateTraining() {
    this.router.navigate(['/create-training']);
  }

  // Course management methods
  openPreview(course: any) {
    console.log('Opening course preview:', course);
    // Implement preview modal or navigation
  }
}
