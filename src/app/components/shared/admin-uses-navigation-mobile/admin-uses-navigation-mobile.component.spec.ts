import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsesNavigationMobileComponent } from './admin-uses-navigation-mobile.component';

describe('AdminUsesNavigationMobileComponent', () => {
  let component: AdminUsesNavigationMobileComponent;
  let fixture: ComponentFixture<AdminUsesNavigationMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsesNavigationMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUsesNavigationMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
