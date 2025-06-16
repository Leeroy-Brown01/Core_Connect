import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IcdDashboardComponent } from '../icd-dashboard/icd-dashboard.component';
import { InboxComponent } from '../inbox/inbox.component';
import { SentComponent } from '../sent/sent.component';
import { IcdUsersComponent } from '../icd-users/icd-users.component';
import { IcdProfileSettingsComponent } from '../icd-profile-settings/icd-profile-settings.component';
import { RecycleComponent } from '../recycle/recycle.component';
import { ArchivedComponent } from '../archived/archived.component';
import { ComposeComponent } from '../compose/compose.component';
import { IcdDownloadsComponent } from '../icd-downloads/icd-downloads.component';
import { IcdUserManagementComponent } from '../icd-user-management/icd-user-management.component';
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule
    , FormsModule
    , IcdDashboardComponent
    , InboxComponent
    , SentComponent
    ,IcdUserManagementComponent
    ,IcdProfileSettingsComponent, 
    RecycleComponent,
    ArchivedComponent,
    ComposeComponent,
    IcdDownloadsComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {

  activeTab: string = 'icd-dashboard';
  showUserDropdown: boolean = false;
  searchQuery: string = '';
  isSidenavCollapsed: boolean = false;
  private dropdownTimeout: any;
  isDarkMode: boolean = false;
  currentUser: any = null;
  currentICDUser: FirebaseICDUser | null = null;
  isLoadingUser: boolean = true;

  constructor(
    private icdAuthService: ICDAuthService,
    private icdUserService: ICDUserService,
    private router: Router,
    private toastService: ToastService
  ) {
    console.log('MainLayoutComponent initialized with ICDAuthService and ICDUserService');
  }

  tabs: Tab[] = [
    { 
      id: 'icd-dashboard', 
      label: 'Dashboard'
    },
    { 
      id: 'compose', 
      label: 'Compose'
    },
    { 
      id: 'downloads', 
      label: 'Downloads'
    },
    { 
      id: 'inbox', 
      label: 'Inbox'
    },
    { 
      id: 'sent', 
      label: 'Sent'
    },
    { 
      id: 'icd-user-management', 
      label: 'Active Users'
    },
    { 
      id: 'archived', 
      label: 'Archived'
    },
    { 
      id: 'recycle', 
      label: 'Recycled'
    }
  ];

  switchTab(tabId: string): void {
    this.activeTab = tabId;
    this.closeUserDropdown();
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  onMouseEnterDropdown(): void {
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
    }
    this.showUserDropdown = true;
  }

  onMouseLeaveDropdown(): void {
    this.dropdownTimeout = setTimeout(() => {
      this.showUserDropdown = false;
    }, 300);
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
    }
  }

  onAccountSettings(): void {
    this.switchTab('account-settings');
  }

  async onLogout(): Promise<void> {
    try {
      console.log('🔓 Logging out from ICD...');
      
      const currentUser = this.icdAuthService.getCurrentUser();
      const userName = currentUser?.fullName || 'User';
      
      await this.icdAuthService.signOut();
      
      console.log('✅ ICD logout successful');
      this.toastService.success(`Goodbye ${userName}! You have been logged out successfully.`, 3000);
      
    } catch (error) {
      console.error('❌ ICD logout failed:', error);
      this.toastService.error('Logout failed. Redirecting anyway...');
      // Force navigation even if logout fails
      this.router.navigate(['/icd/log-in']);
    }
    this.closeUserDropdown();
  }

  onSearch(): void {
    console.log('Searching for:', this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  toggleSidenav(): void {
    this.isSidenavCollapsed = !this.isSidenavCollapsed;
  }

  isComposeTab(tabId: string): boolean {
    return tabId === 'compose';
  }

  onHelp(): void {
    console.log('Help clicked');
    alert('Help functionality - coming soon!');
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    console.log('Dark mode:', this.isDarkMode ? 'ON' : 'OFF');
    
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.toastService.success(`${this.isDarkMode ? 'Dark' : 'Light'} mode activated`);
  }

  private async loadCurrentICDUser(): Promise<void> {
    try {
      this.isLoadingUser = true;
      
      const authUser = this.icdAuthService.getCurrentUser();
      if (!authUser?.email) {
        console.warn('No authenticated user email found');
        this.isLoadingUser = false;
        return;
      }

      console.log('🔍 Loading ICD user data for:', authUser.email);
      
      // Get all users and find current user by email
      const allUsers = await this.icdUserService.getUsers();
      this.currentICDUser = allUsers.find(user => user.email === authUser.email) || null;
      
      if (this.currentICDUser) {
        console.log('✅ ICD User data loaded:', this.currentICDUser);
      } else {
        console.warn('⚠️ ICD User not found in database');
      }
      
      this.isLoadingUser = false;
    } catch (error) {
      console.error('❌ Error loading ICD user data:', error);
      this.isLoadingUser = false;
    }
  }

  getUserInitials(): string {
    if (this.currentICDUser?.fullName) {
      const names = this.currentICDUser.fullName.split(' ');
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
    return this.currentICDUser?.fullName || this.currentUser?.email || 'User';
  }

  getUserRole(): string {
    return this.currentICDUser?.role || 'User';
  }

  getUserDepartment(): string {
    return this.currentICDUser?.department || '';
  }

  getUserProfileImage(): string | null {
    return this.currentICDUser?.profilePhoto || null;
  }

  async ngOnInit(): Promise<void> {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      }
    }

    // Subscribe to current user
    this.icdAuthService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Current ICD user:', user?.email || 'None');
      
      // Load ICD user data when auth user changes
      if (user) {
        this.loadCurrentICDUser();
      }
    });

    // Check authentication
    try {
      await this.icdAuthService.waitForAuthInitialization();
      const user = this.icdAuthService.getCurrentUser();
      
      if (!user) {
        console.log('No authenticated user found, redirecting to login');
        this.router.navigate(['/icd/log-in']);
      } else {
        // Load ICD user data
        await this.loadCurrentICDUser();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  }
}
