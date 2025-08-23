import { Component } from '@angular/core';
import { UserCardComponent } from './user-card/user-card.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    UserCardComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  users:any[]=[
    {
      name:'Leeroy Brown',
      position:'I.T',
      imageUrl:'assets/images/moslim.jfif',
      admin: true
    },
    {
      name:'Mutsa mhlanga',
      position:'Supervisor',
      systemAdmin: true,
      supervisor: true,

    },
    {
      name:'simba',
      position:'I.T',
      imageUrl:'assets/images/white-dude-02.webp',
      client: true,
    },
    {
      name:'Peter Brown',
      position:'I.T',
      imageUrl:'assets/images/white-dude.webp',
      siteManager: true,
    },
    {
      name:'Kuziva Makusha',
      position:'I.T',
      imageUrl:'assets/images/black-dude-01.jpg',
      admin: true,
    },
    {
      name:'myla Nyandoro',
      position:'I.T',
      admin: true,
    },
    {
      name:'Frank Nyandoro',
      position:'I.T',
      security: true,
    },

  ];


}
