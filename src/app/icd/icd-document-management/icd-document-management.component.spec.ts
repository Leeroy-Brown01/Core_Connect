import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdDocumentManagementComponent } from './icd-document-management.component';

describe('IcdDocumentManagementComponent', () => {
  let component: IcdDocumentManagementComponent;
  let fixture: ComponentFixture<IcdDocumentManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdDocumentManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdDocumentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
