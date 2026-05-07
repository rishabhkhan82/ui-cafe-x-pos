import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-customer-cart',
  standalone: true,
  imports: [],
  templateUrl: './customer-cart.component.html',
  styleUrl: './customer-cart.component.css'
})
export class CustomerCartComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
