import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-owner-plans-mobile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-plans-mobile.component.html',
  styleUrl: './owner-plans-mobile.component.css'
})
export class OwnerPlansMobileComponent {
  showPlan = false;

  constructor(public router: Router) {}

  toggleView() {
    this.showPlan = !this.showPlan;
  }
}
