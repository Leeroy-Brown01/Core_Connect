import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PlayerComponent } from './sheq-ig/player/player.component';
import { UserManagementAComponent } from './sheq-ig/user-management-a/user-management-a.component';
import { AdminSheqComponent } from './sheq-ig/admin-sheq/admin-sheq.component';
import { CourseDetailsComponent } from './sheq-ig/course-details/course-details.component';
import { HelpCenterComponent } from './sheq-ig/help-center/help-center.component';
import { AdminOverviewComponent } from './sheq-ig/admin-sheq/admin-overview/admin-overview.component';
import { EmployeeDashboardComponent } from './sheq-ig/employee-dashboard/employee-dashboard.component';
import { NotificationsComponent } from './sheq-ig/notifications/notifications.component';
import { FundoIsmsComponent } from './fundo-isms/fundo-isms.component';
import { LandingPageComponent } from './fundo-isms/landing-page/landing-page.component';
import { DashboardComponent } from './fundo-isms/dashboard/dashboard.component';
import { InventoryComponent } from './fundo-isms/inventory/inventory.component';
import { BinCountsComponent } from './fundo-isms/inventory/bin-counts/bin-counts.component';
import { StockAdjustmentsComponent } from './fundo-isms/inventory/stock-adjustments/stock-adjustments.component';
import { StockOverviewComponent } from './fundo-isms/inventory/stock-overview/stock-overview.component';
import { WarehouseComponent } from './fundo-isms/inventory/warehouse/warehouse.component';
import { AdminDashboardComponent } from './sheq-ig/admin-dashboard/admin-dashboard.component';
import { CourseManagementComponent } from './sheq-ig/admin-dashboard/course-management/course-management.component';
import { ScheduleComponent } from './sheq-ig/schedule/schedule.component';
import { GetStartedComponent } from './sheq-ig/get-started/get-started.component';
import { CreateUserAccountComponent } from './sheq-ig/create-user-account/create-user-account.component';
import { LogInComponent } from './sheq-ig/log-in/log-in.component';
import { HomeComponent } from './sheq-ig/home/home.component';
import { SheqIgComponent } from './sheq-ig/sheq-ig.component';
import { VideoOutputComponent } from './sheq-ig/video-output/video-output.component';
import { NavBarComponent } from './sheq-ig/nav-bar/nav-bar.component';
import { TestComponent } from './test-component/test-component.component';
import { ProfileSettingsComponent } from './sheq-ig/profile-settings/profile-settings.component';
import { CreateTrainingComponent } from './sheq-ig/create-training/create-training.component';
import { InstructorDashboardComponent } from './sheq-ig/instructor-dashboard/instructor-dashboard.component';
import { InstructorOverviewComponent } from './sheq-ig/instructor-dashboard/instructor-overview/instructor-overview.component';
import { IcdComponent } from './icd/icd.component';
import { IcdLogInComponent } from './icd/icd-log-in/icd-log-in.component';
import { IcdSignUpComponent } from './icd/icd-sign-up/icd-sign-up.component';
import { IcdDashboardComponent } from './icd/icd-dashboard/icd-dashboard.component';
import { MainLayoutComponent } from './icd/main-layout/main-layout.component';
import { InboxComponent } from './icd/inbox/inbox.component';
import { SentComponent } from './icd/sent/sent.component';
import { ComposeComponent } from './icd/compose/compose.component';
import { IcdUsersComponent } from './icd/icd-users/icd-users.component';
import { IcdProfileSettingsComponent } from './icd/icd-profile-settings/icd-profile-settings.component';
import { ArchivedComponent } from './icd/archived/archived.component';
import { RecycleComponent } from './icd/recycle/recycle.component';
import { IcdUserManagementComponent } from './icd/icd-user-management/icd-user-management.component';
import { IcdOverviewComponent } from './icd/icd-overview/icd-overview.component';
import { IcdDocumentManagementComponent } from './icd/icd-document-management/icd-document-management.component';
import { IcdDepartmentManagementComponent } from './icd/icd-department-management/icd-department-management.component';
import { IcdDraftComponent } from './icd/icd-draft/icd-draft.component';
import { IcdDownloadsComponent } from './icd/icd-downloads/icd-downloads.component';
import { IcdMessageDetailsComponent } from './icd/icd-message-details/icd-message-details.component';

