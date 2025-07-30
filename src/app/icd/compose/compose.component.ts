import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { ReplyService, ReplyData, ForwardData, ComposeData } from '../../services/reply.service';
import { Subscription } from 'rxjs';

interface MessageFormData {
  to: string;
  recipientDepartments: string[];
  subject: string;
  message: string;
}

@Component({
  selector: 'app-compose',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './compose.component.html',
  styleUrl: './compose.component.scss'
})
export class ComposeComponent implements OnInit, OnDestroy {
  messageData: MessageFormData = {
    to: '',
    recipientDepartments: [],
    subject: '',
    message: '',
  };

  attachedFile: File | null = null;
  isDragOver = false;
  isSending = false;
  isSaving = false;
  isProcessingFile = false;

  // Available options
  availableDepartments: string[] = [];
  
  private replySubscription?: Subscription;

  constructor(
    private messageService: MessageService,
    private toastService: ToastService,
    private authService: AuthService,
    private replyService: ReplyService
  ) {}

  ngOnInit(): void {
    this.availableDepartments = [
      // 'Human Resources',
      // 'Finance', 
      'Information Technology',
      'Project management',
    ];
     
    // Subscribe to reply data
    this.subscribeToReplyData();
  }

  ngOnDestroy(): void {
    if (this.replySubscription) {
      this.replySubscription.unsubscribe();
    }
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

    if (this.isProcessingFile) {
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

  /**
   * Subscribe to reply data from ReplyService
   */
  private subscribeToReplyData(): void {
    this.replySubscription = this.replyService.composeData$.subscribe(composeData => {
      if (composeData) {
        console.log('📧 Received compose data in compose component:', composeData);
        
        if (this.replyService.isReplyData(composeData)) {
          this.fillReplyForm(composeData);
        } else if (this.replyService.isForwardData(composeData)) {
          this.fillForwardForm(composeData);
        }
        
        // Clear compose data after using it
        this.replyService.clearComposeData();
      }
    });
  }

  /**
   * Fill form with reply data
   */
  private fillReplyForm(replyData: ReplyData): void {
    try {
      // Fill recipient email
      this.messageData.to = replyData.replyTo;

      // Format and fill subject with "Re:" prefix
      this.messageData.subject = this.replyService.formatReplySubject(replyData.originalSubject);

      // Fill message with quoted original message
      const quotedMessage = this.replyService.formatQuotedMessage(
        replyData.originalMessage,
        replyData.replyToName,
        replyData.originalTimestamp
      );

      this.messageData.message = quotedMessage;

      
      // Clear departments selection (since we're replying to specific email)
      this.messageData.recipientDepartments = [];

      // Show success message
      this.toastService.info(`Replying to: ${replyData.replyToName}`);

      console.log('✅ Reply form filled successfully');
      console.log('Form data:', {
        to: this.messageData.to,
        subject: this.messageData.subject,
        messageLength: this.messageData.message.length
      });

    } catch (error) {
      console.error('❌ Error filling reply form:', error);
      this.toastService.error('Error setting up reply. Please fill the form manually.');
    }
  }

  /**
   * Fill form with forward data
   */
  private fillForwardForm(forwardData: ForwardData): void {
    try {
      // Clear recipient email (user needs to enter who to forward to)
      this.messageData.to = '';

      // Format and fill subject with "Fwd:" prefix
      this.messageData.subject = this.replyService.formatForwardSubject(forwardData.originalSubject);

      // Fill message with forward format
      const forwardMessage = this.replyService.formatForwardMessage(
        forwardData.originalMessage,
        forwardData.originalSender,
        forwardData.originalSenderEmail || '',
        forwardData.originalTimestamp
      );

      this.messageData.message = forwardMessage;

      // Clear departments selection (user needs to select who to forward to)
      this.messageData.recipientDepartments = [];

      // Show success message
      this.toastService.info(`Forwarding message from: ${forwardData.originalSender}`);

      console.log('✅ Forward form filled successfully');
      console.log('Form data:', {
        to: this.messageData.to,
        subject: this.messageData.subject,
        messageLength: this.messageData.message.length
      });

    } catch (error) {
      console.error('❌ Error filling forward form:', error);
      this.toastService.error('Error setting up forward. Please fill the form manually.');
    }
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
