import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerOffersMobileComponent } from './owner-offers-mobile.component';

describe('OwnerOffersMobileComponent', () => {
  let component: OwnerOffersMobileComponent;
  let fixture: ComponentFixture<OwnerOffersMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerOffersMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerOffersMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
