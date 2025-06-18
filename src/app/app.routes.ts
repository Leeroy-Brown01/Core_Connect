import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
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
    redirectTo: '/icd-log-in',
    pathMatch: 'full'
  },

  // icd routes
  {
    path: 'main-layout',
    component: MainLayoutComponent,  
    children: [
      {
        path: '',
        redirectTo: 'icd-dashboard',
        pathMatch: 'full'
      },
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
      }
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
  }
];


