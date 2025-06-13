import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-icd-log-in',
  imports: [],
  templateUrl: './icd-log-in.component.html',
  styleUrl: './icd-log-in.component.scss'
})
export class IcdLogInComponent {

  constructor(private router: Router){}

  navigateTo(router: string): void {
    this.router.navigate([router]);
  }


}
