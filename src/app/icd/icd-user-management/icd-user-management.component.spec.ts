import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdUserManagementComponent } from './icd-user-management.component';

describe('IcdUserManagementComponent', () => {
  let component: IcdUserManagementComponent;
  let fixture: ComponentFixture<IcdUserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdUserManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
