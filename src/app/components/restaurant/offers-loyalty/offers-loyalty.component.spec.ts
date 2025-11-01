import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersLoyaltyComponent } from './offers-loyalty.component';

describe('OffersLoyaltyComponent', () => {
  let component: OffersLoyaltyComponent;
  let fixture: ComponentFixture<OffersLoyaltyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersLoyaltyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersLoyaltyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
