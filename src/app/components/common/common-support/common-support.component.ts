import { Component, OnDestroy } from '@angular/core';
import { SystemConfigService, SystemSettings } from '../../../services/system-config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-common-support',
  standalone: true,
  imports: [],
  templateUrl: './common-support.component.html',
  styleUrl: './common-support.component.css'
})
export class CommonSupportComponent implements OnDestroy {
  supportDetails: any;
  private subscription: Subscription;

  constructor(private systemConfigService: SystemConfigService) {
    this.supportDetails = {
      siteName: this.systemConfigService.platformName,
      mobile: this.systemConfigService.supportPhone || '',
      email: this.systemConfigService.supportEmail || '',
      whatsapp: this.systemConfigService.supportPhone,
      socialMedia: {
        facebook: 'https://facebook.com/cafe-x-pos',
        twitter: 'https://twitter.com/cafe_x_pos',
        instagram: 'https://instagram.com/cafe_x_pos'
      },
      availability: '24/7',
      priority: 'Your service is our priority'
    };

    this.subscription = this.systemConfigService.settings$.subscribe((settings: SystemSettings | null) => {
      if (settings) {
        this.supportDetails = {
          ...this.supportDetails,
          siteName: settings.platform_name || this.supportDetails.siteName,
          mobile: settings.support_phone || this.supportDetails.mobile,
          email: settings.support_email || this.supportDetails.email
        };
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
