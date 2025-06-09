import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-management-a',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management-a.component.html',
  styleUrl: './user-management-a.component.scss'
})
export class UserManagementAComponent implements OnInit {

  // Province filter
  selectedProvince: string = 'All Provinces';

  // User metrics properties - will be populated from service
  totalActiveUsers: number = 0;
  usersAwaitingApproval: number = 0;
  totalUsers: number = 0;
  completedUsers: number = 0;
  userCompletionPercentage: number = 0;

  // Loading states
  isLoadingUsers: boolean = false;
  isLoadingMetrics: boolean = false;

  // User registration requests data (keeping hardcoded as requested)
  userRegistrationRequests = [
    { fullName: 'Sarah Mitchell', department: 'Safety', position: 'Safety Inspector', requestDate: new Date('2024-12-15'), status: 'Pending' },
    { fullName: 'Michael Johnson', department: 'Operations', position: 'Site Supervisor', requestDate: new Date('2024-12-14'), status: 'Approved' },
    { fullName: 'Emily Davis', department: 'Training', position: 'Training Coordinator', requestDate: new Date('2024-12-13'), status: 'Pending' },
    { fullName: 'Robert Wilson', department: 'Maintenance', position: 'Equipment Technician', requestDate: new Date('2024-12-12'), status: 'Rejected' },
    { fullName: 'Lisa Anderson', department: 'HR', position: 'HR Specialist', requestDate: new Date('2024-12-11'), status: 'Pending' },
    { fullName: 'David Brown', department: 'Safety', position: 'Safety Officer', requestDate: new Date('2024-12-10'), status: 'Approved' },
    { fullName: 'Jennifer Taylor', department: 'Operations', position: 'Shift Leader', requestDate: new Date('2024-12-09'), status: 'Pending' },
    { fullName: 'Mark Thompson', department: 'Training', position: 'Instructor', requestDate: new Date('2024-12-08'), status: 'Approved' },
    { fullName: 'Amanda Garcia', department: 'Maintenance', position: 'Maintenance Supervisor', requestDate: new Date('2024-12-07'), status: 'Pending' },
    { fullName: 'Christopher Lee', department: 'Operations', position: 'Site Manager', requestDate: new Date('2024-12-06'), status: 'Approved' },
    { fullName: 'Rachel Martinez', department: 'Safety', position: 'Safety Analyst', requestDate: new Date('2024-12-05'), status: 'Rejected' },
    { fullName: 'Kevin Miller', department: 'Training', position: 'Skills Assessor', requestDate: new Date('2024-12-04'), status: 'Pending' }
  ];

  // User activity updates data (keeping hardcoded as requested)
  userActivityUpdates = [
    { action: 'Completed Safety Training', userName: 'John Smith', timestamp: new Date('2024-12-15'), type: 'Training' },
    { action: 'Profile Updated', userName: 'Sarah Johnson', timestamp: new Date('2024-12-14'), type: 'Profile' },
    { action: 'Logged In', userName: 'Mike Wilson', timestamp: new Date('2024-12-13'), type: 'Login' },
    { action: 'Training Progress Updated', userName: 'Emma Davis', timestamp: new Date('2024-12-12'), type: 'Training' },
    { action: 'Password Changed', userName: 'Tom Brown', timestamp: new Date('2024-12-11'), type: 'Profile' },
    { action: 'Completed Assessment', userName: 'Lisa Garcia', timestamp: new Date('2024-12-10'), type: 'Training' },
    { action: 'Logged In', userName: 'David Lee', timestamp: new Date('2024-12-09'), type: 'Login' },
    { action: 'Certificate Downloaded', userName: 'Rachel Green', timestamp: new Date('2024-12-08'), type: 'Training' },
    { action: 'Profile Photo Updated', userName: 'James Carter', timestamp: new Date('2024-12-07'), type: 'Profile' },
    { action: 'Training Enrolled', userName: 'Maria Rodriguez', timestamp: new Date('2024-12-06'), type: 'Training' },
    { action: 'Logged In', userName: 'Robert Kim', timestamp: new Date('2024-12-05'), type: 'Login' },
    { action: 'Contact Info Updated', userName: 'Amy Zhang', timestamp: new Date('2024-12-04'), type: 'Profile' },
    { action: 'Course Completed', userName: 'Carlos Lopez', timestamp: new Date('2024-12-03'), type: 'Training' },
    { action: 'Logged In', userName: 'Jennifer White', timestamp: new Date('2024-12-02'), type: 'Login' }
  ];

