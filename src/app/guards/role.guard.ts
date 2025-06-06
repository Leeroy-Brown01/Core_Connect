import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[] | undefined;
    
    // If no roles are specified in route data, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('🔓 RoleGuard: No role restrictions for:', state.url);
      return true;
    }

    console.log('🔒 RoleGuard: Checking roles for:', state.url, 'Required:', requiredRoles);

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          console.log('❌ RoleGuard: No authenticated user');
          this.router.navigate(['/log-in'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        const userRole = user.role;
        const hasRequiredRole = requiredRoles.includes(userRole);

        if (hasRequiredRole) {
          console.log('✅ RoleGuard: Access granted. User role:', userRole);
          return true;
        } else {
          console.log('❌ RoleGuard: Access denied. User role:', userRole, 'Required:', requiredRoles);
          this.router.navigate(['/unauthorized']); // You can create this route or redirect to dashboard
          return false;
        }
      })
    );
  }
}
