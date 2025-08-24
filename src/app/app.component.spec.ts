
// Import Angular testing utilities
import { TestBed } from '@angular/core/testing';
// Import the component to be tested
import { AppComponent } from './app.component';

describe('AppComponent', () => { // Test suite for AppComponent
  beforeEach(async () => {
    // Set up the testing environment for each test
    await TestBed.configureTestingModule({
      imports: [AppComponent], // Import the component for testing (standalone)
    }).compileComponents(); // Compile the component and its template
  });

  it('should create the app', () => {
    // Test if the AppComponent instance is created successfully
    const fixture = TestBed.createComponent(AppComponent); // Create a fixture for the component
    const app = fixture.componentInstance; // Get the component instance
    expect(app).toBeTruthy(); // Assert that the component exists
  });

  it(`should have the 'my-pos' title`, () => {
    // Test if the title property is set correctly
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('my-pos'); // Assert the title value
  });

  it('should render title', () => {
    // Test if the title is rendered in the DOM
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Trigger change detection and render
    const compiled = fixture.nativeElement as HTMLElement; // Get the DOM element
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, my-pos'); // Assert the title is rendered in <h1>
  });
});
