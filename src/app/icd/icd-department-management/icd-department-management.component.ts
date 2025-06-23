import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DepartmentService, FirebaseDepartment } from '../../services/department.service';
import { ICDUserService } from 'src/app/services/icd-user.service';
import { ICDAuthService } from 'src/app/services/icd-auth.service';

interface Department {
  id: string;
  name: string;
  manager: string;
  userCount: number;
  createdDate: Date;
  createdBy: string;
}

interface NewDepartmentForm {
  name: string;
  manager: string;
  description: string;
}

@Component({
  selector: 'app-icd-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-department-management.component.html',
  styleUrl: './icd-department-management.component.scss'
})
export class IcdDepartmentManagementComponent implements OnInit {
  searchQuery: string = '';
  sortBy: string = 'name';
  showCreateModal = false;
  isCreatingDepartment = false;
  isLoadingDepartments = false;

  // Available department options
  departmentOptions = [
    'Human Resources',
    'Finance',
    'Information Technology',
    'Operations',
    
  ];

  newDepartmentForm: NewDepartmentForm = {
    name: '',
    manager: '',
    description: ''
  };

  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  firebaseDepartments: FirebaseDepartment[] = []; // Store original Firebase departments

  constructor(
    private authService: AuthService,
    private icdAuthService: ICDAuthService,
    private departmentService: DepartmentService
  ) {}



   // Add these simple role checker methods
   isAdmin(): boolean {
    const user = this.icdAuthService.getCurrentUser();
    return user?.role?.toLowerCase() === 'admin';
  }

  isUser(): boolean {
    const user = this.icdAuthService.getCurrentUser();
    return user?.role?.toLowerCase() === 'user';
  }

  isViewer(): boolean {
    const user = this.icdAuthService.getCurrentUser();
    return user?.role?.toLowerCase() === 'viewer';
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.icdAuthService.getCurrentUser();
    const userRole = user?.role?.toLowerCase();
    return roles.some(role => role.toLowerCase() === userRole);
  }

  async ngOnInit(): Promise<void> {
    await this.loadDepartments();
  }

  async loadDepartments(): Promise<void> {
    this.isLoadingDepartments = true;
    try {
      this.firebaseDepartments = await this.departmentService.getDepartments();
      
      // Convert Firebase departments to local format
      this.departments = this.firebaseDepartments.map(dept => ({
        id: dept.id || '',
        name: dept.name,
        manager: dept.departmentManager,
        userCount: 0, // You can implement user counting later
        createdDate: dept.createdAt instanceof Date ? dept.createdAt : new Date(dept.createdAt),
        createdBy: dept.createdBy
      }));

      this.filterDepartments();
      console.log(`🏢 Loaded ${this.departments.length} departments from Firebase`);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      this.isLoadingDepartments = false;
    }
  }

  filterDepartments(): void {
    let filtered = [...this.departments];

    // Department-based filtering for non-admin users
    if (!this.isAdmin()) {
      const currentUser = this.icdAuthService.getCurrentUser();
      const currentUserDepartment = currentUser?.department;
      
      if (currentUserDepartment) {
        filtered = filtered.filter(dept => 
          dept.name.toLowerCase() === currentUserDepartment.toLowerCase()
        );
      }
    }
    
    if (this.searchQuery) {
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        dept.manager.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'manager': return a.manager.localeCompare(b.manager);
        case 'userCount': return b.userCount - a.userCount;
        case 'created': return b.createdDate.getTime() - a.createdDate.getTime();
        default: return 0;
      }
    });
    
    this.filteredDepartments = filtered;
  }

  onSearchChange(): void { this.filterDepartments(); }
  onSortChange(): void { this.filterDepartments(); }

  // Modal methods
  openCreateModal(): void {
    this.showCreateModal = true;
    this.resetForm();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  async onSubmitDepartment(form: NgForm): Promise<void> {
    if (form.invalid) {
      console.log('Form is invalid');
      this.markFormGroupTouched(form);
      return;
    }

    this.isCreatingDepartment = true;
    
    try {
      console.log('🏢 Creating new department in Firebase:', this.newDepartmentForm.name);
      
      // Get current user info
      const currentUser = await this.authService.getCurrentUser();
      const userId = currentUser?.uid || 'unknown-user';
      
      // Create department in Firebase
      const result = await this.departmentService.createDepartment({
        name: this.newDepartmentForm.name,
        description: this.newDepartmentForm.description,
        departmentManager: this.newDepartmentForm.manager,
        createdBy: userId
      });
      
      if (result.success) {
        console.log('✅ Department created successfully in Firebase');
        
        // Reload departments from Firebase
        await this.loadDepartments();
        
        // Close modal and reset form
        this.closeCreateModal();
        
        // Show success message
        alert('Department created successfully!');
      } else {
        console.error('❌ Creation failed:', result.error);
        alert(`Creation failed: ${result.error}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error creating department:', error);
      alert(`Error creating department: ${error.message}`);
    } finally {
      this.isCreatingDepartment = false;
    }
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  private resetForm(): void {
    this.newDepartmentForm = {
      name: '',
      manager: '',
      description: ''
    };
    this.isCreatingDepartment = false;
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
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Department Name',
      manager: 'Department Manager',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  isFormValid(form: NgForm): boolean {
    return form.valid;
  }

  // Department actions
  editDepartment(deptId: string): void {
    console.log('Edit department:', deptId);
    alert('Edit department functionality - coming soon!');
  }

  viewDepartment(deptId: string): void {
    console.log('View department:', deptId);
    alert('View department functionality - coming soon!');
  }

  async deleteDepartment(deptId: string): Promise<void> {
    const dept = this.departments.find(d => d.id === deptId);
    if (dept && confirm(`Are you sure you want to delete "${dept.name}" department?`)) {
      try {
        console.log('🗑️ Deleting department from Firebase:', deptId);
        
        const success = await this.departmentService.deleteDepartment(deptId);
        if (success) {
          console.log('✅ Department deleted successfully');
          await this.loadDepartments(); // Reload departments
          alert('Department deleted successfully!');
        } else {
          alert('Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department');
      }
    }
  }

  // Add getter for current date
  get currentDate(): Date {
    return new Date();
  }
}
