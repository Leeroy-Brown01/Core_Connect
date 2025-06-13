import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdSignUpComponent } from './icd-sign-up.component';

describe('IcdSignUpComponent', () => {
  let component: IcdSignUpComponent;
  let fixture: ComponentFixture<IcdSignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdSignUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
