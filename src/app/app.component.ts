import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from './components/toast/toast.component';
import { AuthGuard } from './guards/auth.guard';
import { NavBarComponent } from './sheq-ig/nav-bar/nav-bar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavBarComponent, RouterOutlet, FormsModule, ToastComponent],
  template: `
    <app-nav-bar *ngIf="showNavbar"></app-nav-bar>
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
  styleUrls: ['./app.component.scss'],
  providers: [AuthGuard],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'my-pos';
  showNavbar = true;

  // Routes where navbar should be hidden
  private hideNavbarRoutes = [
    '/get-started',
    '/landing-page',
    '/log-in',
    '/create-user-account',
    '/video-output'
  ];

  private routerSubscription: Subscription | null = null;

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

    // Handle initial route based on auth state from Firestore
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      const currentRoute = this.router.url;
      console.log('App init - Current route:', currentRoute, 'User:', user ? user.email : 'No user');
      
      // If user is authenticated and on login page, they can stay or manually navigate
      if (user && this.authService.isAuthenticatedSync() && (currentRoute === '/log-in' || currentRoute === '/login' || currentRoute === '/')) {
        console.log('Authenticated user on login page - letting them choose to continue');
        // Don't auto-redirect, let user manually continue
      }
      // If user is not authenticated and not on login/register pages, redirect to login
      else if (!user && !currentRoute.includes('log-in') && !currentRoute.includes('create-user-account')) {
        console.log('Unauthenticated user, redirecting to login');
        this.router.navigate(['/log-in'], { replaceUrl: true });
      }
    });

    // AuthService is initialized in constructor, just ensure it's injected
    this.authService.waitForAuthInitialization().then(() => {
      console.log('Firebase Auth initialized');
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateNavbarVisibility(url: string) {
    // Extract the base path (remove query params and fragments)
    const basePath = url.split('?')[0].split('#')[0];
    
    // Check if current route should hide navbar
    this.showNavbar = !this.hideNavbarRoutes.some(route => {
      // Exact match for most routes
      if (basePath === route) {
        return true;
      }
      
      // Special handling for video-output with dynamic routes like /course/:id
      if (route === '/video-output' && (basePath.startsWith('/course/') || basePath === '/video-output')) {
        return true;
      }
      
      return false;
    });

    console.log('Current route:', basePath, 'Show navbar:', this.showNavbar);
  }
}
