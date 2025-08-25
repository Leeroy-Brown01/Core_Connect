import { ComponentFixture, TestBed } from '@angular/core/testing'; // Angular testing utilities
import { UserCardComponent } from './user-card.component'; // Component under test

// Test suite for UserCardComponent
describe('UserCardComponent', () => {
  let component: UserCardComponent; // Instance of the component
  let fixture: ComponentFixture<UserCardComponent>; // Test fixture for the component

  // Runs before each test in this suite
  beforeEach(async () => {
    // Configure the testing module with the component to test
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]
    })
    .compileComponents(); // Compile template and CSS

    // Create the component fixture and instance
    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  // Basic test to check if the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
