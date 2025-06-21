import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ToastComponent } from '../../components/toast/toast.component';

interface MessageFormData {
  to: string;
  recipientDepartments: string[];
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  category: string;
}

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.scss'
})
export class ComposeComponent implements OnInit {
  messageData: MessageFormData = {
    to: '',
    recipientDepartments: [],
    subject: '',
    message: '',
    priority: 'normal',
    category: 'general'
  };

  attachedFile: File | null = null;
  isDragOver = false;
  isSending = false;
  isSaving = false;
  isProcessingFile = false;
  
  // Available options
  availableDepartments: string[] = [];
  priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' }
  ];
  
  categoryOptions = [
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'policy', label: 'Policy Update' },
    { value: 'training', label: 'Training' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private messageService: MessageService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.availableDepartments = this.messageService.getDepartments();
  }

  async onSubmit() {
    if (this.validateForm()) {
      this.isSending = true;
      
      try {
        console.log('📤 Sending message:', this.messageData);
        
        const messageId = await this.messageService.sendMessageWithAttachment(
          {
            to: this.messageData.to,
            recipientDepartments: this.messageData.recipientDepartments,
            subject: this.messageData.subject,
            message: this.messageData.message,
            priority: this.messageData.priority,
            category: this.messageData.category,
            status: 'sent'
          },
          this.attachedFile || undefined
        );
        
        console.log('✅ Message sent successfully with ID:', messageId);
        this.toastService.success('Message sent successfully!');
        this.resetForm();
        
      } catch (error: any) {
        console.error('❌ Error sending message:', error);
        this.toastService.error(error.message || 'Failed to send message. Please try again.');
      } finally {
        this.isSending = false;
      }
    }
  }

  async saveAsDraft() {
    if (!this.hasContent()) {
      this.toastService.warning('Please add some content before saving as draft.');
      return;
    }

    this.isSaving = true;
    
    try {
      console.log('💾 Saving as draft:', this.messageData);
      
      const draftId = await this.messageService.saveDraft(
        {
          to: this.messageData.to,
          recipientDepartments: this.messageData.recipientDepartments,
          subject: this.messageData.subject,
          message: this.messageData.message,
          priority: this.messageData.priority,
          category: this.messageData.category,
          status: 'draft'
        },
        this.attachedFile || undefined
      );
      
      console.log('✅ Draft saved successfully with ID:', draftId);
      this.toastService.success('Draft saved successfully!');
      
    } catch (error: any) {
      console.error('❌ Error saving draft:', error);
      this.toastService.error(error.message || 'Failed to save draft. Please try again.');
    } finally {
      this.isSaving = false;
    }
  }

  onCancel() {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (confirmed) {
        this.resetForm();
        this.toastService.info('Message cancelled.');
      }
    } else {
      this.resetForm();
    }
  }

  // Department selection methods
  onDepartmentChange(department: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      if (!this.messageData.recipientDepartments.includes(department)) {
        this.messageData.recipientDepartments.push(department);
      }
    } else {
      const index = this.messageData.recipientDepartments.indexOf(department);
      if (index > -1) {
        this.messageData.recipientDepartments.splice(index, 1);
      }
    }
    
    console.log('Selected departments:', this.messageData.recipientDepartments);
  }

  isDepartmentSelected(department: string): boolean {
    return this.messageData.recipientDepartments.includes(department);
  }

  // File handling methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFilesDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File) {
    // Validate file
    const validation = this.messageService.validateFile(file);
    if (!validation.valid) {
      this.toastService.error(validation.error!);
      return;
    }
    
    this.isProcessingFile = true;
    
    // Show processing message
    this.toastService.info(`Processing file "${file.name}"...`);
    
    // Small delay to show processing state
    setTimeout(() => {
      this.attachedFile = file;
      this.isProcessingFile = false;
      this.toastService.success(`File "${file.name}" ready for upload (${this.formatFileSize(file.size)}).`);
    }, 500);
  }

  removeFile() {
    this.attachedFile = null;
    this.isProcessingFile = false;
    this.toastService.info('File attachment removed.');
  }

  formatFileSize(bytes: number): string {
    return this.messageService.formatFileSize(bytes);
  }

  // Check if file is being processed
  isFileProcessing(): boolean {
    return this.isProcessingFile;
  }

  // Get file icon based on type
  getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📋';
    if (file.type.includes('text')) return '📃';
    return '📎';
  }

  // Check if file is an image for preview
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  // Get file preview URL
  getFilePreviewUrl(file: File): string | null {
    if (!this.isImageFile(file)) return null;
    return URL.createObjectURL(file);
  }

  // Validation methods
  private validateForm(): boolean {
    if (!this.messageData.to && this.messageData.recipientDepartments.length === 0) {
      this.toastService.error('Please specify a recipient email or select at least one department.');
      return false;
    }
    
    if (!this.messageData.subject.trim()) {
      this.toastService.error('Please enter a subject.');
      return false;
    }
    
    if (!this.messageData.message.trim()) {
      this.toastService.error('Please enter a message.');
      return false;
    }

    // Only check file processing if a file was selected
    if (this.attachedFile && this.isProcessingFile) {
      this.toastService.error('Please wait for file processing to complete.');
      return false;
    }
    
    return true;
  }

  private hasContent(): boolean {
    return !!(
      this.messageData.to || 
      this.messageData.recipientDepartments.length > 0 ||
      this.messageData.subject || 
      this.messageData.message || 
      this.attachedFile
    );
  }

  private hasUnsavedChanges(): boolean {
    return this.hasContent();
  }

  private resetForm() {
    this.messageData = {
      to: '',
      recipientDepartments: [],
      subject: '',
      message: '',
      priority: 'normal',
      category: 'general'
    };
    this.attachedFile = null;
  }

  // Character count for message
  getCharacterCount(): number {
    return this.messageData.message?.length || 0;
  }

  getMaxCharacters(): number {
    return 5000;
  }

  isCharacterLimitExceeded(): boolean {
    return this.getCharacterCount() > this.getMaxCharacters();
  }

  // New helper method to check if form has minimum required content for sending
  canSendMessage(): boolean {
    return !!(
      (this.messageData.to || this.messageData.recipientDepartments.length > 0) &&
      this.messageData.subject.trim() &&
      this.messageData.message.trim() &&
      !this.isCharacterLimitExceeded() &&
      !this.isProcessingFile
    );
  }
}
