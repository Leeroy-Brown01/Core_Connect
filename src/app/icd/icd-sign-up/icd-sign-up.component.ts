import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-icd-sign-up',
  imports: [],
  templateUrl: './icd-sign-up.component.html',
  styleUrl: './icd-sign-up.component.scss'
})
export class IcdSignUpComponent {

  constructor(private router: Router) {}

  navigateTo(route: string): void{
  this.router.navigate([route]);
  }

}
