import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerDashboardMobileComponent } from './owner-dashboard-mobile.component';

describe('OwnerDashboardMobileComponent', () => {
  let component: OwnerDashboardMobileComponent;
  let fixture: ComponentFixture<OwnerDashboardMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerDashboardMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerDashboardMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
