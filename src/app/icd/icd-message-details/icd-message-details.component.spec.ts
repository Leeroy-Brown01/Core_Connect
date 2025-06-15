import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdMessageDetailsComponent } from './icd-message-details.component';

describe('IcdMessageDetailsComponent', () => {
  let component: IcdMessageDetailsComponent;
  let fixture: ComponentFixture<IcdMessageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdMessageDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdMessageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
