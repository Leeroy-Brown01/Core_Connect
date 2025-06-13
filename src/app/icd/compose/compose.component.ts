import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MessageData {
  recipient: string;
  subject: string;
  content: string;
}

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.scss'
})
export class ComposeComponent {
  messageData: MessageData = {
    recipient: '',
    subject: '',
    content: ''
  };

  attachedFiles: File[] = [];
  isDragOver = false;
  isSending = false;
  isSaving = false;

  onSubmit() {
    if (this.messageData.recipient && this.messageData.subject && this.messageData.content) {
      this.isSending = true;
      
      // Simulate sending message
      setTimeout(() => {
        console.log('Sending message:', this.messageData);
        console.log('Attached files:', this.attachedFiles);
        this.isSending = false;
        // Reset form or navigate away
        this.resetForm();
      }, 2000);
    }
  }

  saveAsDraft() {
    this.isSaving = true;
    
    // Simulate saving as draft
    setTimeout(() => {
      console.log('Saving as draft:', this.messageData);
      console.log('Attached files:', this.attachedFiles);
      this.isSaving = false;
    }, 1000);
  }

  onCancel() {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (confirmed) {
        this.resetForm();
      }
    } else {
      this.resetForm();
    }
  }

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
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]) {
    const maxSize = 25 * 1024 * 1024; // 25MB
    
    files.forEach(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 25MB.`);
        return;
      }
      
      // Check if file already exists
      if (!this.attachedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.attachedFiles.push(file);
      }
    });
  }

  removeFile(index: number) {
    this.attachedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private hasUnsavedChanges(): boolean {
    return !!(this.messageData.recipient || this.messageData.subject || this.messageData.content || this.attachedFiles.length);
  }

  private resetForm() {
    this.messageData = {
      recipient: '',
      subject: '',
      content: ''
    };
    this.attachedFiles = [];
  }
}
