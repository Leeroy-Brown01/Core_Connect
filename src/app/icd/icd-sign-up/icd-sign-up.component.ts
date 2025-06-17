import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ICDAuthService } from '../../services/icd-auth.service';
import { UserData } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-icd-sign-up',
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './icd-sign-up.component.html',
  styleUrls: ['./icd-sign-up.component.scss']
})
export class IcdSignUpComponent {
  signupData = {
    fullName: '',
    email: '',
    phone: '',
    department: '',
    province: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  };
  
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  // Department options for ICD
  departments = [
    'Human Resources',
    'Finance',
    'Information Technology',
    'Operations',
    'Marketing',
    'Legal',
    'Administration',
    'Communications',
    'Other'
  ];

  // Province options (South African provinces)
  provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  // Role options for ICD
  roles = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Administrator' },
    { value: 'viewer', label: 'Viewer' }
  ];

  constructor(
    private icdAuthService: ICDAuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    console.log('IcdSignUpComponent initialized');
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(form);
      return;
    }

    // Check if passwords match
    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.toastService.error('Passwords do not match.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      console.log('🔑 Attempting ICD account creation for:', this.signupData.email);
      
      // Prepare user data (excluding password and confirmPassword)
      const userData: Omit<UserData, 'uid'> = {
        fullName: this.signupData.fullName,
        displayName: this.signupData.fullName, // Add missing displayName property
        email: this.signupData.email,
        phone: this.signupData.phone,
        department: this.signupData.department,
        province: this.signupData.province,
        role: this.signupData.role,
        profilePhoto: '',
        status: 'active',
        createdAt: new Date(),
        trainingCompleted: false
      };

      // Create account using existing auth service
      const result = await this.icdAuthService.createUserAccount(userData, this.signupData.password);
      
      if (result.success) {
        console.log('✅ ICD account created successfully');
        
        // Show success toast
        this.toastService.success(`Account created successfully! Welcome ${this.signupData.fullName}!`, 3000);
        
        // Small delay to let user see the toast before navigation
        setTimeout(() => {
          this.router.navigate(['/icd-log-in']);
        }, 500);
      }
      
    } catch (error: any) {
      console.error('❌ ICD account creation failed:', error);
      
      // Handle specific error messages
      if (error.message.includes('email-already-in-use')) {
        this.errorMessage = 'This email address is already registered.';
        this.toastService.error('This email address is already registered.');
      } else if (error.message.includes('weak-password')) {
        this.errorMessage = 'Password should be at least 6 characters.';
        this.toastService.error('Password should be at least 6 characters.');
      } else if (error.message.includes('invalid-email')) {
        this.errorMessage = 'Please enter a valid email address.';
        this.toastService.error('Please enter a valid email address.');
      } else if (error.message.includes('network-request-failed')) {
        this.errorMessage = 'Network error. Please check your internet connection.';
        this.toastService.error('Network error. Please check your connection.');
      } else {
        this.errorMessage = error.message || 'Account creation failed. Please try again.';
        this.toastService.error(this.errorMessage);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  navigateTo(route: string): void {
    if (route === 'icd-log-in') {
      this.router.navigate(['/icd/log-in']);
    }
  }

  // Check if user is already authenticated and redirect
  async ngOnInit(): Promise<void> {
    try {
      // Wait for auth initialization
      await this.icdAuthService.waitForAuthInitialization();
      
      // Check if user is already authenticated
      const currentUser = this.icdAuthService.getCurrentUser();
      if (currentUser) {
        console.log('User already authenticated, redirecting to main layout');
        this.router.navigate(['/icd/main-layout']);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
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
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      department: 'Department',
      province: 'Province',
      role: 'Role',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[fieldName] || fieldName;
  }
}
