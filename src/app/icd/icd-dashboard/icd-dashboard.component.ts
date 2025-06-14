import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IcdOverviewComponent } from '../icd-overview/icd-overview.component';
import { IcdDocumentManagementComponent } from '../icd-document-management/icd-document-management.component';
import { IcdDepartmentManagementComponent } from '../icd-department-management/icd-department-management.component';
import { InboxComponent } from '../inbox/inbox.component';
import { SentComponent } from '../sent/sent.component';
import { ArchivedComponent } from '../archived/archived.component';
import { RecycleComponent } from '../recycle/recycle.component';
import { IcdUserManagementComponent } from "../icd-user-management/icd-user-management.component";

@Component({
  selector: 'app-icd-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    IcdOverviewComponent,
    IcdDocumentManagementComponent,
    IcdDepartmentManagementComponent,
    InboxComponent,
    SentComponent,
    ArchivedComponent,
    RecycleComponent,
    IcdUserManagementComponent
],
  templateUrl: './icd-dashboard.component.html',
  styleUrl: './icd-dashboard.component.scss'
})
export class IcdDashboardComponent {
  @ViewChild('tabContainer', { static: false }) tabContainer!: ElementRef;

  // User information
  currentUser = {
    firstName: 'John',
    lastName: 'Doe',
    role: 'Medical Administrator'
  };

  activeTab: string = 'overview';

  tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'icd-user-management', label: 'Users' },
    { id: 'icd-document-management', label: 'Documents' },
    { id: 'icd-department-management', label: 'Departments' },
    { id: 'inbox', label: 'Inbox' },
    { id: 'sent', label: 'Sent' },
    { id: 'archived', label: 'Archived' },
    { id: 'recycled', label: 'Recycled' }
  ];

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
