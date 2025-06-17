import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdComponent } from './icd.component';

describe('IcdComponent', () => {
  let component: IcdComponent;
  let fixture: ComponentFixture<IcdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