export const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: '',
    redirectTo: '/log-in',
    pathMatch: 'full'
  },
  {
    path: 'log-in',
    component: LogInComponent
  },
  {
    path: 'create-user-account',
    component: CreateUserAccountComponent
  },
  {
    path: 'nav-bar',
    component: NavBarComponent
  },
  {
    path: 'get-started',
    component: GetStartedComponent
  },
  {
    path: 'landing-page',
    component: LandingPageComponent,
  },

  // Protected routes (authentication required)
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'course/:id',
    component: VideoOutputComponent,
    canActivate: [AuthGuard]
  },
  
  {
    path: 'course-details/:id',
    component: CourseDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'course-details',
    component: CourseDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'player',
    component: PlayerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'schedule',
    component: ScheduleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'help-center',
    component: HelpCenterComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sheq-ig',
    component: SheqIgComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile-settings',
    component: ProfileSettingsComponent,
    canActivate: [AuthGuard]
  },

  // Employee routes
  {
    path: 'employee-dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['trainee', 'employee', 'manager', 'supervisor'] } // Add role-based access if using RoleGuard
  },
  // instructor routes
  {
    path: 'instructor-dashboard',
    component: InstructorDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'instructor',] } // Add role-based access if using RoleGuard
  },
  {
    path: 'instructor-overview',
    component: InstructorOverviewComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'instructor',] } // Add role-based access if using RoleGuard
  },
  {
    path: 'instructor-course-management',
    component: CourseManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'instructor',] } // Add role-based access if using RoleGuard
  },

  // Admin routes
  {
    path: 'admin-sheq',
    component: AdminSheqComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'create-training',
    component: CreateTrainingComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'instructor'] } // Allow both admin and instructor
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // Keep admin-only
  },
  {
    path: 'admin-overview',
    component: AdminOverviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user-management-a',
    component: UserManagementAComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'course-management',
    component: CourseManagementComponent,
    canActivate: [AuthGuard]
  },

  // Inventory system routes
  {
    path: 'fundo-isms',
    component: FundoIsmsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'inventory',
    component: InventoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'bin-counts',
    component: BinCountsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stock-adjustments',
    component: StockAdjustmentsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stock-overview',
    component: StockOverviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'warehouse',
    component: WarehouseComponent,
    canActivate: [AuthGuard]
  },

  // Category routes for industrial cleaning
  {
    path: 'category/facility-maintenance',
    component: HomeComponent, // You can create specific category components later
    canActivate: [AuthGuard]
  },
  {
    path: 'category/industrial-equipment',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'category/chemical-safety',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'category/environmental-compliance',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'category/waste-management',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'category/health-safety',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },

  // Test route for debugging navigation
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard]
  },

  // icd routes
  {
    path: 'main-layout',
    component: MainLayoutComponent,  
    children: [
      {
        path: 'icd-user-management',
        component: IcdUserManagementComponent
      },
      {
        path: 'icd-overview',
        component: IcdOverviewComponent
      },
      {
        path: 'icd-dashboard',
        component: IcdDashboardComponent
      },
      {
        path: 'inbox',
        component: InboxComponent
      },
      {
        path: 'compose',
        component: ComposeComponent
      },
      {
        path: 'icd-users',
        component: IcdUsersComponent
      },
      {
        path: 'icd-downloads',
        component: IcdDownloadsComponent
      },
      {
        path: 'icd-draft',
        component: IcdDraftComponent
      },
      {
        path: 'icd-department-management',
        component: IcdDepartmentManagementComponent
      },
      {
        path: 'icd-document-management',
        component: IcdDocumentManagementComponent
      },
      {
        path: 'archived',
        component: ArchivedComponent
      },
      {
        path: 'icd-message-details/:id',
        component: IcdMessageDetailsComponent
      },
      {
        path: 'recycle',
        component: RecycleComponent
      },
      {
        path: 'sent',
        component: SentComponent
      },
      {
        path: 'icd-profile-settings',
        component: IcdProfileSettingsComponent
      },

    ]
  },
  {
    path: 'icd',
    component: IcdComponent  //landing-page
  },
  {
    path: 'icd-log-in',
    component: IcdLogInComponent
  },
  {
    path: 'icd-sign-up',
    component: IcdSignUpComponent
  },
  
 

  // Add video-output route if not already present
  {
    path: 'video-output',
    component: VideoOutputComponent,
    canActivate: [AuthGuard]
  },

  // Fallback route
  
];


