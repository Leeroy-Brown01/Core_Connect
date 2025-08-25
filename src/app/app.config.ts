import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // Angular application config
import { provideRouter } from '@angular/router'; // Router provider
import { routes } from './app.routes'; // Application routes
import { provideHttpClient } from '@angular/common/http'; // HTTP client provider
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; // Firebase app provider
import { provideAuth, getAuth } from '@angular/fire/auth'; // Firebase Auth provider
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // Firestore provider
import { environment } from '../environments/environment'; // Environment config (Firebase settings)
import { getStorage, provideStorage } from '@angular/fire/storage'; // Firebase Storage provider

// Main application configuration object
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Set up Angular router with app routes
    provideHttpClient(), // Enable HTTP client for API calls
    provideFirebaseApp(() => initializeApp(environment.firebase)), // Initialize Firebase app with environment config
    provideAuth(() => getAuth()), // Provide Firebase Authentication
    provideFirestore(() => getFirestore()), // Provide Firestore database
    provideStorage(() => getStorage()) // Provide Firebase Storage
  ]
};
