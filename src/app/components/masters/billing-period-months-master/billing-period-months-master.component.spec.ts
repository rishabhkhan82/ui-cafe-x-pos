import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPeriodMonthsMasterComponent } from './billing-period-months-master.component';

describe('BillingPeriodMonthsMasterComponent', () => {
  let component: BillingPeriodMonthsMasterComponent;
  let fixture: ComponentFixture<BillingPeriodMonthsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingPeriodMonthsMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingPeriodMonthsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
