import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CrudService } from '../../../services/crud.service';
import { LoadingService } from '../../../services/loading.service';
import { ValidationService } from '../../../services/validation.service';
import { NotificationService } from '../../../services/notification.service';
import { Restaurant } from '../../../services/mock-data.service';
import { State } from '../../../interfaces';

@Component({
  selector: 'app-cafe-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cafe-signup.component.html',
  styleUrl: './cafe-signup.component.css'
})
export class CafeSignupComponent implements OnInit, AfterViewInit {
  signupForm: Partial<Restaurant> = {
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    description: '',
    address: '',
    city: '',
    state: 0,
    pincode: 0,
    gst_number: '',
    license_number: '',
    status: 'PENDING_VERIFICATION',
    is_active: false,
    subscription_plan: '',
    subscription_start_date: null,
    subscription_end_date: null,
    lat: 0,
    lng: 0,
    logo_image: '',
    banner_image: '',
    is_gst: false,
    gst_percentage: ''
  };

  states: State[] = [];
  loading = false;
  submitted = false;
  submittedRestaurantName = '';
  fieldErrors: { [key: string]: string } = {};
  gstPercentageOptions: { value: number; label: string }[] = [
    { value: 0, label: '0% (Nil)' },
    { value: 5, label: '5%' },
    { value: 12, label: '12%' },
    { value: 18, label: '18% (Most Common)' },
    { value: 28, label: '28%' }
  ];

  steps = [
    {
      icon: 'fas fa-pen-to-square',
      title: 'Sign Up',
      description: 'Fill in your cafe/restaurant details in the form and submit your application.'
    },
    {
      icon: 'fas fa-magnifying-glass',
      title: 'Get Review, Credentials & QR Codes via Email (within 24 hours)',
      description: 'Once your application is approved, we will send you the login credentials and QR codes to your owner email address.'
    },
    {
      icon: 'fas fa-right-to-bracket',
      title: 'Sign In',
      description: 'Log in with the credentials we send to your email address.'
    },
    {
      icon: 'fas fa-crown',
      title: 'Subscribe to Your Plan',
      description: 'Choose a subscription plan that fits your business needs.'
    },
    {
      icon: 'fas fa-rocket',
      title: 'Ready to Go!',
      description: 'Start managing your cafe/restaurant menu, orders, staff and more with Cafe-X POS.'
    }
  ];

  constructor(
    private router: Router,
    private crudService: CrudService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadStates();
  }

  ngAfterViewInit(): void {
    const tawkScript = document.createElement('script');
    tawkScript.type = 'text/javascript';
    tawkScript.innerHTML = `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/6a4b31a82734a21d4f1ae144/default';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `;
    document.head.appendChild(tawkScript);
  }

  loadStates(): void {
    this.crudService.getStates({ isActive: true, page: 0, size: 0 }).subscribe({
      next: (response: any) => {
        const data = response.data || response || [];
        this.states = data.map((state: any) => ({
          id: state.id,
          name: state.name,
          key: state.key,
          description: state.description,
          is_active: state.is_active ?? state.isActive ?? true,
          display_order: state.display_order ?? state.displayOrder ?? 0,
          created_by: state.created_by ?? state.createdBy ?? '',
          updated_by: state.updated_by ?? state.updatedBy ?? '',
          created_at: state.created_at ? new Date(state.created_at) : new Date(),
          updated_at: state.updated_at ? new Date(state.updated_at) : new Date()
        }));
      },
      error: (error: any) => {
        console.error('Error loading states:', error);
      }
    });
  }

  validateName(): void {
    const result = this.validationService.name(this.signupForm.name || '', 'Cafe/Restaurant Name');
    if (!result.isValid) {
      this.fieldErrors['name'] = result.message!;
    } else {
      delete this.fieldErrors['name'];
    }
  }

  validateEmail(): void {
    const result = this.validationService.email(this.signupForm.email || '');
    if (!result.isValid) {
      this.fieldErrors['email'] = result.message!;
    } else {
      delete this.fieldErrors['email'];
    }
  }

