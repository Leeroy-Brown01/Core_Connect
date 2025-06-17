import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdLogInComponent } from './icd-log-in.component';

describe('IcdLogInComponent', () => {
  let component: IcdLogInComponent;
  let fixture: ComponentFixture<IcdLogInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdLogInComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdLogInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
