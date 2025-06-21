import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICDDownloadsService, ICDDownloadItem } from '../../services/icd-downloads.service';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-icd-downloads',
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-downloads.component.html',
  styleUrl: './icd-downloads.component.scss'
})
export class IcdDownloadsComponent implements OnInit {
  downloads: ICDDownloadItem[] = [];
  filteredDownloads: ICDDownloadItem[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';
  selectedFilter: string = 'all';
  currentUser: any = null;

  filterOptions = [
    { value: 'all', label: 'All Downloads' },
    { value: 'pdf', label: 'PDF Files' },
    { value: 'word', label: 'Word Documents' },
    { value: 'excel', label: 'Excel Files' },
    { value: 'image', label: 'Images' },
    { value: 'other', label: 'Other Files' }
  ];

  constructor(
    private icdDownloadsService: ICDDownloadsService,
    private icdAuthService: ICDAuthService,
    private toastService: ToastService,
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('🔄 Initializing ICD Downloads component...');
    
    // Wait for auth initialization
    await this.icdAuthService.waitForAuthInitialization();
    this.currentUser = this.icdAuthService.getCurrentUser();
    
    if (this.currentUser?.email) {
      await this.loadUserDownloads();
    } else {
      console.warn('⚠️ No authenticated user found');
      this.isLoading = false;
    }
  }

  private async loadUserDownloads(): Promise<void> {
    try {
      this.isLoading = true;
      console.log('📥 Loading downloads for user:', this.currentUser.email);
      
      // Use userId instead of email for better consistency
      const userId = this.currentUser.uid || this.currentUser.email;
      
      this.icdDownloadsService.getUserDownloads(userId).subscribe({
        next: (downloads) => {
          this.downloads = downloads;
          this.applyFilters();
          this.isLoading = false;
          console.log('✅ Downloads loaded successfully:', downloads.length);
        },
        error: (error) => {
          console.error('❌ Error loading downloads:', error);
          this.toastService.error('Failed to load downloads');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('❌ Error in loadUserDownloads:', error);
      this.isLoading = false;
    }
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.downloads];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(download =>
        download.fileName.toLowerCase().includes(query) ||
        download.subject.toLowerCase().includes(query) ||
        download.senderName.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(download => {
        const fileType = download.fileType.toLowerCase();
        switch (this.selectedFilter) {
          case 'pdf':
            return fileType.includes('pdf');
          case 'word':
            return fileType.includes('word') || fileType.includes('document');
          case 'excel':
            return fileType.includes('sheet') || fileType.includes('excel');
          case 'image':
            return fileType.includes('image');
          case 'other':
            return !fileType.includes('pdf') && 
                   !fileType.includes('word') && 
                   !fileType.includes('document') &&
                   !fileType.includes('sheet') && 
                   !fileType.includes('excel') &&
                   !fileType.includes('image');
          default:
            return true;
        }
      });
    }

    this.filteredDownloads = filtered;
  }

  async onDownloadFile(download: ICDDownloadItem): Promise<void> {
    try {
      console.log('📥 Downloading file with logging:', download.fileName);
      
      if (!this.currentUser?.uid && !this.currentUser?.email) {
        this.toastService.error('User not authenticated');
        return;
      }

      const userId = this.currentUser.uid || this.currentUser.email;
      
      // Use the new downloadFileAndLog method
      await this.icdDownloadsService.downloadFileAndLog(userId, download);
      
      this.toastService.success(`Downloaded: ${download.fileName}`);
      console.log('✅ File downloaded and logged successfully');
      
      // Refresh downloads to show the new log entry
      setTimeout(() => {
        this.loadUserDownloads();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      this.toastService.error('Failed to download file');
    }
  }

  trackByDownloadId(index: number, item: ICDDownloadItem): string {
    return item.id;
  }

  formatFileSize(bytes: number): string {
    return this.icdDownloadsService.formatFileSize(bytes);
  }

  getFileIcon(fileType: string): string {
    return this.icdDownloadsService.getFileIcon(fileType);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getFileTypeClass(fileType: string): string {
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'file-word';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'file-excel';
    if (fileType.includes('image')) return 'file-image';
    return 'file-other';
  }

  getFileTypeBadge(fileType: string): string {
    const extension = fileType.split('/')[1];
    if (extension) {
      return extension.toUpperCase();
    }
    
    // Fallback based on MIME type
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'DOCX';
    if (fileType.includes('document')) return 'DOC';
    if (fileType.includes('sheet')) return 'XLSX';
    if (fileType.includes('excel')) return 'XLS';
    if (fileType.includes('image')) return 'IMG';
    return 'FILE';
  }

  getCategoryClass(category: string): string {
    const categoryLower = category.toLowerCase();
    switch (categoryLower) {
      case 'reports': return 'category-reports';
      case 'training': return 'category-training';
      case 'policies': return 'category-policies';
      case 'sent messages': return 'category-messages';
      case 'general': return 'category-general';
      default: return 'category-default';
    }
  }
}
