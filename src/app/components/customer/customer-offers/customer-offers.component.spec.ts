import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerOffersComponent } from './customer-offers.component';

describe('CustomerOffersComponent', () => {
  let component: CustomerOffersComponent;
  let fixture: ComponentFixture<CustomerOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerOffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
