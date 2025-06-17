import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IcdDownloadsComponent } from './icd-downloads.component';

describe('IcdDownloadsComponent', () => {
  let component: IcdDownloadsComponent;
  let fixture: ComponentFixture<IcdDownloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcdDownloadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IcdDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
