import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string;
  name: string;
  department: string;
  documents: number;
  createdDate: Date;
  status: 'active' | 'inactive';
}

interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  role: string;
  department: string;
  isActive: boolean;
}

@Component({
  selector: 'app-icd-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-user-management.component.html',
  styleUrls: ['./icd-user-management.component.scss']
})
export class IcdUserManagementComponent {
  searchQuery: string = '';
  sortBy: string = 'name';

  users: User[] = [
    {
      id: '1',
      name: 'John Smith',
      department: 'Human Resources',
      documents: 45,
      createdDate: new Date(2023, 5, 15),
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      department: 'Finance',
      documents: 67,
      createdDate: new Date(2023, 3, 20),
      status: 'active'
    },
    {
      id: '3',
      name: 'Michael Chen',
      department: 'IT Department',
      documents: 89,
      createdDate: new Date(2023, 1, 10),
      status: 'active'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      department: 'Legal',
      documents: 23,
      createdDate: new Date(2023, 7, 8),
      status: 'active'
    },
    {
      id: '5',
      name: 'David Brown',
      department: 'Operations',
      documents: 78,
      createdDate: new Date(2023, 2, 25),
      status: 'active'
    },
    {
      id: '6',
      name: 'Lisa Davis',
      department: 'Marketing',
      documents: 34,
      createdDate: new Date(2023, 6, 12),
      status: 'inactive'
    }
  ];

  filteredUsers: User[] = [];

  showAddUserModal = false;
  
  newUserForm: NewUserForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    role: '',
    department: '',
    isActive: true
  };

  ngOnInit(): void {
    this.filterUsers();
  }

  filterUsers(): void {
    let filtered = [...this.users];
    
    if (this.searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'department': return a.department.localeCompare(b.department);
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

  // User actions
  editUser(userId: string): void {
    console.log('Edit user:', userId);
  }

  viewUser(userId: string): void {
    console.log('View user:', userId);
  }

  deleteUser(userId: string): void {
    console.log('Delete user:', userId);
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
    // Reset form when opening
    this.resetForm();
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.resetForm();
  }

  onSubmitUser(): void {
    if (this.isFormValid()) {
      console.log('Creating user:', this.newUserForm);
      // Here you would typically call a service to create the user
      // this.userService.createUser(this.newUserForm).subscribe(...)
      
      // For now, just close the modal and reset form
      this.closeAddUserModal();
      
      // Show success message (you can implement a toast/notification service later)
      alert('User created successfully!');
    }
  }

  private resetForm(): void {
    this.newUserForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      username: '',
      role: '',
      department: '',
      isActive: true
    };
  }

  private isFormValid(): boolean {
    return !!(
      this.newUserForm.firstName &&
      this.newUserForm.lastName &&
      this.newUserForm.email &&
      this.newUserForm.username &&
      this.newUserForm.role
    );
  }
}
