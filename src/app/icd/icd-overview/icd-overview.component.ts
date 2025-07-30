import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, FirebaseDepartment } from '../../services/department.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { SentService, SentMessage } from '../../services/sent.service';
import { ICDAuthService } from '../../services/icd-auth.service';
import { InboxService, InboxMessage } from '../../services/inbox.service';
import { Subscription, forkJoin } from 'rxjs';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
}

interface Department {
  name: string;
  users: number;
  status: string;
  lastActivity: Date;
  manager?: string;
}

interface ActivityLog {
  user: string;
  action: string;
  target: string;
  timestamp: Date;
}

@Component({
  selector: 'app-icd-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-overview.component.html',
  styleUrl: './icd-overview.component.scss'
})
export class IcdOverviewComponent implements OnInit, OnDestroy {
  // Loading states
  isLoading = true;
  error: string | null = null;

  // Data
  stats: StatCard[] = [];
  activeDepartments: Department[] = [];
  activityLogs: ActivityLog[] = [];

  // Real data from Firebase
  public allDepartments: FirebaseDepartment[] = [];
  private allUsers: FirebaseICDUser[] = [];
  private sentMessages: SentMessage[] = [];
  private inboxMessages: InboxMessage[] = [];

  // Filter options
  selectedFilter = 'all';
  filterOptions = [
    { value: 'all', label: 'All Data' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  // Mobile accordion states
  isDepartmentsExpanded = false;
  isActivityLogExpanded = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private departmentService: DepartmentService,
    private icdUserService: ICDUserService,
    private sentService: SentService,
    private icdAuthService: ICDAuthService,
    private inboxService: InboxService
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
// Removed this User Role Note Neccessary
  // isViewer(): boolean {
  //   const user = this.icdAuthService.getCurrentUser();
  //   return user?.role?.toLowerCase() === 'viewer';
  // }

  hasAnyRole(roles: string[]): boolean {
    const user = this.icdAuthService.getCurrentUser();
    const userRole = user?.role?.toLowerCase();
    return roles.some(role => role.toLowerCase() === userRole);
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadAllData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      console.log('🔄 Loading overview data...');

      // Load all data concurrently
      const [departments, users] = await Promise.all([
        this.departmentService.getDepartments(),
        this.icdUserService.getUsers()
      ]);

      this.allDepartments = departments;
      this.allUsers = users;

      // Load sent messages for current user
      const sentSub = this.sentService.getSentMessages().subscribe({
        next: (messages) => {
          this.sentMessages = messages;
          this.processData();
        },
        error: (error) => {
          console.error('❌ Error loading sent messages:', error);
          this.sentMessages = [];
          this.processData();
        }
      });

      // Load inbox messages for current user
      const inboxSub = this.inboxService.allInboxMessages$.subscribe({
        next: (messages) => {
          this.inboxMessages = messages;
          console.log('📧 Inbox messages loaded:', messages.length);
          this.processData();
        },
        error: (error) => {
          console.error('❌ Error loading inbox messages:', error);
          this.inboxMessages = [];
          this.processData();
        }
      });

      this.subscriptions.push(sentSub, inboxSub);

    } catch (error) {
      console.error('❌ Error loading overview data:', error);
      this.error = 'Failed to load dashboard data. Please try again.';
      this.isLoading = false;
    }
  }

  private processData(): void {
    try {
      // Generate stats
      this.generateStats();
      
      // Process departments
      this.processDepartments();
      
      // Generate activity logs
      this.generateActivityLogs();

      console.log('✅ Overview data processed successfully');
      this.isLoading = false;
    } catch (error) {
      console.error('❌ Error processing overview data:', error);
      this.error = 'Failed to process dashboard data.';
      this.isLoading = false;
    }
  }

  private generateStats(): void {
    const totalUsers = this.allUsers.length;
    const totalDepartments = this.allDepartments.length;
    const totalMessages = this.sentMessages.length;
    const totalInboxMessages = this.inboxMessages.length;
    const unreadMessages = this.inboxMessages.filter(msg => {
      const currentUser = this.icdAuthService.getCurrentUser();
      return currentUser && (!msg.readBy || !msg.readBy.includes(currentUser.uid));
    }).length;

    this.stats = [
      {
        title: 'Total Users',
        value: totalUsers,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Inbox Messages',
        value: totalInboxMessages,
        icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
        color: 'from-green-500 to-green-600'
      },
      {
        title: 'Departments',
        value: totalDepartments,
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Messages Sent',
        value: totalMessages,
        icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'from-indigo-500 to-indigo-600'
      }
    ];
  }

  private processDepartments(): void {
    this.activeDepartments = this.allDepartments.map(dept => {
      const departmentUsers = this.allUsers.filter(user => user.department === dept.name);
      const activeUsers = departmentUsers.filter(user => user.status === 'active');
      
      return {
        name: dept.name,
        users: departmentUsers.length,
        status: activeUsers.length > 0 ? 'Active' : 'Inactive',
        lastActivity: this.getLatestActivity(departmentUsers),
        manager: dept.departmentManager
      };
    }).sort((a, b) => b.users - a.users); // Sort by user count
  }

  private getLatestActivity(users: FirebaseICDUser[]): Date {
    if (users.length === 0) return new Date();
    
    const latestLogin = users
      .filter(user => user.lastLoginAt)
      .map(user => user.lastLoginAt!)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    
    return latestLogin || new Date();
  }

  private generateActivityLogs(): void {
    const activities: ActivityLog[] = [];
    
    // Add recent user activities
    const recentUsers = this.allUsers
      .filter(user => user.createdAt)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
    
    recentUsers.forEach(user => {
      activities.push({
        user: user.createdBy || 'System',
        action: 'created user account for',
        target: user.fullName,
        timestamp: user.createdAt
      });
    });

    // Add recent department activities
    const recentDepartments = this.allDepartments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);
    
    recentDepartments.forEach(dept => {
      activities.push({
        user: dept.createdBy || 'System',
        action: 'created department',
        target: dept.name,
        timestamp: dept.createdAt
      });
    });

    // Add message activities
    const recentMessages = this.sentMessages
      .slice(0, 3);
    
    recentMessages.forEach(message => {
      activities.push({
        user: message.senderName || 'User',
        action: 'sent message to',
        target: message.to || 'Department',
        timestamp: message.timestamp?.toDate ? message.timestamp.toDate() : new Date()
      });
    });

    // Sort by timestamp and take latest 10
    this.activityLogs = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  // Filter methods
  onFilterChange(): void {
    console.log('Filter changed to:', this.selectedFilter);
    // Apply filtering logic based on selectedFilter
    this.processData();
  }

  // Mobile accordion methods
  toggleDepartments(): void {
    this.isDepartmentsExpanded = !this.isDepartmentsExpanded;
  }

  toggleActivityLog(): void {
    this.isActivityLogExpanded = !this.isActivityLogExpanded;
  }

  // Utility methods
  getStatColorClass(color: string): string {
    return `bg-gradient-to-r ${color}`;
  }

  formatUserCount(count: number): string {
    return count === 1 ? '1 user' : `${count} users`;
  }

  refreshData(): void {
    this.loadAllData();
  }
}
