import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerStaffMobileComponent } from './owner-staff-mobile.component';

describe('OwnerStaffMobileComponent', () => {
  let component: OwnerStaffMobileComponent;
  let fixture: ComponentFixture<OwnerStaffMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerStaffMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerStaffMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
