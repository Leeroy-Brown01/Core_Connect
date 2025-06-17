import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IcdOverviewComponent } from '../icd-overview/icd-overview.component';
import { IcdDocumentManagementComponent } from '../icd-document-management/icd-document-management.component';
import { IcdDepartmentManagementComponent } from '../icd-department-management/icd-department-management.component';
import { IcdUserManagementComponent } from "../icd-user-management/icd-user-management.component";
import { ICDAuthService } from '../../services/icd-auth.service';
import { ICDUserService, FirebaseICDUser } from '../../services/icd-user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-icd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IcdOverviewComponent,
    IcdDocumentManagementComponent,
    IcdDepartmentManagementComponent,
    IcdUserManagementComponent
  ],
  templateUrl: './icd-dashboard.component.html',
  styleUrl: './icd-dashboard.component.scss'
})
export class IcdDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('tabContainer', { static: false }) tabContainer!: ElementRef;

  // User information
  currentUser: any = null;
  currentICDUser: FirebaseICDUser | null = null;
  isLoadingUser: boolean = true;
  
  private subscription?: Subscription;

  activeTab: string = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'icd-user-management', label: 'Users' },
    { id: 'icd-document-management', label: 'Documents' },
    { id: 'icd-department-management', label: 'Departments' }
  ];

  constructor(
    private icdAuthService: ICDAuthService,
    private icdUserService: ICDUserService
  ) {
    console.log('IcdDashboardComponent initialized with user services');
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async loadUserData(): Promise<void> {
    try {
      this.isLoadingUser = true;
      
      // Subscribe to current authenticated user
      this.subscription = this.icdAuthService.currentUser$.subscribe(async (authUser) => {
        this.currentUser = authUser;
        
        if (authUser?.email) {
          console.log('🔍 Loading ICD user data for dashboard:', authUser.email);
          
          // Get all users and find current user by email
          const allUsers = await this.icdUserService.getUsers();
          this.currentICDUser = allUsers.find(user => user.email === authUser.email) || null;
          
          if (this.currentICDUser) {
            console.log('✅ Dashboard ICD User data loaded:', this.currentICDUser);
          } else {
            console.warn('⚠️ ICD User not found in database for dashboard');
          }
        }
        
        this.isLoadingUser = false;
      });
      
    } catch (error) {
      console.error('❌ Error loading user data for dashboard:', error);
      this.isLoadingUser = false;
    }
  }

  // User display methods
  getUserDisplayName(): string {
    if (this.currentICDUser?.fullName) {
      return this.currentICDUser.fullName;
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email.split('@')[0];
    }
    
    return 'User';
  }

  getUserFirstName(): string {
    if (this.currentICDUser?.fullName) {
      return this.currentICDUser.fullName.split(' ')[0];
    }
    
    if (this.currentUser?.email) {
      return this.currentUser.email.split('@')[0];
    }
    
    return 'User';
  }

  getUserRole(): string {
    return this.currentICDUser?.role || 'Medical Staff';
  }

  getUserDepartment(): string {
    return this.currentICDUser?.department || 'General';
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

  getUserProfileImage(): string | null {
    return this.currentICDUser?.profilePhoto || null;
  }

  // Navigation methods
  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  scrollLeft(): void {
    if (this.tabContainer) {
      this.tabContainer.nativeElement.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  }

  scrollRight(): void {
    if (this.tabContainer) {
      this.tabContainer.nativeElement.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  }

  canScrollLeft(): boolean {
    if (!this.tabContainer) return false;
    return this.tabContainer.nativeElement.scrollLeft > 0;
  }

  canScrollRight(): boolean {
    if (!this.tabContainer) return false;
    const element = this.tabContainer.nativeElement;
    return element.scrollLeft < (element.scrollWidth - element.clientWidth - 5);
  }
}
