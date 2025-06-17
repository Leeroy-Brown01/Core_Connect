import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdDepartmentManagementComponent } from './icd-department-management.component';

describe('IcdDepartmentManagementComponent', () => {
  let component: IcdDepartmentManagementComponent;
  let fixture: ComponentFixture<IcdDepartmentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdDepartmentManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdDepartmentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
