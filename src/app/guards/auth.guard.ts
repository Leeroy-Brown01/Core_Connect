import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take, timeout, filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('🔒 AuthGuard: Checking access to:', state.url);
    
    // Allow immediate access to public routes
    const publicRoutes = ['/log-in', '/create-user-account', '/get-started', '/landing-page'];
    if (publicRoutes.some(publicRoute => state.url.startsWith(publicRoute))) {
      console.log('✅ AuthGuard: Public route, access granted');
      return true;
    }
    
    // Wait for auth initialization, then check authentication
    return this.authService.authInitialized$.pipe(
      filter(initialized => initialized),
      take(1),
      switchMap(() => {
        return this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            if (user) {
              console.log('✅ AuthGuard: Authenticated user, access granted to:', state.url);
              return true;
            } else {
              console.log('❌ AuthGuard: No authenticated user, redirecting to login');
              this.router.navigate(['/log-in'], { 
                queryParams: { returnUrl: state.url },
                replaceUrl: true 
              });
              return false;
            }
          })
        );
      }),
      timeout(10000)
    );
  }
}
