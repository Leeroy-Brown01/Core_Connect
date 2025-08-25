import { Component } from '@angular/core'; // Angular core import
import { UserCardComponent } from './user-card/user-card.component'; // User card child component

// Component decorator defines metadata for the UserListComponent
@Component({
  selector: 'app-user-list', // Selector to use this component in templates
  standalone: true, // Allows this component to be used without a module
  imports: [
    UserCardComponent // Import the UserCardComponent for use in the template
  ],
  templateUrl: './user-list.component.html', // HTML template for the component
  styleUrl: './user-list.component.scss' // SCSS styles for the component
})
export class UserListComponent {
  // Array of user objects to display in the user list
  users: any[] = [
    {
      name: 'Leeroy Brown', // User's name
      position: 'I.T', // User's position
      imageUrl: 'assets/images/moslim.jfif', // Path to user's image
      admin: true // User is an admin
    },
    {
      name: 'Mutsa mhlanga',
      position: 'Team Lead',
      systemAdmin: true, // User is a system admin
      TeamLead: true, // User is a Team Lead
      // No imageUrl provided
    },
    {
      name: 'simba',
      position: 'I.T',
      imageUrl: 'assets/images/white-dude-02.webp',
      QualityAssurer: true, // User is a Quality Assurer
    },
    {
      name: 'Peter Brown',
      position: 'I.T',
      imageUrl: 'assets/images/white-dude.webp',
      SoftwareTester: true, // User is a Software Tester
    },
    {
      name: 'Kuziva Makusha',
      position: 'I.T',
      imageUrl: 'assets/images/black-dude-01.jpg',
      admin: true, // User is an admin
    },
    {
      name: 'myla Nyandoro',
      position: 'I.T',
      admin: true, // User is an admin
      // No imageUrl provided
    },
    {
      name: 'Frank Nyandoro',
      position: 'I.T',
      SoftwareDeveloper: true, // User is a Software Developer
      // No imageUrl provided
    },
  ];
}
