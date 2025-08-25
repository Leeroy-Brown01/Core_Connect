import { NgModule } from '@angular/core'; // Angular core module decorator
import { RouterModule, Routes } from '@angular/router'; // Angular router imports

// Define application routes here. Each route maps a URL path to a component.
const routes: Routes = [
  // Example: { path: 'home', component: HomeComponent }
];

@NgModule({
  // Import RouterModule and configure it with the routes for the root module
  imports: [RouterModule.forRoot(routes)],
  // Export RouterModule so it's available throughout the app
  exports: [RouterModule]
})
// Main routing module for the application
export class AppRoutingModule { }
