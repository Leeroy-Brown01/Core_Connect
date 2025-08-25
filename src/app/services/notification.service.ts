// Angular service for managing in-app notifications and unread count
import { Injectable } from '@angular/core'; // Angular DI
import { BehaviorSubject, Observable } from 'rxjs'; // RxJS for state

// Interface representing a notification object
export interface Notification {
  id: number; // Unique notification ID
  title: string; // Notification title
  message: string; // Notification message body
  timestamp: string; // Timestamp of notification
  type: 'order' | 'system' | 'inventory' | 'alert'; // Notification type/category
  isRead: boolean; // Read/unread status
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Local cache of notifications
  private _notifications: Notification[] = [];
  // Observable subject for notifications list
  private notifications = new BehaviorSubject<Notification[]>([]);
  // Public observable for components to subscribe to
  notifications$ = this.notifications.asObservable();

  // Observable subject for unread notification count
  private unreadCount = new BehaviorSubject<number>(0);
  // Public observable for unread count
  unreadCount$ = this.unreadCount.asObservable();

  // Get the current notifications array (not reactive)
  getNotifications(): Notification[] {
    return this._notifications;
  }

  // Update the notifications list and unread count
  updateNotifications(notifications: Notification[]): void {
    this._notifications = notifications;
    this.notifications.next(notifications);
    this.updateUnreadCount(notifications);
  }

  // Update the unread count based on notifications array
  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter(n => !n.isRead).length;
    this.unreadCount.next(count);
  }
} 