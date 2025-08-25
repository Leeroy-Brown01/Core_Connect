
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define the possible theme types for the application
export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root' // Makes this service available app-wide
})
export class ThemeService {
  // Key used for storing theme preference in localStorage
  private readonly THEME_KEY = 'app-theme';
  // Default theme if none is set
  private readonly DEFAULT_THEME: Theme = 'light';
  
  // BehaviorSubject to hold the current theme state (reactive)
  private currentThemeSubject = new BehaviorSubject<Theme>(this.DEFAULT_THEME);
  // Observable for components to subscribe to theme changes
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // On service creation, initialize theme from localStorage or system preference
    this.initializeTheme();
  }


  
  // Get the current theme value (synchronous)

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }


  
  //  Returns true if the current theme is dark mode
 
  isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }


  
  //  Toggle the theme between light and dark
  
  toggleTheme(): void {
    const newTheme: Theme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }


  /**
   * Set a specific theme, update DOM, and persist preference
   * @param theme The theme to set ('light' or 'dark')
   */
  setTheme(theme: Theme): void {
    console.log(`🎨 Setting theme to: ${theme}`);
    // Update the BehaviorSubject so all subscribers are notified
    this.currentThemeSubject.next(theme);
    // Apply theme classes and attributes to DOM
    this.applyThemeToDOM(theme);
    // Save theme preference to localStorage
    this.saveThemeToStorage(theme);
    console.log(`✅ Theme applied: ${theme}`);
  }


  /**
   * Initialize theme from localStorage or system preference
   * Loads saved theme if available, otherwise uses system preference
   */
  private initializeTheme(): void {
    // Try to get theme from localStorage first
    const savedTheme = this.getThemeFromStorage();
    if (savedTheme) {
      console.log(`📱 Loading saved theme: ${savedTheme}`);
      this.setTheme(savedTheme);
      return;
    }
    // If no saved theme, use system preference
    const systemPrefersDark = this.getSystemThemePreference();
    const initialTheme: Theme = systemPrefersDark ? 'dark' : 'light';
    console.log(`🖥️ Using system theme preference: ${initialTheme}`);
    this.setTheme(initialTheme);
  }


  /**
   * Apply theme classes and data attributes to DOM elements for styling
   * @param theme The theme to apply
   */
  private applyThemeToDOM(theme: Theme): void {
    // Get the root HTML element
    const documentElement = document.documentElement;
    // Add/remove theme classes for global CSS
    if (theme === 'dark') {
      documentElement.classList.add('dark');
      documentElement.classList.remove('light');
    } else {
      documentElement.classList.add('light');
      documentElement.classList.remove('dark');
    }
    // Add/remove theme classes for body (for more specific CSS)
    const bodyElement = document.body;
    if (bodyElement) {
      if (theme === 'dark') {
        bodyElement.classList.add('dark-theme');
        bodyElement.classList.remove('light-theme');
      } else {
        bodyElement.classList.add('light-theme');
        bodyElement.classList.remove('dark-theme');
      }
    }
    // Set a data attribute for CSS targeting
    documentElement.setAttribute('data-theme', theme);
  }


  /**
   * Save theme preference to localStorage for persistence
   * @param theme The theme to save
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      // Warn if saving fails (e.g., private mode)
      console.warn('⚠️ Failed to save theme to localStorage:', error);
    }
  }


  /**
   * Retrieve theme preference from localStorage
   * @returns The saved theme or null if not found
   */
  private getThemeFromStorage(): Theme | null {
    try {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme as Theme;
      }
      return null;
    } catch (error) {
      // Warn if reading fails
      console.warn('⚠️ Failed to read theme from localStorage:', error);
      return null;
    }
  }


  /**
   * Check the system's preferred color scheme using a media query
   * @returns true if system prefers dark mode
   */
  private getSystemThemePreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  //  * Listen for system theme changes and update theme if user hasn't set a preference
  listenForSystemThemeChanges(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Listen for system theme changes
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't manually set a preference
        const savedTheme = this.getThemeFromStorage();
        if (!savedTheme) {
          const systemTheme: Theme = e.matches ? 'dark' : 'light';
          console.log(`🔄 System theme changed to: ${systemTheme}`);
          this.setTheme(systemTheme);
        }
      });
    }
  }



  //   Reset theme to system preference and clear user preference
  
  resetToSystemTheme(): void {
    // Remove saved theme from localStorage
    try {
      localStorage.removeItem(this.THEME_KEY);
    } catch (error) {
      // Warn if clearing fails
      console.warn('⚠️ Failed to clear theme from localStorage:', error);
    }
    // Set theme to system preference
    const systemPrefersDark = this.getSystemThemePreference();
    const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light';
    console.log(`🔄 Resetting to system theme: ${systemTheme}`);
    this.setTheme(systemTheme);
  }


  // Get the list of available themes
  getAvailableThemes(): Theme[] {
    return ['light', 'dark'];
  }


  /**
   * Get a user-friendly display name for a theme
   * @param theme The theme value
   * @returns Display name string
   */
  getThemeDisplayName(theme: Theme): string {
    return theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }
}
