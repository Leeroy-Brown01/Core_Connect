
// Import Angular core and router modules
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take, timeout, filter } from 'rxjs/operators';
// Import the authentication service
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root' // This guard is provided at the root level (singleton)
})
export class AuthGuard implements CanActivate {

  // Inject AuthService for authentication state and Router for navigation
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Determines if a route can be activated (accessed) by the user.
   * Checks for public routes, waits for auth initialization, and verifies authentication.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('🔒 AuthGuard: Checking access to:', state.url); // Log the route being checked
    
    // List of routes that do not require authentication
    const publicRoutes = ['/log-in', '/create-user-account', '/get-started', '/landing-page'];
    // If the requested route is public, allow access immediately
    if (publicRoutes.some(publicRoute => state.url.startsWith(publicRoute))) {
      console.log('✅ AuthGuard: Public route, access granted');
      return true;
    }
    
    // For protected routes, wait for authentication initialization
    return this.authService.authInitialized$.pipe(
      filter(initialized => initialized), // Only proceed when auth is initialized
      take(1), // Only take the first value
      switchMap(() => {
        // Now check if the user is authenticated
        return this.authService.currentUser$.pipe(
          take(1), // Only take the first user value
          map(user => {
            if (user) {
              // If user is authenticated, allow access
              console.log('✅ AuthGuard: Authenticated user, access granted to:', state.url);
              return true;
            } else {
              // If not authenticated, redirect to login with returnUrl
              console.log('❌ AuthGuard: No authenticated user, redirecting to login');
              this.router.navigate(['/log-in'], { 
                queryParams: { returnUrl: state.url }, // Pass the attempted URL for redirect after login
                replaceUrl: true 
              });
              return false;
            }
          })
        );
      }),
      timeout(10000) // Prevent hanging forever; error if auth takes too long
    );
  }
}
