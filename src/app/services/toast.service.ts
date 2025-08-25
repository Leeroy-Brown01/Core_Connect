import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Interface representing a toast notification
export interface Toast {
  id: string; // Unique identifier for the toast
  message: string; // The message to display
  type: 'success' | 'error' | 'warning' | 'info'; // Type of toast (affects styling)
  duration?: number; // How long the toast should be visible (ms)
}

@Injectable({
  providedIn: 'root' // Makes this service available app-wide
})
export class ToastService {
  // Holds the current list of toasts (reactive)
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  // Observable for components to subscribe to toast changes
  public toasts$ = this.toastsSubject.asObservable();

  constructor() {
    // Log service initialization
    console.log('ToastService initialized');
  }

  // Generate a unique ID for each toast
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Show a toast notification
   * @param message The message to display
   * @param type The type of toast (success, error, warning, info)
   * @param duration How long to show the toast (ms)
   */
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000): void {
    const toast: Toast = {
      id: this.generateId(), // Assign unique ID
      message,
      type,
      duration
    };
    // Add new toast to the list
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);
    console.log(`Toast shown: ${type.toUpperCase()} - ${message}`);
    // Automatically remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  /**
   * Show a success toast
   */
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error toast
   */
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info toast
   */
  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Remove a toast by its ID
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  /**
   * Remove all toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }
}
