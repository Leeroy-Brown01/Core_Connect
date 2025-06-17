import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { AuthService, UserData } from '../../services/auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';

interface User {
  id: string;
  name: string;
  department: string;
  documents: number;
  createdDate: Date;
  status: 'active' | 'inactive';
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
    private icdAuthService: ICDAuthService,
    private toastService: ToastService,
    private authService: AuthService,
    private icdUserService: ICDUserService
  ) {}

  async ngOnInit(): Promise<void> {
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
        documents: user.documentsCount || 0,
        createdDate: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
        status: user.status
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
        case 'documents': return b.documents - a.documents;
        case 'created': return b.createdDate.getTime() - a.createdDate.getTime();
        default: return 0;
      }
    });
    
    this.filteredUsers = filtered;
  }

  onSearchChange(): void { this.filterUsers(); }
  onSortChange(): void { this.filterUsers(); }

  getStatusColor(status: string): string {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  }

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
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      try {
        const success = await this.icdUserService.updateUserStatus(userId, newStatus);
        if (success) {
          await this.loadUsers(); // Reload users
          this.toastService.success(`User status updated to ${newStatus}`);
        }
      } catch (error) {
        this.toastService.error('Failed to update user status');
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
      console.log('🔑 Creating new ICD user in Firebase:', this.newUserForm.email);
      
      // Get current user info
      const currentUser = await this.authService.getCurrentUser();
      const userId = currentUser?.uid || 'unknown-user';
      
      // First create the user account
      const userData: Omit<UserData, 'uid'> = {
        fullName: this.newUserForm.fullName,
        displayName: this.newUserForm.fullName, // Add missing displayName property
        email: this.newUserForm.email,
        phone: this.newUserForm.phone,
        department: this.newUserForm.department,
        province: this.newUserForm.province,
        role: this.newUserForm.role,
        profilePhoto: '',
        status: 'active',
        createdAt: new Date(),
        trainingCompleted: false
      };

      // Create user using ICDAuthService
      const authResult = await this.icdAuthService.createUserAccount(userData, this.newUserForm.password);
      
      if (authResult.success && authResult.user) {
        // Then save to ICD users collection
        const icdUserResult = await this.icdUserService.createUser({
          fullName: this.newUserForm.fullName,
          email: this.newUserForm.email,
          phone: this.newUserForm.phone,
          department: this.newUserForm.department,
          province: this.newUserForm.province,
          role: this.newUserForm.role,
          status: 'active',
          trainingCompleted: false,
          createdBy: userId
        });

        if (icdUserResult.success) {
          console.log('✅ ICD user created successfully in Firebase');
          this.toastService.success(`User "${this.newUserForm.fullName}" created successfully!`);
          
          // Reload users from Firebase
          await this.loadUsers();
          
          // Close modal and reset form
          this.closeAddUserModal();
        } else {
          this.toastService.error(`Failed to save user data: ${icdUserResult.error}`);
        }
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
