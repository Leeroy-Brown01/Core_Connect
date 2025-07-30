import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RecycledItem {
  id: number;
  senderName: string;
  subject: string;
  textContent: string;
  time: string;
  hasAttachment: boolean;
  deletedDate: string;
  originalFolder: string;
  daysUntilPermanentDelete: number;
}

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-recycle',
  imports: [CommonModule],
  templateUrl: './recycle.component.html',
  styleUrl: './recycle.component.scss'
})
export class RecycleComponent {
  selectedFilter: string = 'all';
  
  filterOptions: FilterOption[] = [
    { value: 'all', label: 'All Deleted' },
    { value: 'inbox', label: 'From Inbox' },
    { value: 'sent', label: 'From Sent' },
    { value: 'recent', label: 'Recently Deleted' },
    { value: 'expiring', label: 'Expiring Soon' }
  ];

  // Mobile filter categories (for the rounded pills) - Only Inbox and Sent
  mobileFilterCategories = [
    { id: 'inbox', label: 'Inbox', count: 8 },
    { id: 'sent', label: 'Sent', count: 4 }
  ];

  selectedMobileFilter = 'inbox';

  recycledItems: RecycledItem[] = [
    {
      id: 1,
      senderName: 'Leeroy Brown Nyandoro',
      subject: 'Meeting Notes - Weekly Standup',
      textContent: 'Here are the notes from our weekly standup meeting. Please review and let me know if I missed anything important.',
      time: '-- days ago',
      hasAttachment: false,
      deletedDate: '2024-01-20',
      originalFolder: 'inbox',
      daysUntilPermanentDelete: 27
    },
    // {
    //   id: 2,
    //   senderName: 'Support Team',
    //   subject: 'Ticket #12345 - Issue Resolved',
    //   textContent: 'Your support ticket has been resolved. The issue with the login system has been fixed and is now working properly.',
    //   time: '1 week ago',
    //   hasAttachment: true,
    //   deletedDate: '2024-01-16',
    //   originalFolder: 'inbox',
    //   daysUntilPermanentDelete: 23
    // },
    // {
    //   id: 3,
    //   senderName: 'Finance Department',
    //   subject: 'Expense Report Reminder',
    //   textContent: 'This is a reminder to submit your expense reports by the end of the month. Please include all receipts.',
    //   time: '2 weeks ago',
    //   hasAttachment: false,
    //   deletedDate: '2024-01-09',
    //   originalFolder: 'sent',
    //   daysUntilPermanentDelete: 16
    // }
  ];

  onFilterChange(filterValue: string): void {
    this.selectedFilter = filterValue;
  }

  onMobileFilterChange(filterId: string): void {
    this.selectedMobileFilter = filterId;
    console.log('Mobile filter changed to:', filterId);
  }

  trackByItemId(index: number, item: RecycledItem): number {
    return item.id;
  }

  restoreMessage(item: RecycledItem): void {
    console.log('Restoring message:', item);
    // Handle restore logic
  }

  permanentlyDelete(item: RecycledItem): void {
    console.log('Permanently deleting message:', item);
    // Handle permanent delete logic
  }

  emptyRecycleBin(): void {
    console.log('Emptying recycle bin');
    // Handle empty recycle bin logic
  }
}
