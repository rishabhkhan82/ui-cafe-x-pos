import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-view-access',
  standalone: true,
  templateUrl: './no-view-access.component.html',
  styleUrl: './no-view-access.component.css'
})
export class NoViewAccessComponent {
  @Input() title = 'Access Denied';
  @Input() message = "You don't have permission to view this page.";
  @Input() icon = 'fa-lock';
}
