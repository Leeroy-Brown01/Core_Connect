import { ComponentFixture, TestBed } from '@angular/core/testing'; // Angular testing utilities
import { MainLayoutComponent } from './main-layout.component'; // Component under test

// Test suite for MainLayoutComponent
describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent; // Instance of the component
  let fixture: ComponentFixture<MainLayoutComponent>; // Test fixture for the component

  // Runs before each test in this suite
  beforeEach(async () => {
    // Configure the testing module with the component to test
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent]
    })
    .compileComponents(); // Compile template and CSS

    // Create the component fixture and instance
    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  // Basic test to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
