import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdOverviewComponent } from './icd-overview.component';

describe('IcdOverviewComponent', () => {
  let component: IcdOverviewComponent;
  let fixture: ComponentFixture<IcdOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