  validatePhone(): void {
    const result = this.validationService.phone(this.signupForm.phone || '');
    if (!result.isValid) {
      this.fieldErrors['phone'] = result.message!;
    } else {
      delete this.fieldErrors['phone'];
    }
  }

  validateOwnerName(): void {
    const result = this.validationService.name(this.signupForm.owner_name || '', 'Owner Name');
    if (!result.isValid) {
      this.fieldErrors['owner_name'] = result.message!;
    } else {
      delete this.fieldErrors['owner_name'];
    }
  }

  validateOwnerEmail(): void {
    const result = this.validationService.email(this.signupForm.owner_email || '');
    if (!result.isValid) {
      this.fieldErrors['owner_email'] = result.message!;
    } else {
      delete this.fieldErrors['owner_email'];
    }
  }

  validateOwnerPhone(): void {
    const result = this.validationService.phone(this.signupForm.owner_phone || '');
    if (!result.isValid) {
      this.fieldErrors['owner_phone'] = result.message!;
    } else {
      delete this.fieldErrors['owner_phone'];
    }
  }

  validateCity(): void {
    const result = this.validationService.required(this.signupForm.city || '', 'City');
    if (!result.isValid) {
      this.fieldErrors['city'] = result.message!;
    } else {
      delete this.fieldErrors['city'];
    }
  }

  validateState(): void {
    if (!this.signupForm.state || this.signupForm.state === 0) {
      this.fieldErrors['state'] = 'Please select a state';
    } else {
      delete this.fieldErrors['state'];
    }
  }

  validatePincode(): void {
    const result = this.validationService.pincode(this.signupForm.pincode?.toString() || '');
    if (!result.isValid) {
      this.fieldErrors['pincode'] = result.message!;
    } else {
      delete this.fieldErrors['pincode'];
    }
  }

  validateAddress(): void {
    const result = this.validationService.required(this.signupForm.address || '', 'Address');
    if (!result.isValid) {
      this.fieldErrors['address'] = result.message!;
    } else {
      delete this.fieldErrors['address'];
    }
  }

  validateDescription(): void {
    const result = this.validationService.required(this.signupForm.description || '', 'Description');
    if (!result.isValid) {
      this.fieldErrors['description'] = result.message!;
    } else {
      delete this.fieldErrors['description'];
    }
  }

  validateGstNumber(): void {
    if (this.signupForm.gst_number && this.signupForm.gst_number.trim() !== '') {
      if (this.signupForm.gst_number.length !== 15) {
        this.fieldErrors['gst_number'] = 'GST number must be 15 characters';
      } else {
        delete this.fieldErrors['gst_number'];
      }
    } else {
      delete this.fieldErrors['gst_number'];
    }
  }

  validateLicenseNumber(): void {
    if (this.signupForm.license_number && this.signupForm.license_number.trim() !== '') {
      if (this.signupForm.license_number.trim().length < 5) {
        this.fieldErrors['license_number'] = 'License number must be at least 5 characters';
      } else {
        delete this.fieldErrors['license_number'];
      }
    } else {
      delete this.fieldErrors['license_number'];
    }
  }

