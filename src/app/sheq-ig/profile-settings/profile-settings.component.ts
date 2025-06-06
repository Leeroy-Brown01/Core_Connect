import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserData } from '../../services/auth.service';

interface ProfileSection {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  currentUser: UserData | null = null;
  activeSection = 'edit-profile';
  isLoading = false;
  isSaving = false;
  
  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  // Profile sections
  profileSections: ProfileSection[] = [
    {
      id: 'edit-profile',
      name: 'Edit Profile',
      description: 'Update your personal information',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      id: 'password',
      name: 'Password',
      description: 'Change your account password',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    }
  ];

  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    // Subscribe to current user
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.populateProfileForm(user);
      } else {
        this.router.navigate(['/log-in']);
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private initializeForms() {
    // Profile form
    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      department: ['', [Validators.required]],
      province: ['', [Validators.required]]
    });

    // Password form
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private populateProfileForm(user: UserData) {
    this.profileForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      province: user.province
    });
  }

  // Navigation methods
  goBack() {
    window.history.back();
  }

  selectSection(sectionId: string) {
    this.activeSection = sectionId;
  }

  getActiveSection(): ProfileSection | undefined {
    return this.profileSections.find(section => section.id === this.activeSection);
  }

  getCurrentPageName(): string {
    const activeSection = this.getActiveSection();
    return activeSection ? activeSection.name : 'Profile Settings';
  }

  // Form submission methods
  async saveProfile() {
    if (this.profileForm.invalid || !this.currentUser) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isSaving = true;
    
    try {
      const formData = this.profileForm.value;
      
      // Update user data
      await this.authService.updateUserData(this.currentUser.uid, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        province: formData.province
      });

      console.log('✅ Profile updated successfully');
      // You could show a success toast here
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      // You could show an error toast here
    } finally {
      this.isSaving = false;
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isSaving = true;
    
    try {
      // Here you would implement password change logic
      // This typically requires Firebase Auth reauthentication
      console.log('🔄 Changing password...');
      
      // Placeholder for password change implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Password changed successfully');
      this.passwordForm.reset();
      
    } catch (error) {
      console.error('❌ Error changing password:', error);
    } finally {
      this.isSaving = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Utility methods
  getFormControlError(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) return `${controlName} is required`;
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `${controlName} must be at least ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }

  hasFormControlError(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return !!(control && control.errors && control.touched);
  }
}
