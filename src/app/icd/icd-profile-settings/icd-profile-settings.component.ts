import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icd-profile-settings',
  imports: [CommonModule],
  templateUrl: './icd-profile-settings.component.html',
  styleUrl: './icd-profile-settings.component.scss'
})
export class IcdProfileSettingsComponent {
  activeSection = 'edit-profile';

  profileSections = [
    {
      id: 'edit-profile',
      name: 'Profile',
      description: 'Personal info'
    },
    {
      id: 'password',
      name: 'Password',
      description: 'Security'
    }
  ];

  selectSection(sectionId: string): void {
    this.activeSection = sectionId;
  }
}
