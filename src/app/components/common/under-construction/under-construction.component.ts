import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [],
  templateUrl: './under-construction.component.html',
  styleUrl: './under-construction.component.css'
})
export class UnderConstructionComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