  // User table configuration
  userTableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'lastLogin', label: 'Last Login' }
  ];

  // User directory data - will be populated from service
  filteredUsers: any[] = [];
  allUsers: any[] = [];

  // Sorting properties
  currentUserSort = 'name';
  userSortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadUserMetrics();
  }

  // Load user data from service
  private loadUserData() {
    this.isLoadingUsers = true;
    
    if (this.selectedProvince === 'All Provinces') {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          console.log('Raw users data received:', users);
          this.allUsers = users;
          this.filteredUsers = this.transformUsersForTable(users);
          this.isLoadingUsers = false;
          console.log('Users loaded successfully:', users.length);
          
          // If metrics failed to load, try calculating from here
          if (this.totalUsers === 0 && users.length > 0) {
            console.log('Metrics seem empty, calculating from user data...');
            this.totalUsers = users.length;
            this.totalActiveUsers = users.filter(u => 
              u.status?.toLowerCase() === 'active' || u.isActive === true
            ).length;
            this.completedUsers = users.filter(u => 
              u.trainingCompleted === true || u.trainingComplete === true
            ).length;
            this.usersAwaitingApproval = Math.max(0, this.totalUsers - this.totalActiveUsers);
            this.calculateUserMetrics();
          }
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoadingUsers = false;
        }
      });
    } else {
      this.userService.getUsersByProvince(this.selectedProvince).subscribe({
        next: (users) => {
          this.allUsers = users;
          this.filteredUsers = this.transformUsersForTable(users);
          this.isLoadingUsers = false;
          console.log('Users loaded for province:', this.selectedProvince, users.length);
        },
        error: (error) => {
          console.error('Error loading users by province:', error);
          this.isLoadingUsers = false;
        }
      });
    }
  }

  // Load user metrics from service
  private loadUserMetrics() {
    this.isLoadingMetrics = true;
    
    this.userService.getUserMetrics().subscribe({
      next: (metrics) => {
        console.log('Received metrics from service:', metrics);
        
        this.totalUsers = metrics.totalUsers;
        this.totalActiveUsers = metrics.totalActiveUsers;
        this.completedUsers = metrics.completedUsers;
        this.usersAwaitingApproval = Math.max(0, this.totalUsers - this.totalActiveUsers);
        this.calculateUserMetrics();
        this.isLoadingMetrics = false;
        
        console.log('Component metrics after assignment:', {
          totalUsers: this.totalUsers,
          totalActiveUsers: this.totalActiveUsers,
          completedUsers: this.completedUsers,
          usersAwaitingApproval: this.usersAwaitingApproval
        });
      },
      error: (error) => {
        console.error('Error loading user metrics:', error);
        this.isLoadingMetrics = false;
        
        // Fallback: try to calculate from loaded users
        if (this.allUsers.length > 0) {
          console.log('Using fallback metrics calculation from loaded users');
          this.totalUsers = this.allUsers.length;
          this.totalActiveUsers = this.allUsers.filter(u => 
            u.status?.toLowerCase() === 'active' || u.isActive === true
          ).length;
          this.completedUsers = this.allUsers.filter(u => 
            u.trainingCompleted === true || u.trainingComplete === true
          ).length;
          this.usersAwaitingApproval = Math.max(0, this.totalUsers - this.totalActiveUsers);
          this.calculateUserMetrics();
        }
      }
    });
  }

  // Transform user data for table display
  private transformUsersForTable(users: any[]): any[] {
    return users.map(user => ({
      name: user.fullName || user.name || `${user.firstName} ${user.lastName}` || 'N/A',
      department: user.department || 'N/A',
      role: this.formatUserRole(user.role || user.userRole || user.type) || 'N/A',
      status: user.status || (user.isActive ? 'Active' : 'Inactive'),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date()
    }));
  }

  // Format user role for display
  private formatUserRole(role: string): string {
    if (!role) return 'N/A';
    
    const roleMap: { [key: string]: string } = {
      'instructor': 'Instructor',
      'trainer': 'Trainer',
      'trainee': 'Trainee',
      'student': 'Student',
      'admin': 'Administrator',
      'administrator': 'Administrator',
      'manager': 'Manager',
      'supervisor': 'Supervisor'
    };
    
    const normalizedRole = role.toLowerCase();
    return roleMap[normalizedRole] || this.capitalizeFirstLetter(role);
  }

  // Helper method to capitalize first letter
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  // Handle province filter change
  onProvinceChange() {
    this.loadUserData();
  }

  private calculateUserMetrics() {
    // Calculate user completion percentage
    this.userCompletionPercentage = this.totalUsers > 0 ? 
      Math.round((this.completedUsers / this.totalUsers) * 100) : 0;
  }

  // User table sorting
  sortUserTable(key: string) {
    if (this.currentUserSort === key) {
      this.userSortDirection = this.userSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentUserSort = key;
      this.userSortDirection = 'asc';
    }

    this.filteredUsers.sort((a, b) => {
      const aValue = a[key as keyof typeof a];
      const bValue = b[key as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.userSortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return this.userSortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
  }

  // User management methods
  viewUserProfile(user: any) {
    console.log('Viewing user profile:', user);
    // Implement user profile modal or navigation
  }

  editUser(user: any) {
    console.log('Editing user:', user);
    // Implement user edit modal or navigation
  }

  // Additional methods can be added here for user management functionality
  approveUserRequest(request: any) {
    console.log('Approving user request:', request);
    // Implement approval logic
  }

  rejectUserRequest(request: any) {
    console.log('Rejecting user request:', request);
    // Implement rejection logic
  }

  // Navigation to create user account
  navigateToCreateUser() {
    this.router.navigate(['/create-user-account']);
  }
}
