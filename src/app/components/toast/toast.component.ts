
// Angular core imports for component and lifecycle hooks
import { Component, OnInit, OnDestroy } from '@angular/core';
// Import CommonModule for Angular directives like ngIf and ngFor
import { CommonModule } from '@angular/common';
// RxJS Subscription for managing observable streams
import { Subscription } from 'rxjs';
// ToastService provides toast notifications, Toast is the toast data type
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast', // Selector for this toast component
  standalone: true, // This is a standalone Angular component
  imports: [CommonModule], // Import CommonModule for ngIf, ngFor, etc.
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <!-- Loop through all toasts and display them -->
      <div *ngFor="let toast of toasts" 
           class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
           [class.bg-green-50]="toast.type === 'success'"
           [class.bg-red-50]="toast.type === 'error'"
           [class.bg-yellow-50]="toast.type === 'warning'"
           [class.bg-blue-50]="toast.type === 'info'">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Show icon based on toast type -->
              <svg *ngIf="toast.type === 'success'" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg *ngIf="toast.type === 'error'" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg *ngIf="toast.type === 'warning'" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <svg *ngIf="toast.type === 'info'" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <!-- Toast message with color based on type -->
              <p class="text-sm font-medium"
                 [class.text-green-900]="toast.type === 'success'"
                 [class.text-red-900]="toast.type === 'error'"
                 [class.text-yellow-900]="toast.type === 'warning'"
                 [class.text-blue-900]="toast.type === 'info'">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <!-- Close button to remove the toast -->
              <button 
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                (click)="removeToast(toast.id)">
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = []; // Holds the list of current toasts to display
  private subscription: Subscription = new Subscription(); // Subscription to the toast observable

  constructor(private toastService: ToastService) {} // Inject the ToastService

  ngOnInit(): void {
    // Subscribe to the toast observable to update the list when toasts change
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscription.unsubscribe();
  }

  removeToast(id: string): void {
    // Remove a toast by its id
    this.toastService.remove(id);
  }
}
