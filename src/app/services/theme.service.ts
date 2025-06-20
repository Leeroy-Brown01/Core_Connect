import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DEFAULT_THEME: Theme = 'light';
  
  // Current theme state
  private currentThemeSubject = new BehaviorSubject<Theme>(this.DEFAULT_THEME);
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    // Initialize theme from localStorage or default
    this.initializeTheme();
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.currentThemeSubject.value === 'dark';
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.isDarkMode() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    console.log(`🎨 Setting theme to: ${theme}`);
    
    // Update the subject
    this.currentThemeSubject.next(theme);
    
    // Apply theme to DOM
    this.applyThemeToDOM(theme);
    
    // Save to localStorage
    this.saveThemeToStorage(theme);
    
    console.log(`✅ Theme applied: ${theme}`);
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    // Try to get theme from localStorage first
    const savedTheme = this.getThemeFromStorage();
    
    if (savedTheme) {
      console.log(`📱 Loading saved theme: ${savedTheme}`);
      this.setTheme(savedTheme);
      return;
    }

    // Check system preference if no saved theme
    const systemPrefersDark = this.getSystemThemePreference();
    const initialTheme: Theme = systemPrefersDark ? 'dark' : 'light';
    
    console.log(`🖥️ Using system theme preference: ${initialTheme}`);
    this.setTheme(initialTheme);
  }

  /**
   * Apply theme classes to DOM elements
   */
  private applyThemeToDOM(theme: Theme): void {
    // Apply to document element (html)
    const documentElement = document.documentElement;
    
    if (theme === 'dark') {
      documentElement.classList.add('dark');
      documentElement.classList.remove('light');
    } else {
      documentElement.classList.add('light');
      documentElement.classList.remove('dark');
    }

    // Apply to body element for additional styling
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

    // Set data attribute for CSS targeting
    documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.warn('⚠️ Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Get theme preference from localStorage
   */
  private getThemeFromStorage(): Theme | null {
    try {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme as Theme;
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Failed to read theme from localStorage:', error);
      return null;
    }
  }

  /**
   * Get system theme preference using CSS media query
   */
  private getSystemThemePreference(): boolean {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  /**
   * Listen for system theme changes
   */
  listenForSystemThemeChanges(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Add listener for system theme changes
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

  /**
   * Reset theme to system preference
   */
  resetToSystemTheme(): void {
    // Clear saved preference
    try {
      localStorage.removeItem(this.THEME_KEY);
    } catch (error) {
      console.warn('⚠️ Failed to clear theme from localStorage:', error);
    }

    // Apply system theme
    const systemPrefersDark = this.getSystemThemePreference();
    const systemTheme: Theme = systemPrefersDark ? 'dark' : 'light';
    
    console.log(`🔄 Resetting to system theme: ${systemTheme}`);
    this.setTheme(systemTheme);
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): Theme[] {
    return ['light', 'dark'];
  }

  /**
   * Get theme display name
   */
  getThemeDisplayName(theme: Theme): string {
    return theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }
}
