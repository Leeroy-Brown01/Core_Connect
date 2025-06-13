import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SentItem {
  id: number;
  recipientName: string;
  subject: string;
  textContent: string;
  time: string;
  hasAttachment: boolean;
  status: 'delivered' | 'pending' | 'failed';
}

@Component({
  selector: 'app-sent',
  imports: [CommonModule],
  templateUrl: './sent.component.html',
  styleUrl: './sent.component.scss'
})
export class SentComponent {

  // Filter options
  selectedFilter = 'all';
  filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'recent', label: 'Recent' }
  ];

  sentItems: SentItem[] = [
    {
      id: 1,
      recipientName: 'Dr. Robert Wilson',
      subject: 'Discharge Summary - Patient #67890',
      textContent: 'Please find the complete discharge summary for patient Maria Rodriguez. All post-operative care instructions and follow-up appointments are included...',
      time: '2:45 PM',
      hasAttachment: true,
      status: 'delivered'
    },
    {
      id: 2,
      recipientName: 'Nursing Staff',
      subject: 'Updated Medication Schedule',
      textContent: 'The medication schedule for Ward B has been updated. Please ensure all staff members are aware of the new dosage timings for critical patients...',
      time: '1:20 PM',
      hasAttachment: false,
      status: 'delivered'
    },
    {
      id: 3,
      recipientName: 'Dr. Amanda Foster',
      subject: 'Urgent: Lab Results Review',
      textContent: 'Abnormal lab results detected for patient in Room 205. Immediate review and consultation required for treatment plan adjustment...',
      time: '11:30 AM',
      hasAttachment: true,
      status: 'pending'
    },
    {
      id: 4,
      recipientName: 'Medical Director',
      subject: 'Monthly ICD Compliance Report',
      textContent: 'Monthly compliance report shows 98% accuracy in ICD-10 coding. Two minor discrepancies identified and corrected. Full report attached...',
      time: 'Yesterday',
      hasAttachment: true,
      status: 'delivered'
    },
    {
      id: 5,
      recipientName: 'IT Support',
      subject: 'System Access Issue',
      textContent: 'Unable to access patient records module since this morning. Error code 500 appears when attempting to load patient database...',
      time: 'Yesterday',
      hasAttachment: false,
      status: 'failed'
    }
  ];

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    // Implement filter logic here
    console.log('Filter changed to:', filter);
  }

  trackByItemId(index: number, item: SentItem): number {
    return item.id;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'delivered': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '';
    }
  }
}
