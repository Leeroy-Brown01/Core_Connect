import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IcdOverviewComponent } from '../icd-overview/icd-overview.component';
import { IcdUserManagementComponent } from '../icd-user-management/icd-user-management.component';
import { IcdDocumentManagementComponent } from '../icd-document-management/icd-document-management.component';
import { IcdDepartmentManagementComponent } from '../icd-department-management/icd-department-management.component';

@Component({
  selector: 'app-icd-dashboard',
  imports: [CommonModule, FormsModule, IcdOverviewComponent, IcdUserManagementComponent, IcdDocumentManagementComponent, IcdDepartmentManagementComponent],
  templateUrl: './icd-dashboard.component.html',
  styleUrl: './icd-dashboard.component.scss'
})
export class IcdDashboardComponent {
  activeTab: string = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'user-management', label: 'User Management' },
    { id: 'document-management', label: 'Document Management' },
    { id: 'department-management', label: 'Department Management' }
  ];

  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
