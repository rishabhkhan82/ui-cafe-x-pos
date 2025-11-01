import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierInterfaceComponent } from './cashier-interface.component';

describe('CashierInterfaceComponent', () => {
  let component: CashierInterfaceComponent;
  let fixture: ComponentFixture<CashierInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashierInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
