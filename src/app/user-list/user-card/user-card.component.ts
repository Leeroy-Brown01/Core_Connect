import { Component, Input } from '@angular/core'; // Angular core imports

// Component decorator defines metadata for the UserCardComponent
@Component({
  selector: 'app-user-card', // Selector to use this component in templates
  standalone: true, // Allows this component to be used without a module
  imports: [
    // List any required Angular modules or components here
  ],
  templateUrl: './user-card.component.html', // HTML template for the component
  styleUrl: './user-card.component.scss' // SCSS styles for the component
})
export class UserCardComponent {
  // Input property to receive user data from parent component
  @Input() user: any = {};
}
