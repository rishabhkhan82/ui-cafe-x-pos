import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingCycleMasterComponent } from './billing-cycle-master.component';

describe('BillingCycleMasterComponent', () => {
  let component: BillingCycleMasterComponent;
  let fixture: ComponentFixture<BillingCycleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingCycleMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingCycleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
