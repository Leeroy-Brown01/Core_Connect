import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Document {
  id: string;
  title: string;
  department: string;
  size: string;
  uploadedBy: string;
  uploadedDate: Date;
}

@Component({
  selector: 'app-icd-document-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-document-management.component.html',
  styleUrl: './icd-document-management.component.scss'
})
export class IcdDocumentManagementComponent {
  searchQuery: string = '';
  sortBy: string = 'title';

  documents: Document[] = [
    {
      id: '1',
      title: 'Budget Report Q4 2024',
      department: 'Finance',
      size: '2.5 MB',
      uploadedBy: 'John Smith',
      uploadedDate: new Date(2024, 11, 15)
    },
    {
      id: '2',
      title: 'IT Security Policy',
      department: 'IT Department',
      size: '1.8 MB',
      uploadedBy: 'Sarah Johnson',
      uploadedDate: new Date(2024, 11, 14)
    },
    {
      id: '3',
      title: 'Employee Handbook',
      department: 'Human Resources',
      size: '5.2 MB',
      uploadedBy: 'Michael Chen',
      uploadedDate: new Date(2024, 11, 13)
    },
    {
      id: '4',
      title: 'Legal Compliance Guide',
      department: 'Legal',
      size: '3.1 MB',
      uploadedBy: 'Emma Wilson',
      uploadedDate: new Date(2024, 11, 12)
    },
    {
      id: '5',
      title: 'Operations Manual',
      department: 'Operations',
      size: '4.7 MB',
      uploadedBy: 'David Brown',
      uploadedDate: new Date(2024, 11, 11)
    },
    {
      id: '6',
      title: 'Marketing Strategy 2025',
      department: 'Marketing',
      size: '2.9 MB',
      uploadedBy: 'Lisa Davis',
      uploadedDate: new Date(2024, 11, 10)
    }
  ];

  filteredDocuments: Document[] = [];

  ngOnInit(): void {
    this.filterDocuments();
  }

  filterDocuments(): void {
    let filtered = [...this.documents];
    
    if (this.searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'department': return a.department.localeCompare(b.department);
        case 'uploadedBy': return a.uploadedBy.localeCompare(b.uploadedBy);
        case 'uploadedDate': return b.uploadedDate.getTime() - a.uploadedDate.getTime();
        default: return 0;
      }
    });
    
    this.filteredDocuments = filtered;
  }

  onSearchChange(): void { this.filterDocuments(); }
  onSortChange(): void { this.filterDocuments(); }

  // Document actions
  editDocument(docId: string): void {
    console.log('Edit document:', docId);
  }

  viewDocument(docId: string): void {
    console.log('View document:', docId);
  }

  

  deleteDocument(docId: string): void {
    console.log('Delete document:', docId);
  }

  downloadDocument(docId: string): void {
    console.log('Download document:', docId);
  }
}
