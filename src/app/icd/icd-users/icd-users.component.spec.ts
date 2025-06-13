import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdUsersComponent } from './icd-users.component';

describe('IcdUsersComponent', () => {
  let component: IcdUsersComponent;
  let fixture: ComponentFixture<IcdUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
