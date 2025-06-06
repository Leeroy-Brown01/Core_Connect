import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">Test Component</h1>
      <p class="mb-4">If you can see this, navigation is working!</p>
      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-semibold mb-2">Current User Info:</h2>
        <p><strong>Email:</strong> {{ currentUser?.email || 'None' }}</p>
        <p><strong>Role:</strong> {{ currentUser?.role || 'None' }}</p>
        <p><strong>UID:</strong> {{ currentUser?.uid || 'None' }}</p>
      </div>
      <button 
        (click)="goHome()" 
        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Go to Home
      </button>
    </div>
  `
})
export class TestComponent {
  currentUser = this.authService.getCurrentUser();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('🧪 Test Component loaded with user:', this.currentUser?.email);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
