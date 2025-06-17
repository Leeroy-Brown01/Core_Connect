import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CourseService } from '../../../services/course.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.scss'
})
export class AdminOverviewComponent implements AfterViewInit, OnInit {
  adminName: string;
  today = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedPeriod: string = 'Monthly';
  selectedProvince = 'All Provinces';

  // User metrics - will be populated from service
  totalTrainers: number = 0;
  totalTrainees: number = 0;
  totalCourses: number = 0; // Will be updated when course service is integrated
  totalAssessments: number = 41; // Will be updated when assessment service is integrated

  // Loading states
  isLoadingUserMetrics: boolean = false;
  isLoadingCourseMetrics: boolean = false;

  upcomingExpiryAlerts = [
    { name: 'Safety Certification', expiryDate: new Date('2023-05-10'), urgency: 'High' },
    { name: 'First Aid Certification', expiryDate: new Date('2023-05-15'), urgency: 'Medium' },
    { name: 'Fire Safety Certification', expiryDate: new Date('2023-05-20'), urgency: 'Low' },
    { name: 'Equipment Handling Certification', expiryDate: new Date('2023-05-25'), urgency: 'High' },
    { name: 'Chemical Handling Certification', expiryDate: new Date('2023-05-30'), urgency: 'Medium' },
    { name: 'PPE Training Certification', expiryDate: new Date('2023-06-05'), urgency: 'Low' },
    { name: 'Evacuation Drills Certification', expiryDate: new Date('2023-06-10'), urgency: 'High' }
  ];

  courses = [
    { name: 'Safety Training', completed: 75, participants: 120, province: 'North West' },
    { name: 'Equipment Handling', completed: 60, participants: 90, province: 'North West' },
    { name: 'First Aid', completed: 85, participants: 150, province: 'North West' },
    { name: 'Fire Safety', completed: 45, participants: 80, province: 'North West' },
    { name: 'Chemical Handling', completed: 70, participants: 110, province: 'North West' },
    { name: 'PPE Training', completed: 95, participants: 200, province: 'North West' },
    { name: 'Evacuation Drills', completed: 55, participants: 75, province: 'North West' },
    { name: 'Risk Assessment', completed: 65, participants: 95, province: 'Gauteng' },
    { name: 'Manual Handling', completed: 80, participants: 130, province: 'Gauteng' },
    { name: 'Work at Height', completed: 50, participants: 60, province: 'Gauteng' },
    { name: 'Electrical Safety', completed: 90, participants: 180, province: 'Gauteng' },
    { name: 'Environmental Safety', completed: 40, participants: 50, province: 'Gauteng' }
  ];

  assessments = [
    { name: 'Safety Training Assessment', completionDate: new Date('2023-05-01'), status: 'Pass' },
    { name: 'Equipment Handling Assessment', completionDate: new Date('2023-05-02'), status: 'Average' },
    { name: 'First Aid Assessment', completionDate: new Date('2023-05-03'), status: 'Failed' },
    { name: 'Fire Safety Assessment', completionDate: new Date('2023-05-04'), status: 'Pass' },
    { name: 'Chemical Handling Assessment', completionDate: new Date('2023-05-05'), status: 'Average' },
    { name: 'PPE Training Assessment', completionDate: new Date('2023-05-06'), status: 'Failed' },
    { name: 'Evacuation Drills Assessment', completionDate: new Date('2023-05-07'), status: 'Pass' }
  ];

  recentActivities = [
    { type: 'user-plus', activity: 'New user registered', user: 'John D.', time: '2h ago', role: 'Admin' },
    { type: 'file-alt', activity: 'Report generated', user: 'Jane S.', time: '3h ago', role: 'Manager' },
    { type: 'exclamation-triangle', activity: 'System alert', user: 'System', time: '4h ago', role: 'System' },
    { type: 'user-times', activity: 'User account deactivated', user: 'Mike T.', time: '5h ago', role: 'Admin' }
  ];

  constructor(
    private userService: UserService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.updateEndDate();
    this.adminName = 'John Doe';
    this.selectedPeriod = 'Daily';
    this.loadUserMetrics();
    this.loadCourseMetrics();
  }

