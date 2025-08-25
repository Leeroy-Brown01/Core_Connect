
// Import Angular testing utilities
import { ComponentFixture, TestBed } from '@angular/core/testing';
// Import the component to be tested
import { ArchivedComponent } from './archived.component';

describe('ArchivedComponent', () => { // Test suite for ArchivedComponent
  let component: ArchivedComponent; // Holds the component instance
  let fixture: ComponentFixture<ArchivedComponent>; // Test fixture for accessing DOM and component

  beforeEach(async () => {
    // Set up the testing environment for each test
    await TestBed.configureTestingModule({
      imports: [ArchivedComponent] // Import the component for testing (standalone)
    })
    .compileComponents(); // Compile the component and its template

    fixture = TestBed.createComponent(ArchivedComponent); // Create a fixture for the component
    component = fixture.componentInstance; // Get the component instance
    fixture.detectChanges(); // Trigger initial data binding and lifecycle hooks
  });

  it('should create', () => {
    // Test if the ArchivedComponent instance is created successfully
    expect(component).toBeTruthy(); // Assert that the component exists
  });
});
