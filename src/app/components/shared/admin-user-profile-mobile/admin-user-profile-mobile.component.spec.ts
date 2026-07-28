import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserProfileMobileComponent } from './admin-user-profile-mobile.component';

describe('AdminUserProfileMobileComponent', () => {
  let component: AdminUserProfileMobileComponent;
  let fixture: ComponentFixture<AdminUserProfileMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserProfileMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserProfileMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
