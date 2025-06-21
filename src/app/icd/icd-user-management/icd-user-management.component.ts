import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';

interface User {
  id: string;
  name: string;
  department: string;
  createdDate: Date;
  email: string;
  role: string;
  phone: string;
}

interface NewUserForm {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  province: string;
  role: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-icd-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './icd-user-management.component.html',
  styleUrls: ['./icd-user-management.component.scss']
})
export class IcdUserManagementComponent implements OnInit {
  searchQuery: string = '';
  sortBy: string = 'name';
  isCreatingUser = false;
  isLoadingUsers = false;

  // Available options
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

  provinces = [
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Matabeleland North',
    'Matabeleland South',
    
  ];

  roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' },
    { value: 'viewer', label: 'Viewer' }
  ];

  users: User[] = [];
  filteredUsers: User[] = [];
  firebaseUsers: FirebaseICDUser[] = []; // Store original Firebase users
  showAddUserModal = false;
  
  newUserForm: NewUserForm = {
    fullName: '',
    email: '',
    phone: '',
    department: '',
    province: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private icdUserService: ICDUserService,
    private icdAuthService: ICDAuthService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.icdAuthService.waitForAuthInitialization();
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoadingUsers = true;
    try {
      this.firebaseUsers = await this.icdUserService.getUsers();
      
      // Convert Firebase users to local format
      this.users = this.firebaseUsers.map(user => ({
        id: user.id || '',
        name: user.fullName,
        email: user.email,
        department: user.department,
        role: user.role,
        phone: user.phone,
        createdDate: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
      }));

      this.filterUsers();
      console.log(`👥 Loaded ${this.users.length} ICD users from Firebase`);
    } catch (error) {
      console.error('Error loading ICD users:', error);
      this.toastService.error('Failed to load users');
    } finally {
      this.isLoadingUsers = false;
    }
  }

  filterUsers(): void {
    let filtered = [...this.users];
    
    if (this.searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'department': return a.department.localeCompare(b.department);
        case 'email': return a.email.localeCompare(b.email);
        case 'role': return a.role.localeCompare(b.role);
        case 'created': return b.createdDate.getTime() - a.createdDate.getTime();
        default: return 0;
      }
    });
    
    this.filteredUsers = filtered;
  }

  onSearchChange(): void { this.filterUsers(); }
  onSortChange(): void { this.filterUsers(); }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'user': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // User actions
  editUser(userId: string): void {
    console.log('Edit user:', userId);
    this.toastService.info('Edit user functionality - coming soon!');
  }

  viewUser(userId: string): void {
    console.log('View user:', userId);
    this.toastService.info('View user functionality - coming soon!');
  }

  async deleteUser(userId: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        console.log('🗑️ Deleting ICD user from Firebase:', userId);
        
        const success = await this.icdUserService.deleteUser(userId);
        if (success) {
          console.log('✅ ICD User deleted successfully');
          await this.loadUsers(); // Reload users
          this.toastService.success('User deleted successfully!');
        } else {
          this.toastService.error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting ICD user:', error);
        this.toastService.error('Error deleting user');
      }
    }
  }

  async toggleUserStatus(userId: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const newStatus = 'active'; // Since we removed status, just keep users active
      try {
        const success = await this.icdUserService.updateUserStatus(userId, newStatus);
        if (success) {
          await this.loadUsers(); // Reload users
          this.toastService.success(`User updated successfully`);
        }
      } catch (error) {
        this.toastService.error('Failed to update user');
      }
    }
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
    this.resetForm();
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.resetForm();
  }

  async onSubmitUser(form: NgForm): Promise<void> {
    if (form.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(form);
      return;
    }

    // Check if passwords match
    if (this.newUserForm.password !== this.newUserForm.confirmPassword) {
      this.toastService.error('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (this.newUserForm.password.length < 6) {
      this.toastService.error('Password must be at least 6 characters long.');
      return;
    }

    this.isCreatingUser = true;
    
    try {
      console.log('🔑 Creating new ICD user:', this.newUserForm.email);
      
      const currentUser = this.icdAuthService.getCurrentUser();
      if (!currentUser) {
        this.toastService.error('Admin not authenticated');
        return;
      }

      // Single user creation call - ICDUserService handles both Auth + Firestore
      const result = await this.icdUserService.createUserForAdmin(
        {
          fullName: this.newUserForm.fullName,
          email: this.newUserForm.email,
          phone: this.newUserForm.phone,
          department: this.newUserForm.department,
          province: this.newUserForm.province,
          role: this.newUserForm.role,
          status: 'active',
          trainingCompleted: false,
          profilePhoto: ''
        },
        this.newUserForm.password,
        currentUser.email
      );

      if (result.success) {
        console.log('✅ User created successfully');
        this.toastService.success(`User "${this.newUserForm.fullName}" created successfully!`);
        await this.loadUsers();
        this.closeAddUserModal();
      } else {
        this.toastService.error(`Failed to create user: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error creating ICD user:', error);
      
      // Handle specific error messages
      if (error.message.includes('email-already-in-use')) {
        this.toastService.error('This email address is already registered.');
      } else if (error.message.includes('weak-password')) {
        this.toastService.error('Password should be at least 6 characters.');
      } else if (error.message.includes('invalid-email')) {
        this.toastService.error('Please enter a valid email address.');
      } else if (error.message.includes('network-request-failed')) {
        this.toastService.error('Network error. Please check your internet connection.');
      } else {
        this.toastService.error(error.message || 'Failed to create user. Please try again.');
      }
    } finally {
      this.isCreatingUser = false;
    }
  }

  async checkEmailAvailability(email: string): Promise<void> {
    if (!email) return;

    try {
      const result = await this.icdUserService.checkEmailExists(email);
      
      if (!result.canCreate) {
        this.toastService.error(result.message);
      } else {
        this.toastService.success(result.message);
      }
    } catch (error) {
      this.toastService.error('Error checking email availability');
    }
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  private resetForm(): void {
    this.newUserForm = {
      fullName: '',
      email: '',
      phone: '',
      department: '',
      province: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    };
    this.isCreatingUser = false;
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

  // Form validation methods
  isFormValid(form: NgForm): boolean {
    return form.valid && 
           this.newUserForm.password === this.newUserForm.confirmPassword &&
           this.newUserForm.password.length >= 6;
  }

  passwordsMatch(): boolean {
    return this.newUserForm.password === this.newUserForm.confirmPassword;
  }

  hasPasswordContent(): boolean {
    return this.newUserForm.password.length > 0 || this.newUserForm.confirmPassword.length > 0;
  }
}
