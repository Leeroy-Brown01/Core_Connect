
// Import Angular testing utilities
import { ComponentFixture, TestBed } from '@angular/core/testing';

// Import the component to be tested
import { UserListComponent } from './user-list.component';

describe('UserListComponent', () => { // Test suite for UserListComponent
  let component: UserListComponent; // Holds the component instance
  let fixture: ComponentFixture<UserListComponent>; // Test fixture for accessing DOM and component

  beforeEach(async () => {
    // Set up the testing environment for each test
    await TestBed.configureTestingModule({
      imports: [UserListComponent] // Import the component for testing (standalone)
    })
    .compileComponents(); // Compile the component and its template

    fixture = TestBed.createComponent(UserListComponent); // Create a fixture for the component
    component = fixture.componentInstance; // Get the component instance
    fixture.detectChanges(); // Trigger initial data binding and lifecycle hooks
  });

  it('should create', () => {
    // Test if the UserListComponent instance is created successfully
    expect(component).toBeTruthy(); // Assert that the component exists
  });
});
