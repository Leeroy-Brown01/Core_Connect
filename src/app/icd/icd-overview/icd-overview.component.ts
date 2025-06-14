import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Department {
  id: string;
  name: string;
  users: number;
  status: 'active' | 'inactive';
  lastActivity: Date;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  type: 'document' | 'user' | 'department' | 'system';
}

@Component({
  selector: 'app-icd-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-overview.component.html',
  styleUrl: './icd-overview.component.scss'
})
export class IcdOverviewComponent {
  selectedFilter: string = 'all';

  // Accordion state for mobile
  isDepartmentsExpanded: boolean = false;
  isActivityLogExpanded: boolean = false;

  filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  stats = [
    { 
      title: 'Total Users', 
      value: 156, 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    { 
      title: 'Active Departments', 
      value: 12, 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    { 
      title: 'Inbox', 
      value: 23, 
      icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0L12 13 4 13'
    },
    { 
      title: 'Sent', 
      value: 156, 
      icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
    }
  ];

  activeDepartments: Department[] = [
    {
      id: '1',
      name: 'Human Resources',
      users: 12,
      status: 'active',
      lastActivity: new Date(2024, 11, 15, 14, 30)
    },
    {
      id: '2',
      name: 'Finance',
      users: 18,
      status: 'active',
      lastActivity: new Date(2024, 11, 15, 13, 45)
    },
    {
      id: '3',
      name: 'IT Department',
      users: 24,
      status: 'active',
      lastActivity: new Date(2024, 11, 15, 12, 15)
    },
    {
      id: '4',
      name: 'Legal',
      users: 8,
      status: 'active',
      lastActivity: new Date(2024, 11, 15, 11, 30)
    },
    {
      id: '5',
      name: 'Operations',
      users: 35,
      status: 'active',
      lastActivity: new Date(2024, 11, 15, 10, 45)
    }
  ];

  activityLogs: ActivityLog[] = [
    {
      id: '1',
      user: 'John Smith',
      action: 'uploaded',
      target: 'Budget Report Q4',
      timestamp: new Date(2024, 11, 15, 14, 30),
      type: 'document'
    },
    {
      id: '2',
      user: 'Sarah Johnson',
      action: 'approved',
      target: 'User Access Request',
      timestamp: new Date(2024, 11, 15, 14, 15),
      type: 'user'
    },
    {
      id: '3',
      user: 'Michael Chen',
      action: 'created',
      target: 'IT Security Policy',
      timestamp: new Date(2024, 11, 15, 13, 45),
      type: 'document'
    },
    {
      id: '4',
      user: 'Emma Wilson',
      action: 'updated',
      target: 'Legal Department',
      timestamp: new Date(2024, 11, 15, 13, 30),
      type: 'department'
    },
    {
      id: '5',
      user: 'System',
      action: 'generated',
      target: 'Monthly Report',
      timestamp: new Date(2024, 11, 15, 12, 0o0),
      type: 'system'
    }
  ];

  onFilterChange(): void {
    console.log('Filter changed to:', this.selectedFilter);
  }

  toggleDepartments(): void {
    this.isDepartmentsExpanded = !this.isDepartmentsExpanded;
  }

  toggleActivityLog(): void {
    this.isActivityLogExpanded = !this.isActivityLogExpanded;
  }
}
