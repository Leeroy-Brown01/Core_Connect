
// Import Angular testing utilities
import { TestBed } from '@angular/core/testing';
// Import CanActivateFn type for guard testing
import { CanActivateFn } from '@angular/router';

// Import the AuthGuard class to be tested
import { AuthGuard } from './auth.guard';

describe('authGuard', () => { // Test suite for AuthGuard
  // Helper function to execute the guard in the correct injection context
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => {
        // Get an instance of AuthGuard from the Angular injector
        const guard = TestBed.inject(AuthGuard);
        // Call the canActivate method with the provided parameters
        return guard.canActivate(...guardParameters);
      });

  beforeEach(() => {
    // Set up the testing environment before each test
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    // Test if the executeGuard function is defined and truthy
    expect(executeGuard).toBeTruthy();
  });
});
