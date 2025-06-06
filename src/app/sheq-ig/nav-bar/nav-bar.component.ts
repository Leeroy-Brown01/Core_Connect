import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserData } from '../../services/auth.service';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  read: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  currentUser: UserData | null = null;
  searchQuery: string = '';
  logoExists: boolean = false;
  
  // Dropdown states
  exploreDropdownOpen = false;
  messagesDropdownOpen = false;
  notificationsDropdownOpen = false;
  userDropdownOpen = false;
  
  // Tooltip states
  showMessagesTooltip = false;
  
  // Notification count
  notificationCount = 5;
  
  // Sample data
  messages: Message[] = [
    {
      id: '1',
      sender: 'John Doe',
      content: 'Hey, can you check the inventory report?',
      time: '2 min ago',
      read: false
    },
    {
      id: '2',
      sender: 'Sarah Wilson',
      content: 'Training session scheduled for tomorrow',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      sender: 'Mike Johnson',
      content: 'Stock adjustment completed',
      time: '3 hours ago',
      read: true
    }
  ];
  
  notifications: Notification[] = [
    {
      id: '1',
      title: 'Stock Alert',
      message: 'Low stock detected in warehouse A',
      time: '5 min ago',
      read: false,
      type: 'warning'
    },
    {
      id: '2',
      title: 'Training Complete',
      message: 'Safety training module completed',
      time: '1 hour ago',
      read: false,
      type: 'success'
    },
    {
      id: '3',
      title: 'System Update',
      message: 'System will be updated tonight at 2 AM',
      time: '2 hours ago',
      read: true,
      type: 'info'
    },
    {
      id: '4',
      title: 'New User',
      message: 'New user account created',
      time: '1 day ago',
      read: true,
      type: 'info'
    },
    {
      id: '5',
      title: 'Backup Complete',
      message: 'Daily backup completed successfully',
      time: '1 day ago',
      read: true,
      type: 'success'
    }
  ];

  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to current user
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('NavBar: Current user updated:', user?.fullName || 'None');
    });

    // Check if logo exists (you can implement this check)
    this.checkLogoExists();
    
    // Calculate unread notification count
    this.updateNotificationCount();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private checkLogoExists() {
    // You can implement actual logo checking logic here
    // For now, we'll assume it doesn't exist
    this.logoExists = false;
  }

  private updateNotificationCount() {
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  // Search functionality
  onSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search logic here
      // You might want to navigate to a search results page
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  // Dropdown toggles
  toggleExploreDropdown() {
    this.exploreDropdownOpen = !this.exploreDropdownOpen;
    this.closeOtherDropdowns('explore');
  }

  toggleMessagesDropdown() {
    this.messagesDropdownOpen = !this.messagesDropdownOpen;
    this.closeOtherDropdowns('messages');
    this.showMessagesTooltip = false;
  }

  toggleNotificationsDropdown() {
    this.notificationsDropdownOpen = !this.notificationsDropdownOpen;
    this.closeOtherDropdowns('notifications');
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    this.closeOtherDropdowns('user');
  }

  // Close specific dropdowns
  closeExploreDropdown() {
    this.exploreDropdownOpen = false;
  }

  closeMessagesDropdown() {
    this.messagesDropdownOpen = false;
  }

  closeNotificationsDropdown() {
    this.notificationsDropdownOpen = false;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  // Close other dropdowns when one is opened
  private closeOtherDropdowns(except: string) {
    if (except !== 'explore') this.exploreDropdownOpen = false;
    if (except !== 'messages') this.messagesDropdownOpen = false;
    if (except !== 'notifications') this.notificationsDropdownOpen = false;
    if (except !== 'user') this.userDropdownOpen = false;
  }

  // Sign out functionality with proper Firebase integration
  async signOut() {
    try {
      console.log('🔐 NavBar: Starting sign out process...');
      
      // Show loading state if needed
      // this.isSigningOut = true;
      
      // Use AuthService which handles Firebase Auth signOut
      await this.authService.signOut();
      
      console.log('✅ NavBar: User signed out successfully');
      
      // AuthService.signOut() already handles:
      // 1. Firebase Auth signOut
      // 2. Clearing currentUser subject
      // 3. Navigating to login page
      
    } catch (error: any) {
      console.error('❌ NavBar: Error during sign out:', error);
      
      // Even if Firebase signOut fails, clear local state and redirect
      this.currentUser = null;
      this.router.navigate(['/log-in'], { replaceUrl: true });
      
      // You could show an error message to user here
      // this.toastService.showError('Sign out failed. You have been logged out locally.');
    }
  }

  // Navigate to appropriate dashboard based on user role
  navigateToUserDashboard() {
    if (!this.currentUser) {
      console.warn('⚠️ NavBar: No current user for dashboard navigation');
      this.router.navigate(['/log-in']);
      return;
    }

    const userRole = this.currentUser.role.toLowerCase();
    console.log('🔄 NavBar: Navigating user to dashboard, role:', userRole);

    switch (userRole) {
      case 'admin':
        console.log('👑 NavBar: Navigating admin to admin dashboard');
        this.router.navigate(['/admin-dashboard']);
        break;
        
      case 'trainee':
      case 'employee':
        console.log('👨‍💼 NavBar: Navigating employee/trainee to employee dashboard');
        this.router.navigate(['/employee-dashboard']);
        break;
        
      case 'manager':
      case 'supervisor':
        // You can add manager/supervisor dashboard later
        console.log('👨‍💼 NavBar: Navigating manager/supervisor to employee dashboard (fallback)');
        this.router.navigate(['/employee-dashboard']);
        break;
        
      default:
        console.warn('⚠️ NavBar: Unknown user role, redirecting to home:', userRole);
        this.router.navigate(['/home']);
        break;
    }
  }

  // Helper method to get dashboard route based on role
  private getDashboardRoute(role: string): string {
    const normalizedRole = role.toLowerCase();
    
    switch (normalizedRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'trainee':
      case 'employee':
        return '/employee-dashboard';
      case 'manager':
      case 'supervisor':
        return '/employee-dashboard'; // Can be changed to '/manager-dashboard' when implemented
      default:
        return '/home';
    }
  }

  // Check if current user has admin privileges
  isCurrentUserAdmin(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'admin';
  }

  // Check if current user is trainee/employee
  isCurrentUserEmployee(): boolean {
    const role = this.currentUser?.role?.toLowerCase();
    return role === 'trainee' || role === 'employee';
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.updateNotificationCount();
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string) {
    const message = this.messages.find(m => m.id === messageId);
    if (message && !message.read) {
      message.read = true;
    }
  }

  // Add helper methods for notification and message counts
  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getUnreadMessagesCount(): number {
    return this.messages.filter(m => !m.read).length;
  }

  getNotificationCountInWords(): string {
    const count = this.getUnreadNotificationsCount();
    const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    
    if (count <= 10) {
      return numbers[count];
    }
    return count.toString();
  }

  // Get current user dashboard type for display
  getCurrentUserDashboardType(): string {
    if (!this.currentUser) return 'User';
    
    const role = this.currentUser.role.toLowerCase();
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'trainee':
        return 'Trainee';
      case 'employee':
        return 'Employee';
      case 'manager':
        return 'Manager';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'User';
    }
  }

  // Navigate to instructor panel (admin dashboard)
  navigateToInstructorPanel() {
    if (this.isCurrentUserAdmin()) {
      console.log('🎓 NavBar: Navigating to instructor panel (admin dashboard)');
      this.router.navigate(['/admin-dashboard']);
    } else {
      console.warn('⚠️ NavBar: Non-admin user attempted to access instructor panel');
      // Could show a toast message here
    }
  }

  // Helper method to navigate to category pages
  navigateToCategory(categorySlug: string) {
    console.log('📚 NavBar: Navigating to category:', categorySlug);
    this.router.navigate(['/category', categorySlug]);
  }

  // Navigate to profile settings
  navigateToProfile() {
    console.log('🔧 NavBar: Navigating to profile settings');
    this.router.navigate(['/profile-settings']);
    this.closeUserDropdown();
  }
}
