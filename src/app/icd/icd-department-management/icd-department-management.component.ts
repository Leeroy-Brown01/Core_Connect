import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Department {
  id: string;
  name: string;
  manager: string;
  userCount: number;
  createdDate: Date;
}

@Component({
  selector: 'app-icd-department-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './icd-department-management.component.html',
  styleUrl: './icd-department-management.component.scss'
})
export class IcdDepartmentManagementComponent {
  searchQuery: string = '';
  sortBy: string = 'name';

  departments: Department[] = [
    {
      id: '1',
      name: 'Human Resources',
      manager: 'Sarah Johnson',
      userCount: 12,
      createdDate: new Date(2023, 5, 15)
    },
    {
      id: '2',
      name: 'Finance',
      manager: 'Michael Chen',
      userCount: 18,
      createdDate: new Date(2023, 3, 20)
    },
    {
      id: '3',
      name: 'IT Department',
      manager: 'Alex Rodriguez',
      userCount: 24,
      createdDate: new Date(2023, 1, 10)
    },
    {
      id: '4',
      name: 'Legal',
      manager: 'Emma Wilson',
      userCount: 8,
      createdDate: new Date(2023, 7, 8)
    },
    {
      id: '5',
      name: 'Operations',
      manager: 'David Brown',
      userCount: 35,
      createdDate: new Date(2023, 2, 25)
    },
    {
      id: '6',
      name: 'Marketing',
      manager: 'Lisa Davis',
      userCount: 15,
      createdDate: new Date(2023, 6, 12)
    }
  ];

  filteredDepartments: Department[] = [];

  ngOnInit(): void {
    this.filterDepartments();
  }

  filterDepartments(): void {
    let filtered = [...this.departments];
    
    if (this.searchQuery) {
      filtered = filtered.filter(dept => 
        dept.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        dept.manager.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'manager': return a.manager.localeCompare(b.manager);
        case 'userCount': return b.userCount - a.userCount;
        case 'created': return b.createdDate.getTime() - a.createdDate.getTime();
        default: return 0;
      }
    });
    
    this.filteredDepartments = filtered;
  }

  onSearchChange(): void { this.filterDepartments(); }
  onSortChange(): void { this.filterDepartments(); }

  // Department actions
  editDepartment(deptId: string): void {
    console.log('Edit department:', deptId);
  }

  viewDepartment(deptId: string): void {
    console.log('View department:', deptId);
  }

  deleteDepartment(deptId: string): void {
    console.log('Delete department:', deptId);
  }
}
