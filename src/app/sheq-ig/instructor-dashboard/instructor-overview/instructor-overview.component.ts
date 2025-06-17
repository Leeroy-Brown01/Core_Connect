import { CommonModule,  } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instructor-overview',
  standalone: true,
  imports: [CommonModule,FormsModule, ],
  templateUrl: './instructor-overview.component.html',
  styleUrl: './instructor-overview.component.scss'
})
export class InstructorOverviewComponent implements AfterViewInit, OnInit {
  adminName: string;
  today = new Date();
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedPeriod: string = 'Monthly';
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
  selectedProvince = 'All Provinces';

  

  ngOnInit(): void {
    // Initialize the adminName property
    this.updateEndDate();
    this.adminName = 'John Doe';
    this.selectedPeriod = 'Daily';
  }
  
  get filteredCourses() {
    if (this.selectedProvince === 'All Provinces') return this.courses;
    return this.courses.filter(course => 
      course.province === this.selectedProvince
    );
  }

  ngAfterViewInit(): void {
    this.animateCounters();
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
    this.updateEndDate(); // Now using the unified calculation method
  }

  updateEndDate() {
    const currentDate = new Date();

    switch(this.selectedPeriod) {
      case 'Daily':
        // Set to today 00:00 - 23:59
        this.startDate = new Date(currentDate);
        this.startDate.setHours(0, 0, 0, 0);
        this.endDate = new Date(currentDate);
        this.endDate.setHours(23, 59, 59, 999);
        break;
      case 'Weekly':
        // Last 7 days including today
        this.endDate = new Date(currentDate);
        this.endDate.setHours(23, 59, 59, 999);
        this.startDate = new Date(currentDate);
        this.startDate.setDate(currentDate.getDate() - 6);
        this.startDate.setHours(0, 0, 0, 0);
        break;
      case 'Monthly':
        // First to last day of current month
        this.startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case 'Yearly':
        // Full current year
        this.startDate = new Date(currentDate.getFullYear(), 0, 1);
        this.endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
  }
     
 }
}

