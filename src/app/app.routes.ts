
import { Routes } from '@angular/router'; // Angular router types
import { AuthGuard } from './guards/auth.guard'; // Route guard for authentication
// Import all components used in routes
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

// Main application routes configuration
export const routes: Routes = [
  // Public route: redirect root path to login
  {
    path: '',
    redirectTo: '/icd-log-in',
    pathMatch: 'full'
  },

  // Main layout route with child routes for authenticated sections
  {
    path: 'main-layout',
    component: MainLayoutComponent,  // Main layout wrapper
    children: [
      // User management
      {
        path: 'icd-user-management',
        component: IcdUserManagementComponent
      },
      // Overview dashboard
      {
        path: 'icd-overview',
        component: IcdOverviewComponent
      },
      // Dashboard
      {
        path: 'icd-dashboard',
        component: IcdDashboardComponent
      },
      // Inbox
      {
        path: 'inbox',
        component: InboxComponent
      },
      // Compose message
      {
        path: 'compose',
        component: ComposeComponent
      },
      // Users list
      {
        path: 'icd-users',
        component: IcdUsersComponent
      },
      // Downloads
      {
        path: 'icd-downloads',
        component: IcdDownloadsComponent
      },
      // Drafts
      {
        path: 'icd-draft',
        component: IcdDraftComponent
      },
      // Department management
      {
        path: 'icd-department-management',
        component: IcdDepartmentManagementComponent
      },
      // Document management
      {
        path: 'icd-document-management',
        component: IcdDocumentManagementComponent
      },
      // Archived messages
      {
        path: 'archived',
        component: ArchivedComponent
      },
      // Message details (with dynamic ID)
      {
        path: 'icd-message-details/:id',
        component: IcdMessageDetailsComponent
      },
      // Recycle bin
      {
        path: 'recycle',
        component: RecycleComponent
      },
      // Sent messages
      {
        path: 'sent',
        component: SentComponent
      },
      // Profile settings
      {
        path: 'icd-profile-settings',
        component: IcdProfileSettingsComponent
      },
    ]
  },
  // ICD landing page
  {
    path: 'icd',
    component: IcdComponent  // Landing page
  },
  // Login page
  {
    path: 'icd-log-in',
    component: IcdLogInComponent
  },
  // Sign up page
  {
    path: 'icd-sign-up',
    component: IcdSignUpComponent
  },
  // Fallback route (add a wildcard route here if needed)
];


