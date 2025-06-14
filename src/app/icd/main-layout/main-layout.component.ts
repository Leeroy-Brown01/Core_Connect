import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
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
    IcdDownloadsComponent
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
      label: 'Downloads',
      count: 5 
    },
    { 
      id: 'inbox', 
      label: 'Inbox',
      count: 12 
    },
    { 
      id: 'sent', 
      label: 'Sent',
      count: 8 
    },
    { 
      id: 'icd-user-management', 
      label: 'Active Users',
      count: 24 
    },
    { 
      id: 'archived', 
      label: 'Archived',
      count: 12 
    },
    { 
      id: 'recycle', 
      label: 'Recycled',
      count: 10 
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

  onLogout(): void {
    console.log('Logout clicked');
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
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  ngOnInit(): void {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === 'true';
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }
}
