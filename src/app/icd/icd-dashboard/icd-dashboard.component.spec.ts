import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdDashboardComponent } from './icd-dashboard.component';

describe('IcdDashboardComponent', () => {
  let component: IcdDashboardComponent;
  let fixture: ComponentFixture<IcdDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
