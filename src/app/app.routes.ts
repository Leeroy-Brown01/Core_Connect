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

  // Admin routes
  {
    path: 'admin-sheq',
    component: AdminSheqComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } // Add role-based access if using RoleGuard
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

  // Add video-output route if not already present
  {
    path: 'video-output',
    component: VideoOutputComponent,
    canActivate: [AuthGuard]
  },

  // Fallback route
  
];


