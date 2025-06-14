import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ArchivedComponent } from '../archived/archived.component';
import { SentComponent } from '../sent/sent.component';
import { RecycleComponent } from '../recycle/recycle.component';
import { IcdUserManagementComponent } from '../icd-user-management/icd-user-management.component';

interface InboxItem {
  id: number;
  senderName: string;
  subject: string;
  textContent: string;
  time: string;
  hasAttachment: boolean;
  isRead: boolean;
}

@Component({
  selector: 'app-inbox',
  imports: [CommonModule, ArchivedComponent, SentComponent,RecycleComponent , IcdUserManagementComponent],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.scss'
})
export class InboxComponent {

  // User information
  currentUser = {
    firstName: 'John',
    lastName: 'Doe',
    role: 'Medical Administrator'
  };

  // Tab management
  activeTab: string = 'inbox';

  tabs = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'sent', label: 'Sent' },
    { id: 'icd-user-management', label: 'Users' },
    { id: 'archived', label: 'Archived' },
    { id: 'recycled', label: 'Recycled' }
  ];

  // Filter options
  selectedFilter = 'all';
  filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'documents', label: 'Documents' },
    { value: 'messages', label: 'Messages' }
  ];

  // Mobile filter categories (for the rounded pills)
  mobileFilterCategories = [
    { id: 'all', label: 'All', count: 12 },
    { id: 'unread', label: 'Unread', count: 3 },
    { id: 'documents', label: 'Documents', count: 5 }
  ];

  selectedMobileFilter = 'all';

  inboxItems: InboxItem[] = [
    {
      id: 1,
      senderName: 'Dr. Sarah Johnson',
      subject: 'Patient Consultation Report - Case #12345',
      textContent: 'Please find attached the comprehensive consultation report for patient John Doe. The diagnosis indicates acute bronchitis with recommended treatment plan...',
      time: '10:30 AM',
      hasAttachment: true,
      isRead: false
    },
    {
      id: 2,
      senderName: 'Medical Records Dept',
      subject: 'Updated ICD-10 Codes Available',
      textContent: 'New ICD-10 codes have been released for Q2 2024. Please review the updated classification system and ensure all documentation is compliant...',
      time: '9:15 AM',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 3,
      senderName: 'Dr. Michael Chen',
      subject: 'Lab Results - Urgent Review Required',
      textContent: 'Critical lab results require immediate attention. Patient shows elevated white blood cell count and requires follow-up examination...',
      time: 'Yesterday',
      hasAttachment: true,
      isRead: false
    },
    {
      id: 4,
      senderName: 'Admin Office',
      subject: 'System Maintenance Scheduled',
      textContent: 'The ICD system will undergo routine maintenance this weekend from 2:00 AM to 6:00 AM. Please plan accordingly and save all work...',
      time: 'Yesterday',
      hasAttachment: false,
      isRead: true
    },
    {
      id: 5,
      senderName: 'Dr. Emily Davis',
      subject: 'Patient Transfer Documentation',
      textContent: 'Patient transfer from ICU to general ward has been completed. All necessary documentation and care instructions are attached for review...',
      time: '2 days ago',
      hasAttachment: true,
      isRead: false
    }
  ];

  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    // Implement filter logic here
    console.log('Filter changed to:', filter);
  }

  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    console.log('Mobile filter changed to:', filterId);
  }

  trackByItemId(index: number, item: InboxItem): number {
    return item.id;
  }
}
