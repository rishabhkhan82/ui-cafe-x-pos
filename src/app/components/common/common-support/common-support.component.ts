import { Component } from '@angular/core';

@Component({
  selector: 'app-common-support',
  standalone: true,
  imports: [],
  templateUrl: './common-support.component.html',
  styleUrl: './common-support.component.css'
})
export class CommonSupportComponent {
  supportDetails = {
    mobile: '+1 (555) 123-4567',
    email: 'support@cafe-x-pos.com',
    whatsapp: '+1 (555) 987-6543',
    socialMedia: {
      facebook: 'https://facebook.com/cafe-x-pos',
      twitter: 'https://twitter.com/cafe_x_pos',
      instagram: 'https://instagram.com/cafe_x_pos'
    },
    availability: '24/7',
    priority: 'Your service is our priority'
  };
}
