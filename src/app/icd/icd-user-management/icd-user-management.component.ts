import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';
import { UserData } from '../../services/auth.service';

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

  users: User[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Human Resources',
      role: 'admin',
      phone: '+27 11 123 4567',
      documents: 45,
      createdDate: new Date(2023, 5, 15),
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Finance',
      role: 'user',
      phone: '+27 21 234 5678',
      documents: 67,
      createdDate: new Date(2023, 3, 20),
      status: 'active'
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      department: 'Information Technology',
      role: 'admin',
      phone: '+27 31 345 6789',
      documents: 89,
      createdDate: new Date(2023, 1, 10),
      status: 'active'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma.wilson@company.com',
      department: 'Legal',
      role: 'user',
      phone: '+27 41 456 7890',
      documents: 23,
      createdDate: new Date(2023, 7, 8),
      status: 'active'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@company.com',
      department: 'Operations',
      role: 'user',
      phone: '+27 51 567 8901',
      documents: 78,
      createdDate: new Date(2023, 2, 25),
      status: 'active'
    },
    {
      id: '6',
      name: 'Lisa Davis',
      email: 'lisa.davis@company.com',
      department: 'Marketing',
      role: 'viewer',
      phone: '+27 12 678 9012',
      documents: 34,
      createdDate: new Date(2023, 6, 12),
      status: 'inactive'
    }
  ];

  filteredUsers: User[] = [];
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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.filterUsers();
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

  deleteUser(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user && confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      console.log('Delete user:', userId);
      this.toastService.info('Delete user functionality - coming soon!');
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
      
      // Prepare user data matching UserData interface
      const userData: Omit<UserData, 'uid'> = {
        fullName: this.newUserForm.fullName,
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
      const result = await this.icdAuthService.createUserAccount(userData, this.newUserForm.password);
      
      if (result.success) {
        console.log('✅ ICD user created successfully');
        this.toastService.success(`User "${this.newUserForm.fullName}" created successfully!`);
        
        // Add to local users list for immediate UI update
        const newUser: User = {
          id: result.user?.uid || Date.now().toString(),
          name: this.newUserForm.fullName,
          email: this.newUserForm.email,
          department: this.newUserForm.department,
          role: this.newUserForm.role,
          phone: this.newUserForm.phone,
          documents: 0,
          createdDate: new Date(),
          status: 'active'
        };
        
        this.users.push(newUser);
        this.filterUsers();
        
        // Close modal and reset form
        this.closeAddUserModal();
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
