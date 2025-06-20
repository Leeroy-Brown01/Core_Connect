import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

// Hide initial loader function
declare global {
  interface Window {
    hideLoader?: () => void;
  }
}

if (environment.production) {
  enableProdMode();
}

// Initialize Firebase
const app = initializeApp(environment.firebase);

console.log('🚀 Starting Angular application...');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => app),
    provideAuth(() => getAuth(app)),
    provideFirestore(() => getFirestore(app))
  ]
})
  .then(() => {
    console.log('✅ Angular application started successfully');
    
    // Hide the initial loader
    if (window.hideLoader) {
      window.hideLoader();
    }
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('angular-loaded');
  })
  .catch(err => {
    console.error('❌ Error starting Angular application:', err);
    
    // Still hide loader even if there's an error
    if (window.hideLoader) {
      window.hideLoader();
    }
    
    // Show error message
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; text-align: center; padding: 2rem; background: #fef2f2;">
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px;">
            <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Application Error</h1>
            <p style="color: #6b7280; margin-bottom: 2rem;">The application failed to start. This might be due to browser compatibility issues.</p>
            <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; font-size: 0.875rem; color: #374151;">
              <strong>Error:</strong> ${err.message || 'Unknown error occurred'}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                Refresh Page
              </button>
              <button onclick="localStorage.clear(); location.reload()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                Clear Cache & Refresh
              </button>
            </div>
          </div>
        </div>
      `;
    }
  });
