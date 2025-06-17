import { Component } from '@angular/core';
import { IcdSignUpComponent } from './icd-sign-up/icd-sign-up.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-icd',
  imports: [],
  templateUrl: './icd.component.html',
  styleUrl: './icd.component.scss'
})
export class IcdComponent {

  constructor(private router: Router) {}

  navigateTo(route: string): void{
  this.router.navigate([route]);
  }

}