  // Load user metrics from service
  private loadUserMetrics() {
    this.isLoadingUserMetrics = true;
    
    this.userService.getAdminRoleMetrics().subscribe({
      next: (metrics) => {
        console.log('Received admin role metrics:', metrics);
        
        this.totalTrainers = metrics.totalTrainers;
        this.totalTrainees = metrics.totalTrainees;
        
        this.isLoadingUserMetrics = false;
        
        console.log('Component metrics after assignment:', {
          totalTrainers: this.totalTrainers,
          totalTrainees: this.totalTrainees
        });
        
        // Trigger counter animation after data is loaded
        setTimeout(() => {
          this.animateCounters();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading user metrics:', error);
        this.isLoadingUserMetrics = false;
        
        // Fallback to individual role counting if needed
        this.loadFallbackMetrics();
      }
    });
  }

  // Fallback method for individual role counting
  private loadFallbackMetrics() {
    console.log('Using fallback metrics calculation');
    
    // Get trainer count
    this.userService.getUserCountByRole('instructor').subscribe({
      next: (count) => {
        this.totalTrainers = count;
        console.log('Fallback trainer count:', count);
      },
      error: (error) => console.error('Error getting trainer count:', error)
    });
    
    // Get trainee count
    this.userService.getUserCountByRole('trainee').subscribe({
      next: (count) => {
        this.totalTrainees = count;
        console.log('Fallback trainee count:', count);
      },
      error: (error) => console.error('Error getting trainee count:', error)
    });
  }

  // Load course metrics from service
  private loadCourseMetrics() {
    this.isLoadingCourseMetrics = true;
    
    this.courseService.getCourseCount().subscribe({
      next: (count) => {
        console.log('Received course count from service:', count);
        
        this.totalCourses = count;
        this.isLoadingCourseMetrics = false;
        
        console.log('Component course metrics after assignment:', {
          totalCourses: this.totalCourses
        });
        
        // Trigger counter animation after data is loaded
        setTimeout(() => {
          this.animateCounters();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading course metrics:', error);
        this.isLoadingCourseMetrics = false;
        
        // Fallback: use simple course metrics
        this.loadFallbackCourseMetrics();
      }
    });
  }

  // Fallback method for course counting
  private loadFallbackCourseMetrics() {
    console.log('Using fallback course metrics calculation');
    
    this.courseService.getSimpleCourseMetrics().subscribe({
      next: (metrics) => {
        this.totalCourses = metrics.totalCourses;
        console.log('Fallback course metrics:', metrics);
      },
      error: (error) => console.error('Error getting fallback course metrics:', error)
    });
  }

  get filteredCourses() {
    if (this.selectedProvince === 'All Provinces') return this.courses;
    return this.courses.filter(course => 
      course.province === this.selectedProvince
    );
  }

  ngAfterViewInit(): void {
    // Initial animation will be triggered after data loads
  }

  private animateCounters() {
    const counters = document.querySelectorAll('.animate-count');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-count')!;
      const duration = 2000;
      const step = target / duration * 10;

      let current = 0;
      const updateCount = () => {
        if(current < target) {
          current += step;
          counter.textContent = Math.ceil(current).toString();
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target.toString();
        }
      }
      
      requestAnimationFrame(updateCount);
    });
  }

  updateDateRange(event: any) {
    this.startDate = new Date(event.target.value);
    this.updateEndDate();
  }

  updateEndDate() {
    const currentDate = new Date();

    switch(this.selectedPeriod) {
      case 'Daily':
        this.startDate = new Date(currentDate);
        this.startDate.setHours(0, 0, 0, 0);
        this.endDate = new Date(currentDate);
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case 'Weekly':
        this.endDate = new Date(currentDate);
        this.endDate.setHours(23, 59, 59, 999);
        this.startDate = new Date(currentDate);
        this.startDate.setDate(currentDate.getDate() - 6);
        this.startDate.setHours(0, 0, 0, 0);
        break;
      case 'Monthly':
        this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case 'Yearly':
        this.startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
    }
  }
}
