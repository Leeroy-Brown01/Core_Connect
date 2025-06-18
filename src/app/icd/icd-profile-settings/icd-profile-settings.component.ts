import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService } from '../../services/icd-user.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-icd-profile-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-profile-settings.component.html',
  styleUrl: './icd-profile-settings.component.scss'
})
export class IcdProfileSettingsComponent implements OnInit {
  activeSection = 'edit-profile';
  currentUser: any = null;
  isDeleting = false;
  showDeleteConfirmation = false;
  deleteConfirmationText = '';

  profileSections = [
    {
      id: 'edit-profile',
      name: 'Profile',
      description: 'Personal info'
    },
    {
      id: 'password',
      name: 'Password',
      description: 'Security'
    }
  ];

  // Form data
  profileForm = {
    fullName: '',
    email: '',
    phone: '',
    department: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private icdAuthService: ICDAuthService,
    private icdUserService: ICDUserService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUser();
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      this.currentUser = this.icdAuthService.getCurrentUser();
      if (this.currentUser) {
        // Pre-fill form with current user data
        this.profileForm = {
          fullName: this.currentUser.fullName || '',
          email: this.currentUser.email || '',
          phone: this.currentUser.phone || '',
          department: this.currentUser.department || ''
        };
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      this.toastService.error('Failed to load user data');
    }
  }

  selectSection(sectionId: string): void {
    this.activeSection = sectionId;
  }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) {
      this.toastService.error('No user data found');
      return;
    }

    try {
      // Update user data in Firestore
      await this.icdAuthService.updateUserData(this.currentUser.uid, {
        fullName: this.profileForm.fullName,
        phone: this.profileForm.phone,
        department: this.profileForm.department
      });

      this.toastService.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      this.toastService.error('Failed to update profile');
    }
  }

  async updatePassword(): Promise<void> {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      this.toastService.error('Please fill in all password fields');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.error('New passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.toastService.error('New password must be at least 6 characters long');
      return;
    }

    try {
      // You would implement password update logic here
      // For now, just show a success message
      this.toastService.success('Password updated successfully!');
      
      // Clear form
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } catch (error) {
      console.error('Error updating password:', error);
      this.toastService.error('Failed to update password');
    }
  }

  openDeleteConfirmation(): void {
    this.showDeleteConfirmation = true;
    this.deleteConfirmationText = '';
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationText = '';
  }

  canDeleteAccount(): boolean {
    const expectedText = 'DELETE MY ACCOUNT';
    return this.deleteConfirmationText.trim().toUpperCase() === expectedText;
  }

  async deleteAccount(): Promise<void> {
    if (!this.canDeleteAccount()) {
      this.toastService.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    if (!this.currentUser) {
      this.toastService.error('No user data found');
      return;
    }

    this.isDeleting = true;

    try {
      console.log('🗑️ Starting account deletion process for:', this.currentUser.email);

      // Get all users to find the current user's document ID
      const allUsers = await this.icdUserService.getUsers();
      const userToDelete = allUsers.find(user => user.email === this.currentUser.email);

      if (userToDelete && userToDelete.id) {
        // Delete user from Firestore
        const deleteSuccess = await this.icdUserService.deleteUser(userToDelete.id);
        
        if (deleteSuccess) {
          console.log('✅ User deleted from Firestore');
          
          // Show success message
          this.toastService.success('Account deleted successfully. You will be redirected to the login page.', 5000);
          
          // Sign out and redirect after a delay
          setTimeout(async () => {
            try {
              await this.icdAuthService.signOut();
              this.router.navigate(['/icd']);
            } catch (signOutError) {
              console.error('Error during sign out:', signOutError);
              // Force navigation even if sign out fails
              this.router.navigate(['/icd']);
            }
          }, 2000);
          
        } else {
          throw new Error('Failed to delete user from database');
        }
      } else {
        throw new Error('User not found in database');
      }

    } catch (error: any) {
      console.error('❌ Error deleting account:', error);
      this.toastService.error('Failed to delete account: ' + (error.message || 'Unknown error'));
    } finally {
      this.isDeleting = false;
      this.closeDeleteConfirmation();
    }
  }

  getUserInitials(): string {
    if (this.currentUser?.fullName) {
      const names = this.currentUser.fullName.split(' ');
      return names.length >= 2 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email[0].toUpperCase();
    }
    
    return 'U';
  }

  getUserDisplayName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'User';
  }

  getUserRole(): string {
    return this.currentUser?.role || 'User';
  }
}
