import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdProfileSettingsComponent } from './icd-profile-settings.component';

describe('IcdProfileSettingsComponent', () => {
  let component: IcdProfileSettingsComponent;
  let fixture: ComponentFixture<IcdProfileSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdProfileSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
