import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerScarQrComponent } from './customer-scar-qr.component';

describe('CustomerScarQrComponent', () => {
  let component: CustomerScarQrComponent;
  let fixture: ComponentFixture<CustomerScarQrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerScarQrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerScarQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
