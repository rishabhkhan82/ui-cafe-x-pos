import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-ons-mobile',
  standalone: true,
  imports: [],
  templateUrl: './add-ons-mobile.component.html'
})
export class AddOnsMobileComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/owner-dashboard-mobile']);
  }
}
