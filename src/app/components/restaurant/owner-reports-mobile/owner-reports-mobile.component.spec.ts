import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerReportsMobileComponent } from './owner-reports-mobile.component';

describe('OwnerReportsMobileComponent', () => {
  let component: OwnerReportsMobileComponent;
  let fixture: ComponentFixture<OwnerReportsMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerReportsMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerReportsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
