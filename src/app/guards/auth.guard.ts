import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take, timeout } from 'rxjs/operators';
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
    
    // Wait for auth initialization first, then check authentication
    return this.authService.authInitialized$.pipe(
      take(1), // Take only the first emission
      switchMap((initialized) => {
        console.log('🔒 AuthGuard: Auth initialized:', initialized);
        
        if (!initialized) {
          console.log('🔒 AuthGuard: Auth not initialized, blocking access');
          this.router.navigate(['/log-in'], { queryParams: { returnUrl: state.url } });
          return [false];
        }
        
        // Check current authentication state
        const currentUser = this.authService.getCurrentUser();
        const firebaseUser = this.authService.getFirebaseUser();
        
        console.log('🔒 AuthGuard: Current user:', currentUser?.email || 'None');
        console.log('🔒 AuthGuard: Firebase user exists:', !!firebaseUser);
        
        // If we have a current user, allow access
        if (currentUser) {
          console.log('✅ AuthGuard: Access granted to:', state.url);
          return [true];
        }
        
        // If no current user, check if we're still loading
        return this.authService.currentUser$.pipe(
          take(1),
          map(user => {
            if (user) {
              console.log('✅ AuthGuard: Access granted after user load to:', state.url);
              return true;
            } else {
              console.log('❌ AuthGuard: Access denied, redirecting to login from:', state.url);
              this.router.navigate(['/log-in'], { queryParams: { returnUrl: state.url } });
              return false;
            }
          })
        );
      }),
      timeout(5000), // 5 second timeout
      map(result => Array.isArray(result) ? result[0] : result)
    );
  }
}