  validateGstPercentage(): void {
    if (this.signupForm.is_gst && !this.signupForm.gst_percentage) {
      this.fieldErrors['gst_percentage'] = 'GST percentage is required when GST is enabled';
    } else {
      delete this.fieldErrors['gst_percentage'];
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.signupForm.lat = position.coords.latitude;
          this.signupForm.lng = position.coords.longitude;
        },
        (error: any) => {
          console.error('Error getting location:', error);
          this.notificationService.error('Location Error', 'Unable to retrieve your location. Please enter manually.');
        }
      );
    } else {
      this.notificationService.error('Geolocation Not Supported', 'Your browser does not support geolocation.');
    }
  }

  onSubmit(): void {
    this.fieldErrors = {};

    this.validateName();
    this.validateEmail();
    this.validatePhone();
    this.validateOwnerName();
    this.validateOwnerEmail();
    this.validateOwnerPhone();
    this.validateCity();
    this.validateState();
    this.validatePincode();
    this.validateAddress();
    this.validateDescription();
    this.validateGstNumber();
    this.validateLicenseNumber();
    this.validateGstPercentage();

    const hasErrors = Object.keys(this.fieldErrors).length > 0;
    if (hasErrors) {
      const errorMessages = Object.values(this.fieldErrors);
      this.notificationService.error('Validation Error', errorMessages.join('. '));
      return;
    }

    this.submitForm();
  }

  private submitForm(): void {
    this.loading = true;
    this.loadingService.show();

    const payload: any = {
      name: this.signupForm.name,
      email: this.signupForm.email,
      phone: this.signupForm.phone,
      owner_name: this.signupForm.owner_name,
      owner_email: this.signupForm.owner_email,
      owner_phone: this.signupForm.owner_phone,
      description: this.signupForm.description,
      address: this.signupForm.address,
      city: this.signupForm.city,
      state: this.signupForm.state,
      pincode: Number(this.signupForm.pincode),
      status: 'PENDING_VERIFICATION',
      is_active: false,
      is_gst: this.signupForm.is_gst || false,
      subscription_plan: '',
      subscription_start_date: null,
      subscription_end_date: null,
      created_by: 0,
      updated_by: 0,
      lat: Number(this.signupForm.lat) || 0,
      lng: Number(this.signupForm.lng) || 0
    };

    if (this.signupForm.gst_number && this.signupForm.gst_number.trim() !== '') {
      payload.gst_number = this.signupForm.gst_number;
    }
    if (this.signupForm.gst_percentage && this.signupForm.gst_percentage !== '') {
      payload.gst_percentage = this.signupForm.gst_percentage;
    }
    if (this.signupForm.license_number && this.signupForm.license_number.trim() !== '') {
      payload.license_number = this.signupForm.license_number;
    }
    if (this.signupForm.logo_image && this.signupForm.logo_image.trim() !== '') {
      payload.logo_image = this.signupForm.logo_image;
    }
    if (this.signupForm.banner_image && this.signupForm.banner_image.trim() !== '') {
      payload.banner_image = this.signupForm.banner_image;
    }

    this.crudService.createRestaurant(payload).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.loadingService.hide();
        this.submitted = true;
        this.submittedRestaurantName = this.signupForm.name || '';
        this.resetForm();
        this.notificationService.success('Application Submitted', 'Your cafe/restaurant application has been submitted successfully.');
      },
      error: (error: any) => {
        this.loading = false;
        this.loadingService.hide();
        console.error('Error submitting signup:', error);
        const apiMessage = error.error?.message || 'Failed to submit application. Please try again.';

        const apiFieldErrors = error.error?.fieldErrors as Record<string, string[]> | undefined;
        if (apiFieldErrors) {
          Object.entries(apiFieldErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              this.fieldErrors[field] = messages[0];
            }
          });
        }

        this.notificationService.error('Submission Failed', apiMessage);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/admin/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  onLogoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.signupForm.logo_image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onBannerFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.signupForm.banner_image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.signupForm.logo_image = '';
  }

  removeBanner(): void {
    this.signupForm.banner_image = '';
  }

  private resetForm(): void {
    this.signupForm = {
      name: '',
      email: '',
      phone: '',
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      description: '',
      address: '',
      city: '',
      state: 0,
      pincode: 0,
      gst_number: '',
      license_number: '',
      status: 'PENDING_VERIFICATION',
      is_active: false,
      subscription_plan: '',
      subscription_start_date: null,
      subscription_end_date: null,
      lat: 0,
      lng: 0,
      logo_image: '',
      banner_image: '',
      is_gst: false,
      gst_percentage: ''
    };
    this.fieldErrors = {};
  }
}
