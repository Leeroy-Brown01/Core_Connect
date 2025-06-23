import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DocumentService, FirebaseDocument } from '../../services/document.service';
import { ICDAuthService } from '../../services/icd-auth.service';

interface Document {
  id: string;
  title: string;
  department: string;
  size: string;
  uploadedBy: string;
  uploadedDate: Date;
}

interface NewDocumentForm {
  name: string;
  description: string;
  department: string;
  file: File | null;
}

@Component({
  selector: 'app-icd-document-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-document-management.component.html',
  styleUrl: './icd-document-management.component.scss'
})
export class IcdDocumentManagementComponent implements OnInit {
  searchQuery: string = '';
  sortBy: string = 'title';
  showUploadModal = false;
  isUploadingDocument = false;
  isLoadingDocuments = false;

  // Available departments
  departments = [
    'Human Resources',
    'Finance',
    'Information Technology',
    'Operations',
    'Marketing',
    'Legal',
    'Administration',
    'Communications',
    'Engineering',
    'Sales',
    'Customer Service',
    'Other'
  ];

  newDocumentForm: NewDocumentForm = {
    name: '',
    description: '',
    department: '',
    file: null
  };

  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  firebaseDocuments: FirebaseDocument[] = []; // Store original Firebase documents
  currentUser: any;
  canUpload: boolean = false;
  canDelete: boolean = false;

  constructor(
    private documentService: DocumentService,
    private icdAuthService: ICDAuthService,
    
  ) {}

  // Add these simple role checker methods
  isAdmin(): boolean {
    const user = this.icdAuthService.getCurrentUser();
    return user?.role?.toLowerCase() === 'admin';
  }

  isUser(): boolean {
    const user = this.icdAuthService.getCurrentUser();
    return user?.role?.toLowerCase() === 'user';
  }

  isViewer(): boolean {
    const user = this.icdAuthService.getCurrentUser();
    return user?.role?.toLowerCase() === 'viewer';
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.icdAuthService.getCurrentUser();
    const userRole = user?.role?.toLowerCase();
    return roles.some(role => role.toLowerCase() === userRole);
  }

  async ngOnInit(): Promise<void> {
    console.log('🔄 Initializing ICD Document Management component...');
    
    // Wait for auth initialization using ICDAuthService
    await this.icdAuthService.waitForAuthInitialization();
    this.currentUser = this.icdAuthService.getCurrentUser();
    this.checkUserPermissions();

    await this.loadDocuments();
  }

  async loadDocuments(): Promise<void> {
    this.isLoadingDocuments = true;
    try {
      this.firebaseDocuments = await this.documentService.getDocuments();
      
      // Convert Firebase documents to local format
      this.documents = this.firebaseDocuments.map(doc => ({
        id: doc.id || '',
        title: doc.name,
        department: doc.department,
        size: this.documentService.formatFileSize(doc.fileSize),
        uploadedBy: doc.uploadedBy,
        uploadedDate: doc.uploadedAt instanceof Date ? doc.uploadedAt : new Date(doc.uploadedAt)
      }));

      this.filterDocuments();
      console.log(`📄 Loaded ${this.documents.length} documents from Firebase`);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      this.isLoadingDocuments = false;
    }
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
    const firebaseDoc = this.firebaseDocuments.find(doc => doc.id === docId);
    if (firebaseDoc) {
      this.documentService.viewDocument(firebaseDoc);
    } else {
      console.error('Document not found for viewing');
    }
  }

  async deleteDocument(docId: string): Promise<void> {
    const doc = this.documents.find(d => d.id === docId);
    if (doc && confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      try {
        const success = await this.documentService.deleteDocument(docId);
        if (success) {
          console.log('✅ Document deleted successfully');
          await this.loadDocuments(); // Reload documents
          alert('Document deleted successfully!');
        } else {
          alert('Failed to delete document');
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
      }
    }
  }

  downloadDocument(docId: string): void {
    const firebaseDoc = this.firebaseDocuments.find(doc => doc.id === docId);
    if (firebaseDoc) {
      console.log('FirebaseDocument being passed to download service:', JSON.stringify(firebaseDoc, null, 2));
      this.documentService.downloadDocument(firebaseDoc);
    } else {
      console.error('Document not found for download');
    }
  }

  // Modal methods
  openUploadModal(): void {
    this.showUploadModal = true;
    this.resetForm();
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.resetForm();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newDocumentForm.file = file;
      // Auto-fill name if not already filled
      if (!this.newDocumentForm.name) {
        this.newDocumentForm.name = file.name.split('.')[0];
      }
    }
  }

  async onSubmitDocument(form: NgForm): Promise<void> {
    if (form.invalid || !this.newDocumentForm.file) {
      console.log('Form is invalid or no file selected');
      this.markFormGroupTouched(form);
      return;
    }

    this.isUploadingDocument = true;
    
    try {
      console.log('📄 Uploading document to Firebase:', this.newDocumentForm.name);
      
      // Get current user info
      const userName = this.currentUser?.fullName || 'Unknown User';
      
      // Upload to Firebase
      const result = await this.documentService.uploadDocument(
        this.newDocumentForm.file!,
        {
          name: this.newDocumentForm.name,
          description: this.newDocumentForm.description,
          department: this.newDocumentForm.department,
          uploadedBy: userName,
          createdBy: userName
        }
      );
      
      if (result.success) {
        console.log('✅ Document uploaded successfully to Firebase');
        
        // Reload documents from Firebase
        await this.loadDocuments();
        
        // Close modal and reset form
        this.closeUploadModal();
        
        // Show success message (you can add toast notification here)
        alert('Document uploaded successfully!');
      } else {
        console.error('❌ Upload failed:', result.error);
        alert(`Upload failed: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      alert(`Error uploading document: ${error.message}`);
    } finally {
      this.isUploadingDocument = false;
    }
  }

  public formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  private resetForm(): void {
    this.newDocumentForm = {
      name: '',
      description: '',
      department: '',
      file: null
    };
    this.isUploadingDocument = false;
    
    // Reset file input
    const fileInput = document.getElementById('documentFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private checkUserPermissions(): void {
    const user = this.icdAuthService.getCurrentUser();
    if (user) {
      this.canUpload = user.role === 'admin' || user.role === 'manager';
      this.canDelete = user.role === 'admin';
    }
  }

  // Validation helpers
  isFieldInvalid(form: NgForm, fieldName: string): boolean {
    const field = form.controls[fieldName];
    return field && field.invalid && (field.dirty || field.touched || form.submitted);
  }

  getFieldError(form: NgForm, fieldName: string): string {
    const field = form.controls[fieldName];
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Document Name',
      description: 'Description',
      department: 'Department'
    };
    return labels[fieldName] || fieldName;
  }

  isFormValid(form: NgForm): boolean {
    return form.valid && this.newDocumentForm.file !== null;
  }

  // Add getter for current date
  get currentDate(): Date {
    return new Date();
  }
}
