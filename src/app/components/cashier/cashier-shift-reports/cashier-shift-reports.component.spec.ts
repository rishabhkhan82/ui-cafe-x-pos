import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierShiftReportsComponent } from './cashier-shift-reports.component';

describe('CashierShiftReportsComponent', () => {
  let component: CashierShiftReportsComponent;
  let fixture: ComponentFixture<CashierShiftReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierShiftReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierShiftReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
