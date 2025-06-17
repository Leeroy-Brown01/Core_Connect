import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ArchivedItem {
  id: number;
  senderName: string;
  subject: string;
  textContent: string;
  time: string;
  hasAttachment: boolean;
  archivedDate: string;
  originalFolder: string;
}

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-archived',
  imports: [CommonModule],
  templateUrl: './archived.component.html',
  styleUrl: './archived.component.scss'
})
export class ArchivedComponent {
  selectedFilter: string = 'all';
  
  filterOptions: FilterOption[] = [
    { value: 'all', label: 'All Archived' },
    { value: 'inbox', label: 'From Inbox' },
    { value: 'sent', label: 'From Sent' },
    { value: 'recent', label: 'Recently Archived' },
    { value: 'attachments', label: 'With Attachments' }
  ];

  // Mobile filter categories (for the rounded pills)
  mobileFilterCategories = [
    { id: 'all', label: 'All', count: 15 },
    { id: 'unread', label: 'Unread', count: 4 },
    { id: 'documents', label: 'Documents', count: 7 }
  ];

  selectedMobileFilter = 'all';

  archivedItems: ArchivedItem[] = [
    {
      id: 1,
      senderName: 'John Smith',
      subject: 'Project Update - Q4 Report',
      textContent: 'Please find the attached Q4 report for your review. The numbers look promising and we are on track to meet our targets.',
      time: '2 weeks ago',
      hasAttachment: true,
      archivedDate: '2024-01-15',
      originalFolder: 'inbox'
    },
    {
      id: 2,
      senderName: 'Marketing Team',
      subject: 'Campaign Results Summary',
      textContent: 'The recent marketing campaign has concluded with excellent results. Here is a detailed breakdown of the performance metrics.',
      time: '3 weeks ago',
      hasAttachment: false,
      archivedDate: '2024-01-08',
      originalFolder: 'inbox'
    },
    {
      id: 3,
      senderName: 'HR Department',
      subject: 'Policy Update Notification',
      textContent: 'We have updated our remote work policy. Please review the changes and acknowledge receipt by the end of this week.',
      time: '1 month ago',
      hasAttachment: true,
      archivedDate: '2024-01-01',
      originalFolder: 'sent'
    }
  ];

  onFilterChange(filterValue: string): void {
    this.selectedFilter = filterValue;
  }

  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    console.log('Mobile filter changed to:', filterId);
  }

  trackByItemId(index: number, item: ArchivedItem): number {
    return item.id;
  }

  restoreMessage(item: ArchivedItem): void {
    console.log('Restoring message:', item);
    // Handle restore logic
  }

  permanentlyDelete(item: ArchivedItem): void {
    console.log('Permanently deleting message:', item);
    // Handle permanent delete logic
  }
}
