import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss'],
  providers: [AuthGuard],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'my-pos';
  showNavbar = true;

  

  private routerSubscription: Subscription | null = null;
  private hasInitialRedirectHandled = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to router events to track route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavbarVisibility(event.url);
      });

    // Set initial navbar visibility based on current route
    this.updateNavbarVisibility(this.router.url);

    // FIXED: Wait for auth initialization before handling routes
    this.authService.authInitialized$.pipe(
      filter(initialized => initialized),
      take(1)
    ).subscribe(() => {
      if (!this.hasInitialRedirectHandled) {
        this.handleInitialRoute();
        this.hasInitialRedirectHandled = true;
      }
    });

    console.log('🚀 App component initialized, waiting for Firebase auth...');
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateNavbarVisibility(url: string) {
    // Extract the base path (remove query params and fragments)
    const basePath = url.split('?')[0].split('#')[0];
    
    

    console.log('Current route:', basePath, 'Show navbar:', this.showNavbar);
  }

  private handleInitialRoute() {
    const currentRoute = this.router.url;
    const user = this.authService.getCurrentUser();
    
    console.log('🔍 Handling initial route - Route:', currentRoute, 'User:', user ? user.email : 'No user');
    
    
    
}
}
