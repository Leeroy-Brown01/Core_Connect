import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-log-in',
  imports: [CommonModule, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent implements OnInit {
  @ViewChild('loginForm') loginForm: NgForm;
  submitted = false;
  loading = false;
  loginError: string = '';
  private returnUrl: string = '/home';
  
  user = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return url from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    // Only check if user is already authenticated if we have a valid auth state
    // Remove automatic navigation - let user manually navigate after login
    this.authService.currentUser$.subscribe(user => {
      if (user && this.authService.isAuthenticated()) {
        console.log('User already authenticated but not auto-redirecting');
        // Optional: Show a message that user is already logged in
      }
    });
  }

  async onSubmit(form: NgForm) {
    this.submitted = true;
    this.loginError = '';
    
    if (form.valid) {
      this.loading = true;
      
      try {
        const { email, password } = this.user;
        
        if (!email || !password) {
          this.loginError = 'Please enter your email and password.';
          this.loading = false;
          return;
        }

        console.log('Attempting to sign in user:', email);
        
        // Sign in and get user data immediately
        const userData = await this.authService.signIn(email, password);
        
        console.log('Login successful, user data:', userData);
        
        // Navigate to return URL or home
        this.router.navigate([this.returnUrl]);
        
      } catch (error: any) {
        console.error('Login error:', error);
        this.loginError = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    }
  }

  private getErrorMessage(error: any): string {
    console.log('Error code:', error.code);
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return error.message || 'An error occurred during login. Please try again.';
    }
  }

  navigateTo(route: string): void {
    if (route === 'CreateAccount') {
      this.router.navigate(['/create-user-account']);
    }
  }

  // Method to handle forgot password (for future implementation)
  onForgotPassword() {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked');
  }

  // Add manual navigation method
  proceedToHome() {
    this.router.navigate(['/home'], { replaceUrl: true });
  }
}
