import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-icd-log-in',
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-log-in.component.html',
  styleUrls: ['./icd-log-in.component.scss']
})
export class IcdLogInComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private icdAuthService: ICDAuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    console.log('IcdLogInComponent initialized');
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(form);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      console.log('🔑 Attempting ICD login for:', this.loginData.email);
      
      await this.icdAuthService.signInAndNavigateToICD(
        this.loginData.email,
        this.loginData.password
      );
      
      console.log('✅ ICD login successful');
      
      // Show success toast
      this.toastService.success(`Welcome back! Successfully signed in as ${this.loginData.email}`, 3000);
      
      // Small delay to let user see the toast before navigation
      setTimeout(() => {
        // Navigation is handled by signInAndNavigateToICD, but we can add extra logic here if needed
        console.log('Navigating to main layout...');
      }, 500);
      
    } catch (error: any) {
      console.error('❌ ICD login failed:', error);
      
      // Handle specific error messages
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'No account found with this email address.';
        this.toastService.error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Incorrect password. Please try again.';
        this.toastService.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Please enter a valid email address.';
        this.toastService.error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        this.errorMessage = 'Too many failed attempts. Please try again later.';
        this.toastService.error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        this.errorMessage = 'Network error. Please check your internet connection.';
        this.toastService.error('Network error. Please check your connection.');
      } else {
        this.errorMessage = error.message || 'Login failed. Please try again.';
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

  navigateTo(route: string): void {
    if (route === 'icd-sign-up') {
      console.log('Navigating to ICD sign-up...');
      this.router.navigate(['/icd/sign-up']);
    } else if (route === 'icd-dashboard') {
      // This should not be used directly - login should handle navigation
      console.warn('Direct navigation to dashboard - use login form instead');
    }
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
    this.toastService.info('Forgot password functionality - coming soon!');
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
        this.toastService.info(`Welcome back, ${currentUser.fullName}!`);
        this.router.navigate(['/main-layout']);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  }
}
