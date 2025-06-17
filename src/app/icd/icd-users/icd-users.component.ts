import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-icd-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-users.component.html',
  styleUrl: './icd-users.component.scss'
})
export class IcdUsersComponent {

  // Department filter options
  selectedDepartment = 'all';
  departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'admin', label: 'Administration' }
  ];
}
