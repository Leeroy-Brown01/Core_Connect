import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdDraftComponent } from './icd-draft.component';

describe('IcdDraftComponent', () => {
  let component: IcdDraftComponent;
  let fixture: ComponentFixture<IcdDraftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdDraftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
