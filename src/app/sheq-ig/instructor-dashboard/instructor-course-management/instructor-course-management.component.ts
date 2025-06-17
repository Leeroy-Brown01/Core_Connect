import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instructor-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-course-management.component.html',
  styleUrl: './instructor-course-management.component.scss'
})
export class InstructorCourseManagementComponent {

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    // Removed FormBuilder and initializeForm call
  }


  // Province filter
  selectedProvince: string = 'All Provinces';

  // Existing properties
  approvedCourses: number = 12;
  coursesAwaitingApproval: number = 3;
  totalCourses: number = 50;

  // New metric properties
  publishedCoursesCount: number = 47;
  completedCoursesCount: number = 42;
  completionPercentage: number = 84;

  // Expanded data for sections
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

  accordionItems = [
    { id: 'new-course', title: 'Add New Course', isOpen: false },
    { id: 'submissions', title: `Instructor Submissions (${this.coursesAwaitingApproval} Pending)`, isOpen: false },
    { id: 'library', title: 'Course Library', isOpen: true },
    { id: 'recertification', title: 'Recertification Tracker', isOpen: false }
  ];

  tableColumns = [
    { key: 'title', label: 'Course Title' },
    { key: 'status', label: 'Status' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'modified', label: 'Last Modified' }
  ];

  filteredCourses = [
    { title: 'Safety Training', status: 'Published', instructor: 'John Doe', modified: new Date() },
    { title: 'HR Compliance', status: 'Draft', instructor: 'Jane Smith', modified: new Date() },
    // Add more dummy data
  ];

  currentSort = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  toggleAccordion(id: string) {
    this.accordionItems = this.accordionItems.map(item => ({
      ...item,
      isOpen: item.id === id ? !item.isOpen : false
    }));
  }
  
  // ... existing code ...

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

  ngOnInit() {
    this.calculateMetrics();
  }

  // Navigation to create user account
  navigateToCreateTraining() {
    this.router.navigate(['/create-training']);
  }

  private calculateMetrics() {
    // Calculate completion percentage
    this.completionPercentage = Math.round((this.completedCoursesCount / this.totalCourses) * 100);
    
    // Update published courses (total - pending approval)
    this.publishedCoursesCount = this.totalCourses - this.coursesAwaitingApproval;
  }

  // ... existing code ...

  openPreview(course: any) {
    // Implement preview modal
  }

}

