import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstructorOverviewComponent } from "./instructor-overview/instructor-overview.component";
import { InstructorCourseManagementComponent } from "./instructor-course-management/instructor-course-management.component";

@Component({
  selector: 'app-instructor-dashboard',
  imports: [CommonModule, FormsModule, InstructorOverviewComponent, InstructorCourseManagementComponent],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss'
})
export class InstructorDashboardComponent {
  activeTab: string = 'overview';

  @Input() instructor = {
    name: 'Sarah Johnson',
    jobTitle: 'Safety Training Instructor',
    staffId: 'INS-0123',
    workSite: 'Training Center',
    status: 'Active',
    hireDate: new Date('2021-03-10'),
    contractType: 'Full-Time',
    permissions: ['Course Creation', 'Student Assessment', 'Training Materials', 'Progress Tracking']
  };
}
