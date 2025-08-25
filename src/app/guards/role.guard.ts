
// Import Angular core and router modules
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
// Import the authentication service
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root' // This guard is provided at the root level (singleton)
})
export class RoleGuard implements CanActivate {

  // Inject AuthService for authentication state and Router for navigation
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Determines if a route can be activated (accessed) by the user.
   * Checks for required roles in route data and verifies the user's role.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Get required roles from route data (if any)
    const requiredRoles = route.data['roles'] as string[] | undefined;
    
    // If no roles are specified in route data, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('🔓 RoleGuard: No role restrictions for:', state.url);
      return true;
    }

    // Log the roles being checked
    console.log('🔒 RoleGuard: Checking roles for:', state.url, 'Required:', requiredRoles);

    // Check the current user's role
    return this.authService.currentUser$.pipe(
      take(1), // Only take the first user value
      map(user => {
        if (!user) {
          // If not authenticated, redirect to login
          console.log('❌ RoleGuard: No authenticated user');
          this.router.navigate(['/log-in'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        const userRole = user.role; // Get the user's role
        const hasRequiredRole = requiredRoles.includes(userRole); // Check if user has a required role

        if (hasRequiredRole) {
          // User has the required role, allow access
          console.log('✅ RoleGuard: Access granted. User role:', userRole);
          return true;
        } else {
          // User does not have the required role, redirect to unauthorized page
          console.log('❌ RoleGuard: Access denied. User role:', userRole, 'Required:', requiredRoles);
          this.router.navigate(['/unauthorized']); // You can create this route or redirect to dashboard
          return false;
        }
      })
    );
  }
}
