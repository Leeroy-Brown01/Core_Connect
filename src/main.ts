import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

console.log('🚀 Starting Angular application...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('✅ Angular application started successfully');
  })
  .catch(err => {
    console.error('❌ Error starting Angular application:', err);
  });
