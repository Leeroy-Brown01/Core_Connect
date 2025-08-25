
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface representing a single archived message item
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

// Interface for filter options in the UI
interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-archived', // Selector for this component
  imports: [CommonModule], // Import CommonModule for ngIf, ngFor, etc.
  templateUrl: './archived.component.html', // HTML template file
  styleUrl: './archived.component.scss' // SCSS style file
})
export class ArchivedComponent {
  selectedFilter: string = 'all'; // Currently selected filter for desktop
  
  // List of filter options for desktop view
  filterOptions: FilterOption[] = [
    { value: 'all', label: 'All Archived' },
    { value: 'inbox', label: 'From Inbox' },
    { value: 'sent', label: 'From Sent' },
    { value: 'recent', label: 'Recently Archived' },
    { value: 'attachments', label: 'With Attachments' }
  ];

  // Mobile filter categories (for the rounded pills UI)
  mobileFilterCategories = [
    { id: 'all', label: 'All', count: 15 },
    { id: 'unread', label: 'Unread', count: 4 },
    { id: 'documents', label: 'Documents', count: 7 }
  ];

  selectedMobileFilter = 'all'; // Currently selected filter for mobile

  // List of archived message items (mock data)
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

  // Handler for changing the desktop filter
  onFilterChange(filterValue: string): void {
    this.selectedFilter = filterValue;
  }

  // Handler for changing the mobile filter
  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    console.log('Mobile filter changed to:', filterId);
  }

  // TrackBy function for ngFor to optimize rendering
  trackByItemId(index: number, item: ArchivedItem): number {
    return item.id;
  }

  // Restore a message from the archive
  restoreMessage(item: ArchivedItem): void {
    console.log('Restoring message:', item);
    // Handle restore logic here
  }

  // Permanently delete a message from the archive
  permanentlyDelete(item: ArchivedItem): void {
    console.log('Permanently deleting message:', item);
    // Handle permanent delete logic here
  }
}
