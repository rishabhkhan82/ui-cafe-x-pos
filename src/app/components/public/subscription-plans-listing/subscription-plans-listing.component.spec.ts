import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionPlansListingComponent } from './subscription-plans-listing.component';

describe('SubscriptionPlansListingComponent', () => {
  let component: SubscriptionPlansListingComponent;
  let fixture: ComponentFixture<SubscriptionPlansListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionPlansListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionPlansListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
