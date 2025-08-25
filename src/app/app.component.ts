import { Component, OnInit, OnDestroy } from '@angular/core'; // Angular core imports
import { CommonModule } from '@angular/common'; // Common Angular directives
import { RouterOutlet, Router, NavigationEnd } from '@angular/router'; // Router utilities
import { Subscription } from 'rxjs'; // For managing subscriptions
import { filter, take } from 'rxjs/operators'; // RxJS operators
import { FormsModule } from '@angular/forms'; // For template-driven forms
import { ToastComponent } from './components/toast/toast.component'; // Toast notification component
import { AuthGuard } from './guards/auth.guard'; // Route guard
import { AuthService } from './services/auth.service'; // Authentication service

@Component({
  selector: 'app-root', // Root selector for the application
  standalone: true, // Allows this component to be used without a module
  imports: [CommonModule, RouterOutlet, FormsModule], // Import required modules
  template: `
    <router-outlet></router-outlet> // Placeholder for routed views
  `,
  styleUrls: ['./app.component.scss'], // Component styles
  providers: [AuthGuard], // Provide AuthGuard at the component level
})
export class AppComponent implements OnInit, OnDestroy {
  // Application title
  title = 'my-pos';
  // Controls visibility of the navigation bar
  showNavbar = true;

  // Subscription to router events
  private routerSubscription: Subscription | null = null;
  // Flag to ensure initial redirect logic only runs once
  private hasInitialRedirectHandled = false;

  // Inject router and authentication service
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Angular lifecycle hook: runs after component initialization
   * Sets up router event subscription and waits for auth initialization
   */
  ngOnInit() {
    // Subscribe to router events to track route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavbarVisibility(event.url);
      });

    // Set initial navbar visibility based on current route
    this.updateNavbarVisibility(this.router.url);

    // Wait for authentication initialization before handling routes
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

  /**
   * Angular lifecycle hook: runs when component is destroyed
   * Cleans up router event subscription
   */
  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Updates the visibility of the navigation bar based on the current route
   * @param url The current route URL
   */
  private updateNavbarVisibility(url: string) {
    // Extract the base path (remove query params and fragments)
    const basePath = url.split('?')[0].split('#')[0];
    // You can add logic here to hide/show navbar for specific routes
    console.log('Current route:', basePath, 'Show navbar:', this.showNavbar);
  }

  /**
   * Handles initial route logic after authentication is initialized
   * Used for redirecting or setting up the initial state
   */
  private handleInitialRoute() {
    const currentRoute = this.router.url;
    const user = this.authService.getCurrentUser();
    console.log('🔍 Handling initial route - Route:', currentRoute, 'User:', user ? user.email : 'No user');
    // Add logic here for initial redirects or state setup
  }
}
